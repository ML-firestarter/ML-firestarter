/**
 * Markdown plugins for Astro's Markdown engine (Sätteri), wired up in astro.config.mjs.
 * They keep notes looking the same on github.com and on the site.
 */
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import type { HastPluginDefinition, HastVisitorContext, MdastPluginDefinition } from 'satteri';
import { DEFAULT_LANG, ui, type Lang } from './i18n.ts';
import { noteUrl, relativeUrl, splitLang } from './paths.ts';

/** `$inline$` and `$$display$$` math, rendered with KaTeX at build time (no browser JavaScript). */
export const katexMath: MdastPluginDefinition = {
  name: 'ml-workout:katex',
  inlineMath: (node) => ({ type: 'html', value: renderMath(node.value, false) }),
  math: (node) => ({ type: 'html', value: renderMath(node.value, true) }),
};

function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'ignore' });
}

/** Language of the note being processed, from its file name (`sft.pl.md` is Polish). */
function noteLang(ctx: HastVisitorContext): Lang {
  return ctx.fileURL ? splitLang(path.basename(fileURLToPath(ctx.fileURL))).lang : DEFAULT_LANG;
}

/** A `# Heading` that opens a note becomes the page title, so it is removed from the body. */
export const dropLeadingH1: HastPluginDefinition = {
  name: 'ml-workout:drop-leading-h1',
  before(root, ctx) {
    const first = root.children.find((child) => !(child.type === 'text' && !child.value.trim()));
    if (first?.type === 'element' && first.tagName === 'h1') ctx.removeNode(first);
  },
};

const ALERT_MARKER = /^\[!(note|tip|important|warning|caution)\][ \t]*(?:\r?\n|$)/i;

/** GitHub alerts: a blockquote starting with `[!TIP]` (or NOTE, IMPORTANT, WARNING, CAUTION) becomes a callout. */
export const githubAlerts: HastPluginDefinition = {
  name: 'ml-workout:github-alerts',
  element: {
    filter: ['blockquote'],
    visit(node, ctx) {
      const paragraph = node.children.find((child) => child.type === 'element');
      if (paragraph?.type !== 'element' || paragraph.tagName !== 'p') return;
      const marker = paragraph.children[0];
      if (marker?.type !== 'text') return;
      const match = ALERT_MARKER.exec(marker.value);
      if (!match) return;

      const kind = match[1].toLowerCase() as keyof (typeof ui)[Lang]['alerts'];
      const rest = marker.value.slice(match[0].length);
      if (rest) ctx.setProperty(marker, 'value', rest);
      else if (paragraph.children.length > 1) ctx.removeNode(marker);
      else ctx.removeNode(paragraph);

      ctx.setProperty(node, 'className', ['callout', `callout-${kind}`]);
      ctx.prependChild(node, {
        type: 'element',
        tagName: 'p',
        properties: { className: ['callout-title'] },
        children: [{ type: 'text', value: ui[noteLang(ctx)].alerts[kind] }],
      });
    },
  },
};

/** The hidden "Footnotes" heading and the links back from each footnote, in the note's language. */
export const localizedFootnotes: HastPluginDefinition = {
  name: 'ml-workout:localized-footnotes',
  element: [
    {
      filter: ['h2'],
      visit(node, ctx) {
        if (node.properties?.id !== 'footnote-label') return;
        ctx.setProperty(node, 'children', [{ type: 'text', value: ui[noteLang(ctx)].footnotes }]);
      },
    },
    {
      filter: ['a'],
      visit(node, ctx) {
        const label = node.properties?.ariaLabel;
        if (node.properties?.dataFootnoteBackref === undefined || typeof label !== 'string') return;
        const reference = /\d+(?:-\d+)?$/.exec(label)?.[0]; // "Back to reference 1-2"
        if (reference) ctx.setProperty(node, 'ariaLabel', ui[noteLang(ctx)].backToReference(reference));
      },
    },
  ],
};

/**
 * Relative links between notes, like `[see](../02-foundations/01-intro.md#loss)`,
 * work on GitHub; this points them at the matching lesson page on the site too.
 * The new link is relative as well, so it stays in the language of the page
 * showing the note, even when that page shows an untranslated original.
 */
export function noteLinks(notesRoot: string): HastPluginDefinition {
  return {
    name: 'ml-workout:note-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const href = node.properties?.href;
        if (typeof href !== 'string' || !ctx.fileURL) return;
        if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) return; // external, absolute or same-page

        const hashAt = href.indexOf('#');
        const target = hashAt === -1 ? href : href.slice(0, hashAt);
        const hash = hashAt === -1 ? '' : href.slice(hashAt);
        const file = fileURLToPath(new URL(target, ctx.fileURL));
        const relative = insideNotes(notesRoot, file);
        if (relative === undefined) return;

        const isNote = /\.md$/i.test(target) || statSync(file, { throwIfNoEntry: false })?.isDirectory();
        if (!isNote) return;
        const from = noteUrl(insideNotes(notesRoot, fileURLToPath(ctx.fileURL)) ?? '');
        ctx.setProperty(node, 'href', relativeUrl(from, noteUrl(relative)) + hash);
      },
    },
  };
}

/** Path of `file` inside the notes folder, with forward slashes; undefined when it's outside. */
function insideNotes(notesRoot: string, file: string): string | undefined {
  const relative = path.relative(notesRoot, file).split(path.sep).join('/');
  return relative.startsWith('..') || path.isAbsolute(relative) ? undefined : relative;
}
