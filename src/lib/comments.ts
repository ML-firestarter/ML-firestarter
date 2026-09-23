/**
 * Readers' comments on a passage of a note. Each comment is a GitHub issue in the notes
 * repository, opened as the reader through the site's API (src/server/api.ts) and checked
 * by the triage workflow (.github/workflows/triage-comments.yml).
 *
 * The issue reads well on GitHub: the passage as a quote, the comment, the suggested change
 * as a diff and a link back to the page. It ends with a hidden marker holding what the site
 * needs to show the comment again. Closing the issue takes the comment off the site.
 */
import { site } from '../site.config.ts';
import { isLang, localizeUrl, type Lang } from './i18n.ts';

/** Opens the hidden marker, as in `<!-- ml-workout:comment {…} -->`. The triage workflow looks for it too. */
export const MARKER = 'ml-workout:comment';

/** Label the triage workflow gives the comments it keeps for the maintainer. */
export const REVIEW_LABEL = 'needs-review';

/** Longest passage, comment and suggested change, in characters. */
export const LIMITS = { quote: 1000, comment: 3000, suggestion: 3000 };

/** Characters of text kept on each side of a passage, to tell apart passages with the same text. */
export const CONTEXT = 32;

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

/** A comment as the API returns it to a page. */
export interface PageComment extends Omit<NewComment, 'title'> {
  /** The issue's number and address. */
  number: number;
  url: string;
  author: { login: string; avatar: string };
  /** When the comment was posted, as an ISO 8601 date. */
  created: string;
  /** Number of replies on GitHub. */
  replies: number;
  /** `review` once the triage workflow has kept the comment for the maintainer. */
  status: 'new' | 'review';
}

/** The parts of a GitHub issue that `commentFrom` reads. */
export interface IssueData {
  number: number;
  html_url: string;
  body?: string | null;
  created_at: string;
  comments: number;
  user: { login: string; avatar_url: string } | null;
  labels: (string | { name?: string })[];
  pull_request?: unknown;
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

/** The comment an issue holds, if it was opened from the site. */
export function commentFrom(issue: IssueData): PageComment | undefined {
  const body = issue.body ?? '';
  // The last marker is the site's: one written into the comment itself comes before it.
  const start = body.lastIndexOf(`<!-- ${MARKER} `);
  const end = body.indexOf(' -->', start);
  if (start === -1 || end === -1 || issue.pull_request || !issue.user) return undefined;

  let data: unknown;
  try {
    data = JSON.parse(body.slice(start + `<!-- ${MARKER} `.length, end));
  } catch {
    return undefined;
  }
  if (!isRecord(data) || !isRecord(data.quote)) return undefined;
  const { file, path, lang, comment, suggestion } = data;
  const { exact, prefix, suffix } = data.quote;
  if (![file, path, lang, comment, exact, prefix, suffix].every((value) => typeof value === 'string')) return undefined;
  if (!isLang(lang as string) || !exact || (suggestion !== undefined && typeof suggestion !== 'string')) return undefined;

  return {
    number: issue.number,
    url: issue.html_url,
    file: file as string,
    path: path as string,
    lang: lang as Lang,
    quote: { exact: exact as string, prefix: prefix as string, suffix: suffix as string },
    comment: comment as string,
    suggestion: suggestion as string | undefined,
    author: { login: issue.user.login, avatar: issue.user.avatar_url },
    created: issue.created_at,
    replies: issue.comments,
    status: issue.labels.some((label) => (typeof label === 'string' ? label : label.name) === REVIEW_LABEL) ? 'review' : 'new',
  };
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
