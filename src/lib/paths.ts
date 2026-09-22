/**
 * Pure helpers that turn paths inside `notes/` into titles and URLs.
 *
 * Shared by the site (course.ts) and the Markdown link plugin (markdown.ts),
 * so a link to `../02-foundations/01-intro.md` points at the exact URL
 * that lesson is published under.
 */

/** Folder, relative to the project root, that holds every lesson. */
export const NOTES_DIR = 'notes';

/** A folder's `README.md` / `index.md` is its chapter intro, not a lesson. */
const INDEX_NAMES = new Set(['readme', 'index']);

/** Leading ordering number such as `01-`, `2_`, `03. ` or `4 `. */
const ORDER_PREFIX = /^\d+[ ._-]+(?=\S)/;

export function stripExtension(name: string): string {
  return name.replace(/\.md$/i, '');
}

export function stripOrder(name: string): string {
  return name.replace(ORDER_PREFIX, '') || name;
}

export function isIndexFile(name: string): boolean {
  return /\.md$/i.test(name) && INDEX_NAMES.has(stripExtension(name).toLowerCase());
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
 * URL of a lesson file or folder, given its path inside `notes/`.
 * Ordering numbers are dropped, so renumbering files keeps URLs stable.
 *
 *   `02-foundations/01-what-is-ml.md` → `/foundations/what-is-ml/`
 *   `02-foundations/README.md`        → `/foundations/`
 *   `02-foundations`                  → `/foundations/`
 */
export function noteUrl(relativePath: string): string {
  const parts = relativePath.split('/').filter(Boolean);
  if (parts.length > 0 && isIndexFile(parts[parts.length - 1])) parts.pop();
  return '/' + parts.map((part) => `${segmentSlug(part)}/`).join('');
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
