/**
 * Markdown plugins for Astro's Markdown engine (Sätteri), wired up in astro.config.mjs.
 * They keep notes looking the same on github.com and on the site.
 */
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import type { HastNode, HastPluginDefinition, HastVisitorContext, MdastPluginDefinition } from 'satteri';
import { DEFAULT_LANG, ui, type Lang } from './i18n.ts';
import { isIndexFile, noteUrl, relativeUrl, splitLang, testUrl } from './paths.ts';

type Element = Extract<HastNode, { type: 'element' }>;
type Content = Element['children'][number];

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
 * Links between notes and tests work the same way: `tests/README.md` is the tests
 * overview and `tests/vocabulary/sft.md` the test for `notes/vocabulary/sft.md`.
 * The new link is relative as well, so it stays in the language of the page
 * showing the note, even when that page shows an untranslated original.
 */
export function noteLinks(roots: { notes: string; tests: string }): HastPluginDefinition {
  /** Language-neutral URL of the page made from a file or folder; undefined outside notes/ and tests/. */
  function pageUrl(file: string): string | undefined {
    const note = inside(roots.notes, file);
    if (note !== undefined) return noteUrl(note);
    const test = inside(roots.tests, file);
    return test === undefined ? undefined : testUrl(noteUrl(test));
  }

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
        const from = pageUrl(fileURLToPath(ctx.fileURL));
        const to = pageUrl(file);
        if (from === undefined || to === undefined) return;

        const isNote = /\.md$/i.test(target) || statSync(file, { throwIfNoEntry: false })?.isDirectory();
        if (!isNote) return;
        ctx.setProperty(node, 'href', relativeUrl(from, to) + hash);
      },
    },
  };
}

/** Path of `file` inside the `root` folder, with forward slashes; undefined when it's outside. */
function inside(root: string, file: string): string | undefined {
  const relative = path.relative(root, file).split(path.sep).join('/');
  return relative.startsWith('..') || path.isAbsolute(relative) ? undefined : relative;
}

/** What `quizzes` found in a test, left in its frontmatter as `quiz` for course.ts to check. */
export interface Quiz {
  /** Plain-text question headings, in order. */
  questions: string[];
  /** Mistakes in the test file, as sentences for the build error. */
  problems: string[];
}

/** Marks shown on answers once they're checked: right answers get a tick, wrong picks a cross. */
const ANSWER_MARKS =
  '<svg class="icon mark-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>' +
  '<svg class="icon mark-wrong" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"></path></svg>';

/**
 * Turns each file in tests/ into a quiz form for the test page (TestView.astro).
 * Every `## Heading` starts a question. The first task list under it holds the
 * answers, `- [x]` for right ones and `- [ ]` for wrong ones: one right answer
 * makes radio buttons, several make checkboxes. Anything between the heading and
 * the list belongs to the question; anything after the list explains the answer
 * and stays hidden until the answers are checked.
 */
export function quizzes(testsRoot: string): HastPluginDefinition {
  return {
    name: 'ml-workout:quizzes',
    before(root, ctx) {
      const file = ctx.fileURL && inside(testsRoot, fileURLToPath(ctx.fileURL));
      if (!file || isIndexFile(path.basename(file))) return; // tests/README.md is the overview's introduction

      const quiz: Quiz = { questions: [], problems: [] };
      const intro: Content[] = [];
      const questions: Content[][] = [];
      const footnotes: Content[] = [];
      for (const node of plain(root.children) as Content[]) {
        if (node.type === 'element' && node.tagName === 'h2') questions.push([node]);
        else if (node.type === 'element' && node.properties?.dataFootnotes !== undefined) footnotes.push(node);
        else (questions.at(-1) ?? intro).push(node);
      }

      const t = ui[noteLang(ctx)].tests;
      const sections = questions.map((nodes, index) => toQuestion(nodes, index + 1, t, quiz));
      ctx.replaceNode(root, { type: 'root', children: [...intro, ...sections, ...footnotes] });
      const astro = ctx.data.astro as { frontmatter?: Record<string, unknown> } | undefined;
      if (astro?.frontmatter) astro.frontmatter.quiz = quiz;
    },
  };
}

function toQuestion(nodes: Content[], number: number, t: (typeof ui)[Lang]['tests'], quiz: Quiz): Element {
  const [heading, ...rest] = nodes as [Element, ...Content[]];
  const id = `question-${number}`;
  const title = textOf(heading).replace(/\s+/g, ' ').trim();
  const name = `Question ${number} ("${title}")`;
  quiz.questions.push(title);

  const listAt = rest.findIndex(
    (node) => node.type === 'element' && node.tagName === 'ul' && classes(node).includes('contains-task-list'),
  );
  const list = rest[listAt] as Element | undefined;
  const answers = (list?.children ?? [])
    .filter((node): node is Element => node.type === 'element' && node.tagName === 'li')
    .map(toAnswer);
  const right = answers.filter((answer) => answer.right).length;
  const multiple = right > 1;

  if (!list) {
    quiz.problems.push(`${name} has no answers. List them under it, like "- [x] a right answer" and "- [ ] a wrong one".`);
  } else {
    for (const answer of answers.filter((answer) => answer.right === undefined)) {
      quiz.problems.push(`${name}: the answer "${answer.text}" needs "[x]" (right) or "[ ]" (wrong) after its "-".`);
    }
    if (answers.length < 2) quiz.problems.push(`${name} has only one answer. Give it at least two.`);
    if (right === 0) quiz.problems.push(`${name} has no right answer. Mark the right answers with "- [x]".`);
  }

  const hintId = `${id}-hint`;
  return element('section', { className: ['question'], dataQuestion: true }, [
    { ...heading, properties: { ...heading.properties, id } },
    ...(listAt === -1 ? rest : rest.slice(0, listAt)),
    ...(multiple ? [element('p', { className: ['select-all'], id: hintId }, [text(t.selectAll)])] : []),
    element(
      'fieldset',
      { className: ['answers'], ariaLabelledBy: [id], ariaDescribedBy: multiple ? [hintId] : undefined },
      answers.map((answer, index) =>
        element('label', { className: ['answer'] }, [
          element('input', {
            type: multiple ? 'checkbox' : 'radio',
            name: id,
            value: String(index),
            dataRight: answer.right || undefined,
          }),
          element(answer.block ? 'div' : 'span', { className: ['answer-text'] }, answer.content),
          element('span', { className: ['answer-mark'] }, [{ type: 'raw', value: ANSWER_MARKS }]),
        ]),
      ),
    ),
    element('div', { className: ['feedback'], hidden: true }, [
      element('p', { className: ['verdict'] }, [
        element('span', { className: ['when-right'] }, [text(t.right)]),
        element('span', { className: ['when-wrong'] }, [text(t.wrong)]),
        element('span', { className: ['when-skipped'] }, [text(t.skipped)]),
      ]),
      ...(listAt === -1 ? [] : rest.slice(listAt + 1)),
    ]),
  ]);
}

const BLOCK_TAGS = new Set(['p', 'div', 'pre', 'ul', 'ol', 'table', 'blockquote', 'figure', 'details', 'hr']);

/** One task-list item: `right` is undefined when the item has no checkbox. */
function toAnswer(item: Element): { right?: boolean; content: Content[]; block: boolean; text: string } {
  const blocks = item.children.filter((node) => !(node.type === 'text' && !node.value.trim()));
  // In a list with blank lines between items, each item's text sits in a paragraph.
  const loose = blocks[0]?.type === 'element' && blocks[0].tagName === 'p';
  const line = loose ? (blocks[0] as Element).children : blocks;
  const box = line[0];
  const isBox = box?.type === 'element' && box.tagName === 'input' && box.properties?.type === 'checkbox';
  const content = trimStart(isBox ? line.slice(1) : line);
  if (loose) content.push(...blocks.slice(1));
  return {
    right: isBox ? Boolean(box.properties?.checked) : undefined,
    content,
    block: content.some((node) => node.type === 'element' && BLOCK_TAGS.has(node.tagName)),
    text: content.map(textOf).join('').trim(),
  };
}

function trimStart(nodes: Content[]): Content[] {
  const [first, ...rest] = nodes;
  if (first?.type !== 'text') return [...nodes];
  const value = first.value.trimStart();
  return value ? [{ ...first, value }, ...rest] : rest;
}

function element(tagName: string, properties: Element['properties'], children: Content[] = []): Element {
  return { type: 'element', tagName, properties, children };
}

function text(value: string): Content {
  return { type: 'text', value };
}

function classes(node: Element): string[] {
  const className = node.properties?.className;
  return Array.isArray(className) ? className.map(String) : [];
}

function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value;
  return 'children' in node ? node.children.map(textOf).join('') : '';
}

/** A copy of tree nodes as plain objects, without the parser's internal fields, to build a new tree from. */
function plain<T>(nodes: T): T {
  return JSON.parse(JSON.stringify(nodes, (key, value) => (key.startsWith('_') ? undefined : value)));
}
