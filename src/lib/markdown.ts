/**
 * Markdown plugins for Astro's Markdown engine (Sätteri), wired up in astro.config.mjs.
 * They keep notes looking the same on github.com and on the site.
 */
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import type { HastPluginDefinition, MdastPluginDefinition } from 'satteri';
import { noteUrl } from './paths.ts';

/** `$inline$` and `$$display$$` math, rendered with KaTeX at build time (no browser JavaScript). */
export const katexMath: MdastPluginDefinition = {
  name: 'ml-workout:katex',
  inlineMath: (node) => ({ type: 'html', value: renderMath(node.value, false) }),
  math: (node) => ({ type: 'html', value: renderMath(node.value, true) }),
};

function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'ignore' });
}

/** A `# Heading` that opens a note becomes the page title, so it is removed from the body. */
export const dropLeadingH1: HastPluginDefinition = {
  name: 'ml-workout:drop-leading-h1',
  before(root, ctx) {
    const first = root.children.find((child) => !(child.type === 'text' && !child.value.trim()));
    if (first?.type === 'element' && first.tagName === 'h1') ctx.removeNode(first);
  },
};

const ALERT_TITLES: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
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

      const kind = match[1].toLowerCase();
      const rest = marker.value.slice(match[0].length);
      if (rest) ctx.setProperty(marker, 'value', rest);
      else if (paragraph.children.length > 1) ctx.removeNode(marker);
      else ctx.removeNode(paragraph);

      ctx.setProperty(node, 'className', ['callout', `callout-${kind}`]);
      ctx.prependChild(node, {
        type: 'element',
        tagName: 'p',
        properties: { className: ['callout-title'] },
        children: [{ type: 'text', value: ALERT_TITLES[kind] }],
      });
    },
  },
};

/**
 * Relative links between notes, like `[see](../02-foundations/01-intro.md#loss)`,
 * work on GitHub; this points them at the matching lesson page on the site too.
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
        const relative = path.relative(notesRoot, file).split(path.sep).join('/');
        if (relative.startsWith('..') || path.isAbsolute(relative)) return;

        const isNote = /\.md$/i.test(target) || statSync(file, { throwIfNoEntry: false })?.isDirectory();
        if (isNote) ctx.setProperty(node, 'href', noteUrl(relative) + hash);
      },
    },
  };
}
