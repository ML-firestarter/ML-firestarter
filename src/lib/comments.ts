/**
 * Readers' comments on a passage of a note, and the changes they lead to. Each comment is a
 * GitHub issue in the notes repository, opened as the reader through the site's API
 * (src/server/api.ts) and checked by the triage workflow (.github/workflows/triage-comments.yml).
 *
 * The issue reads well on GitHub: the passage as a quote, the comment, the suggested change
 * as a diff and a link back to the page. It ends with a hidden marker holding the comment for
 * the workflows. Copilot proposes a change on the issue, written into every language version
 * of the note; the proposal that gets the votes becomes a pull request
 * (.github/workflows/open-changes.yml), and its hidden marker holds what the site needs to
 * show it. The site shows the open pull requests on every version of their note: the passage
 * the change rewrites, what it becomes and the comment it came from.
 */
import { site } from '../site.config.ts';
import { isLang, localizeUrl, type Lang } from './i18n.ts';

// Keep these persisted marker names stable so transferred issues and pull requests remain readable.
/** Opens the hidden marker of a comment's issue, as in `<!-- ml-workout:comment {…} -->`. The workflows look for it too. */
export const MARKER = 'ml-workout:comment';

// Keep these persisted marker names stable so transferred issues and pull requests remain readable.
/** Opens the hidden marker of a pull request with a comment's change, as .github/scripts/changes.cjs writes it. */
export const CHANGE_MARKER = 'ml-workout:change';

/** Longest passage, comment and suggested change, in characters. */
export const LIMITS = { quote: 1000, comment: 3000, suggestion: 3000 };

/** Characters of text kept on each side of a passage, to tell apart passages with the same text. */
export const CONTEXT = 32;

/** Who opens the pull requests with the changes: the workflows, or a maintainer by hand. */
const WORKFLOWS = 'github-actions[bot]';
const MAINTAINERS = ['OWNER', 'MEMBER', 'COLLABORATOR'];

/** A language-neutral URL of a page, as noteUrl in paths.ts makes them. */
const PAGE_PATH = /^\/(?:[\p{L}\p{N}-]+\/)*$/u;

/** Most changes a pull request can show, each a run of changed lines in one version of the note. */
const MAX_CHANGES = 12;

/**
 * A passage, found again by its text and a little of the text around it (like the W3C text
 * quote selector), so it keeps its place when other parts of the note change. Whitespace is
 * collapsed into single spaces.
 */
export interface TextQuote {
  exact: string;
  prefix: string;
  suffix: string;
}

/** A comment as a page sends it to the API. */
export interface NewComment {
  /** The note shown on the page, like `notes/vocabulary/sft.pl.md`. */
  file: string;
  /** Language-neutral URL of the page, like `/vocabulary/sft/`. */
  path: string;
  /** Language of the page, which isn't the note's when the note isn't translated yet. */
  lang: Lang;
  /** Title of the page, for the issue's title. */
  title: string;
  quote: TextQuote;
  /** Can be empty when there's a suggestion. */
  comment: string;
  /** Text to put in place of the passage. */
  suggestion?: string;
}

/** A comment's change, voted in on GitHub and waiting to be merged, as the API returns it to a page. */
export interface PageComment {
  /** The pull request with the change. */
  number: number;
  url: string;
  /** The issue with the comment, where the change was discussed. */
  issue: { number: number; url: string };
  /** The reader who commented, and when. */
  author: { login: string; avatar: string };
  created: string;
  /** The note, page and language the reader commented on. */
  file: string;
  path: string;
  lang: Lang;
  /** What they wrote; can be empty when they only suggested new wording. */
  comment: string;
  /** What the change does to the text of each version of the note it changes. */
  changes: Change[];
}

/** A passage a change rewrites, in one version of the note. */
export interface Change {
  /** That version of the note, like `notes/vocabulary/sft.md`. */
  file: string;
  quote: TextQuote;
  /** What the passage becomes; empty when it's taken out. */
  suggestion: string;
}

/** The parts of a GitHub pull request that `changeFrom` reads. */
export interface PullData {
  number: number;
  html_url: string;
  body?: string | null;
  created_at: string;
  user: { login: string } | null;
  author_association?: string;
}

/** Whether readers can comment on the page at a language-neutral URL. */
export function hasComments(path: string): boolean {
  return site.comments.some((section) => path.startsWith(section));
}

/** The title and body of the issue for a new comment. `origin` is the site's address, for the link to the page. */
export function issueFor(comment: NewComment, origin: string): { title: string; body: string } {
  const { file, path, lang, quote, suggestion } = comment;
  const page = new URL(localizeUrl(path, lang), origin).href;
  const source = `${site.repo}/blob/${site.branch}/${file.split('/').map(encodeURIComponent).join('/')}`;
  const marker = { v: 1, file, path, lang, quote, comment: comment.comment, suggestion };
  const body = [
    `> ${escapeMarkdown(quote.exact)}`,
    comment.comment,
    suggestion && `**Suggested change**\n\n${diff(quote.exact, suggestion)}`,
    `<sub>On [${escapeMarkdown(comment.title)}](${page}) · [\`${file}\`](${source}) · sent from the ${site.title} site</sub>`,
    `<!-- ${MARKER} ${markerJson(marker)} -->`,
  ];
  return {
    title: `Comment on ${clip(comment.title, 80)}: “${clip(quote.exact, 80)}”`,
    body: body.filter(Boolean).join('\n\n'),
  };
}

/** The comment and change a pull request holds, if the workflows opened it for a comment's change. */
export function changeFrom(pull: PullData): PageComment | undefined {
  // Anyone can open a pull request, but only its author and the maintainers can edit it.
  if (pull.user?.login !== WORKFLOWS && !MAINTAINERS.includes(pull.author_association ?? '')) return undefined;
  const data = readMarker(pull.body ?? '', CHANGE_MARKER);
  if (!isRecord(data) || !isRecord(data.reader) || !Array.isArray(data.changes)) return undefined;
  const { issue, file, path, lang, comment, created } = data;
  const { login, avatar } = data.reader;
  if (typeof issue !== 'number' || !Number.isInteger(issue) || issue < 1) return undefined;
  if (![file, path, lang, comment, login, avatar].every((value) => typeof value === 'string')) return undefined;
  if (!isLang(lang as string) || !PAGE_PATH.test(path as string)) return undefined;

  const changes = data.changes.slice(0, MAX_CHANGES).flatMap((change): Change[] => {
    if (!isRecord(change) || ![change.file, change.before, change.after].every((value) => typeof value === 'string')) return [];
    const shown = changeQuote(change.before as string, change.after as string);
    return shown ? [{ file: change.file as string, ...shown }] : [];
  });
  if (changes.length === 0) return undefined;

  return {
    number: pull.number,
    url: pull.html_url,
    issue: { number: issue, url: `${site.repo}/issues/${issue}` },
    author: { login: login as string, avatar: avatar as string },
    created: typeof created === 'string' && !Number.isNaN(Date.parse(created)) ? created : pull.created_at,
    file: file as string,
    path: path as string,
    lang: lang as Lang,
    comment: comment as string,
    changes,
  };
}

/**
 * What a change to a note does to its text as the site shows it, from the Markdown lines it
 * changes: the words it rewrites, with a little of the text around them, and what they become.
 * Words added go with the word before them, or with the one after them at the start, so there's
 * a passage to show them on. Undefined when the text stays the same, as when only a link's
 * address changes.
 */
export function changeQuote(before: string, after: string): Pick<Change, 'quote' | 'suggestion'> | undefined {
  const old = words(before);
  const now = words(after);
  let start = 0;
  while (start < old.length && start < now.length && old[start] === now[start]) start++;
  let end = 0;
  while (end < old.length - start && end < now.length - start && old.at(-1 - end) === now.at(-1 - end)) end++;

  let from = start;
  let to = old.length - end;
  let replaced = now.slice(start, now.length - end);
  if (from === to) {
    if (replaced.length === 0) return undefined;
    if (from > 0) {
      from--;
      replaced = [old[from], ...replaced];
    } else if (to < old.length) {
      replaced = [...replaced, old[to]];
      to++;
    } else {
      return undefined;
    }
  }

  const exact = joinWords(old.slice(from, to));
  const suggestion = joinWords(replaced);
  if (exact.length > LIMITS.suggestion || suggestion.length > LIMITS.suggestion) return undefined;
  const head = joinWords(old.slice(0, from));
  const tail = joinWords(old.slice(to));
  return {
    quote: { exact, prefix: (head && `${head} `).slice(-CONTEXT), suffix: (tail && ` ${tail}`).slice(0, CONTEXT) },
    suggestion,
  };
}

/**
 * The text of some Markdown as the site shows it and scripts/comments.ts reads it: without the
 * Markdown around the words, with curly quotes, whitespace collapsed into single spaces and each
 * formula as its TeX source, like `$x^2$`. It's close enough to find passages by, not a Markdown
 * renderer: footnote references, for one, are left out, since their numbers depend on the rest
 * of the note.
 */
export function plainText(markdown: string): string {
  return shownText(markdown).replaceAll(MATH_SPACE, ' ');
}

/** Stands for a space in a formula, so a formula stays one word. */
const MATH_SPACE = '\u{E000}';

function words(markdown: string): string[] {
  return shownText(markdown).split(' ').filter(Boolean);
}

function joinWords(words: string[]): string {
  return words.join(' ').replaceAll(MATH_SPACE, ' ');
}

/** plainText, with MATH_SPACE for the spaces in formulas. */
function shownText(markdown: string): string {
  // Code, escaped characters and formulas are set aside while the Markdown around them goes.
  const kept: string[] = [];
  const keep = (text: string) => `\u{E001}${kept.push(text) - 1}\u{E002}`;
  const formulas: string[] = [];
  const keepFormula = (tex: string, display: boolean) => {
    const source = tex.trim().replace(/\s+/g, MATH_SPACE);
    return `\u{E003}${formulas.push(display ? `$$${source}$$` : `$${source}$`) - 1}\u{E004}`;
  };

  let fenced = false;
  let text = markdown
    .replace(/[\u{E000}-\u{E004}]/gu, '')
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*(?:>\s*)*(?:`{3,}|~{3,})/.test(line)) {
        fenced = !fenced;
        return '';
      }
      if (fenced) return keep(line);
      line = line
        .replace(/^(?:\s{0,3}>\s?)+/, '')
        .replace(/^\s*\[!\w+\]\s*$/, '')
        .replace(/^\s{0,3}(?:([-*_])(?:\s*\1){2,}|=+|-+)\s*$/, '')
        .replace(/^\s{0,3}\[\^[^\]]+\]:\s*/, '')
        .replace(/^\s{0,3}\[[^\]]+\]:\s*\S.*$/, '')
        .replace(/^\s{0,3}#{1,6}(?:\s+|$)/, '')
        .replace(/\s+#+\s*$/, '')
        .replace(/^\s*(?:[-*+]|\d{1,9}[.)])\s+(?:\[[ xX]\]\s+)?/, '');
      // Table rows, whose cells the site shows apart, and the rows under their headers. A cell's
      // escaped pipes are pipes, in code too.
      if (/^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|?\s*$/.test(line)) return '';
      return line.trimStart().startsWith('|') ? line.replace(/(?<!\\)\|/g, ' ').replace(/\\\|/g, '|') : line;
    })
    .join('\n');

  text = text
    .replace(/(?<!`)(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g, (_, _ticks, code: string) => {
      const flat = code.replace(/\n/g, ' ');
      return keep(/^ [\s\S]*[^ ][\s\S]* $/.test(flat) ? flat.slice(1, -1) : flat);
    })
    .replace(/(?<!\\)\$\$([\s\S]+?)\$\$/g, (_, tex: string) => keepFormula(tex, true))
    .replace(/(?<![\\$])\$(?!\$)((?:\\[\s\S]|[^$\\])+?)\$(?!\$)/g, (_, tex: string) => keepFormula(tex, false))
    .replace(/\\\n/g, ' ')
    .replace(/\\([!-/:-@[-`{-~])/g, (_, char: string) => keep(char))
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/!\[[^\]]*\](?:\((?:[^()]|\([^()]*\))*\)|\[[^\]]*\])/g, ' ')
    .replace(/\[\^[^\]\s]+\]/g, '')
    .replace(/\[([^\]]*)\](?:\((?:[^()]|\([^()]*\))*\)|\[[^\]]*\])/g, '$1')
    .replace(/<((?:https?|mailto):[^\s<>]*|[^\s<>@]+@[^\s<>@]+)>/gi, '$1')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[a-z][\w-]*(?:\s[^<>]*)?\/?>/gi, '')
    .replace(/~~/g, '')
    .replace(/\*+(?=[^\s*])|(?<=[^\s*])\*+/g, '')
    .replace(/(?<![\p{L}\p{N}_])_+(?=[^\s_])|(?<=[^\s_])_+(?![\p{L}\p{N}_])/gu, '')
    .replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (entity, name: string) => decodeEntity(name) ?? entity);

  return smartQuotes(text)
    .replace(/\u{E001}(\d+)\u{E002}/gu, (_, i: string) => kept[Number(i)])
    .replace(/[­​-‍⁠﻿]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\u{E003}(\d+)\u{E004}/gu, (_, i: string) => formulas[Number(i)]);
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…' };

function decodeEntity(name: string): string | undefined {
  if (name[0] !== '#') return ENTITIES[name.toLowerCase()];
  const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
  return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : undefined;
}

/** Straight quotes curled, as the site shows them: opening after a space or bracket, closing otherwise. */
function smartQuotes(text: string): string {
  return text.replace(/['"]/g, (quote, at: number) => {
    const opening = at === 0 || /[\s([{–—-]/.test(text[at - 1]);
    if (quote === '"') return opening ? '“' : '”';
    return opening ? '‘' : '’';
  });
}

/** The data in the last `name` marker of `body`: one written into the text by hand comes before it. */
function readMarker(body: string, name: string): unknown {
  const start = body.lastIndexOf(`<!-- ${name} `);
  const end = body.indexOf(' -->', start);
  if (start === -1 || end === -1) return undefined;
  try {
    return JSON.parse(body.slice(start + `<!-- ${name} `.length, end));
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Shows text on GitHub as it is, rather than as Markdown or HTML. */
function escapeMarkdown(text: string): string {
  return text
    .replace(/[\\`*_[\]<>#|~$&]/g, '\\$&')
    .replace(/^([-+])/, '\\$1')
    .replace(/^(\d+)([.)])/, '$1\\$2');
}

/** The change as a diff block, which GitHub shows in red and green. */
function diff(before: string, after: string): string {
  const lines = [...before.split('\n').map((line) => `-${line}`), ...after.split('\n').map((line) => `+${line}`)].join('\n');
  const longestBackticks = Math.max(0, ...(lines.match(/`+/g) ?? []).map((run) => run.length));
  const fence = '`'.repeat(Math.max(3, longestBackticks + 1));
  return `${fence}diff\n${lines}\n${fence}`;
}

/** JSON that can sit inside an HTML comment: `<`, `>` and `&` are escaped, so it can't contain `-->`. */
function markerJson(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

function clip(text: string, length: number): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length <= length ? flat : `${flat.slice(0, length - 1).trimEnd()}…`;
}
