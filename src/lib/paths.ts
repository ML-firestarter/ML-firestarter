/**
 * Pure helpers that turn paths inside `notes/` into titles and URLs.
 *
 * Shared by the site (course.ts) and the Markdown link plugin (markdown.ts),
 * so a link to `../02-foundations/01-intro.md` points at the exact URL
 * that lesson is published under.
 */
import { DEFAULT_LANG, isLang, type Lang } from './i18n.ts';

/** Folder, relative to the project root, that holds every lesson. */
export const NOTES_DIR = 'notes';

/** A folder's `README.md` / `index.md` is its chapter intro, not a lesson. */
const INDEX_NAMES = new Set(['readme', 'index']);

/** Leading ordering number such as `01-`, `2_`, `03. ` or `4 `. */
const ORDER_PREFIX = /^\d+[ ._-]+(?=\S)/;

/** Language code before the extension, as in `sft.pl.md`. */
const LANG_SUFFIX = /\.([a-z]{2})(\.md)$/i;

export function stripExtension(name: string): string {
  return name.replace(/\.md$/i, '');
}

export function stripOrder(name: string): string {
  return name.replace(ORDER_PREFIX, '') || name;
}

/** Whether a file or folder name starts with an ordering number. */
export function hasOrder(name: string): boolean {
  return ORDER_PREFIX.test(stripExtension(name));
}

export function isIndexFile(name: string): boolean {
  return /\.md$/i.test(name) && INDEX_NAMES.has(stripExtension(name).toLowerCase());
}

/**
 * Separates a note's language from its path. Notes without a language code
 * are in the default language.
 *
 *   `vocabulary/sft.pl.md` → `{ file: 'vocabulary/sft.md', lang: 'pl' }`
 *   `vocabulary/sft.md`    → `{ file: 'vocabulary/sft.md', lang: 'en' }`
 */
export function splitLang(file: string): { file: string; lang: Lang } {
  const match = LANG_SUFFIX.exec(file);
  const lang = match?.[1].toLowerCase() ?? '';
  if (match && isLang(lang)) return { file: file.slice(0, match.index) + match[2], lang };
  return { file, lang: DEFAULT_LANG };
}

/** `sft.md` → `sft.pl.md`; the default language keeps the plain name. */
export function withLang(file: string, lang: Lang): string {
  return lang === DEFAULT_LANG ? file : file.replace(/(\.md)$/i, `.${lang}$1`);
}

/** `02-linear-regression.md` → `Linear regression` */
export function prettify(name: string): string {
  const text = stripOrder(stripExtension(name)).replace(/[-_]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function segmentSlug(name: string): string {
  const base = stripExtension(name);
  return slugify(stripOrder(base)) || slugify(base) || base;
}

/**
 * Language-neutral URL of a lesson file or folder, given its path inside `notes/`.
 * Ordering numbers and language codes are dropped, so renumbering files keeps
 * URLs stable and every translation shares its original's address.
 *
 *   `02-foundations/01-what-is-ml.md`    → `/foundations/what-is-ml/`
 *   `02-foundations/01-what-is-ml.pl.md` → `/foundations/what-is-ml/`
 *   `02-foundations/README.md`           → `/foundations/`
 *   `02-foundations`                     → `/foundations/`
 */
export function noteUrl(relativePath: string): string {
  const parts = splitLang(relativePath).file.split('/').filter(Boolean);
  if (parts.length > 0 && isIndexFile(parts[parts.length - 1])) parts.pop();
  return '/' + parts.map((part) => `${segmentSlug(part)}/`).join('');
}

/** Relative link between two URLs from `noteUrl`, so it works under any language prefix. */
export function relativeUrl(from: string, to: string): string {
  const source = from.split('/').filter(Boolean);
  const target = to.split('/').filter(Boolean);
  let shared = 0;
  while (shared < source.length && shared < target.length && source[shared] === target[shared]) shared++;
  const up = '../'.repeat(source.length - shared);
  const down = target.slice(shared).map((part) => `${part}/`).join('');
  return up + down || './';
}

/**
 * Plain-text title from a note that opens with a `# Heading`
 * (the first non-blank line, ATX or setext style).
 */
export function leadingHeading(body: string | undefined): string | undefined {
  if (!body) return undefined;
  const lines = body.split(/\r?\n/);
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  const line = lines[i] ?? '';
  const atx = /^ {0,3}#[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/.exec(line);
  const isSetext = !atx && line.trim() !== '' && /^ {0,3}=+[ \t]*$/.test(lines[i + 1] ?? '');
  const heading = atx ? atx[1] : isSetext ? line : '';
  const text = heading
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~$]/g, '')
    .trim();
  return text || undefined;
}
