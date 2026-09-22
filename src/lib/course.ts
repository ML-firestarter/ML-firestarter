/**
 * Turns the files in notes/ into a course: folders are chapters, Markdown files are lessons.
 * Everything is ordered by name, so number your files and folders (01-, 02-, …) to set the order.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { NOTES_DIR, isIndexFile, leadingHeading, noteUrl, prettify } from './paths.ts';

type Note = CollectionEntry<'notes'>;

export interface Lesson {
  kind: 'lesson';
  note: Note;
  /** Path inside notes/, e.g. `02-foundations/01-what-is-ml.md`. */
  file: string;
  url: string;
  title: string;
  description?: string;
  minutes: number;
  /** Enclosing chapters, outermost first. */
  parents: Chapter[];
}

export interface Chapter {
  kind: 'chapter';
  /** Folder inside notes/, `''` for notes/ itself. */
  dir: string;
  url: string;
  title: string;
  description?: string;
  /** The folder's README.md or index.md. */
  intro?: Note;
  children: (Chapter | Lesson)[];
  /** Every lesson inside, in reading order. */
  lessons: Lesson[];
  parents: Chapter[];
}

export interface Course {
  /** notes/ itself; its README.md is the home page intro. */
  root: Chapter;
  /** Every lesson in reading order. */
  lessons: Lesson[];
  /** Every folder except the root, in reading order. */
  chapters: Chapter[];
  byUrl: Map<string, Chapter | Lesson>;
}

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

let cached: Promise<Course> | undefined;

export function getCourse(): Promise<Course> {
  if (import.meta.env.DEV) return buildCourse(); // notes change while the dev server runs
  cached ??= buildCourse();
  return cached;
}

async function buildCourse(): Promise<Course> {
  const notes = await getCollection('notes', (note) => !note.data.draft);
  const root = newChapter('', undefined);
  const folders = new Map<string, Chapter>([['', root]]);

  function chapterFor(dir: string): Chapter {
    let chapter = folders.get(dir);
    if (!chapter) {
      const parent = chapterFor(dir.includes('/') ? dir.slice(0, dir.lastIndexOf('/')) : '');
      chapter = newChapter(dir, parent === root ? undefined : parent);
      parent.children.push(chapter);
      folders.set(dir, chapter);
    }
    return chapter;
  }

  for (const note of notes) {
    const file = (note.filePath ?? '').slice(NOTES_DIR.length + 1);
    const slash = file.lastIndexOf('/');
    const dir = slash === -1 ? '' : file.slice(0, slash);
    const name = file.slice(slash + 1);
    const chapter = chapterFor(dir);
    const title = note.data.title ?? leadingHeading(note.body);

    if (isIndexFile(name)) {
      chapter.intro = note;
      if (title) chapter.title = title;
      chapter.description = note.data.description;
      continue;
    }

    chapter.children.push({
      kind: 'lesson',
      note,
      file,
      url: noteUrl(file),
      title: title ?? prettify(name),
      description: note.data.description,
      minutes: readingMinutes(note.body),
      parents: chapter === root ? [] : [...chapter.parents, chapter],
    });
  }

  const chapters: Chapter[] = [];
  const byUrl = new Map<string, Chapter | Lesson>();

  function finish(chapter: Chapter): Lesson[] {
    chapter.children.sort((a, b) => collator.compare(sortName(a), sortName(b)));
    chapter.lessons = chapter.children.flatMap((child) => {
      claimUrl(byUrl, child);
      if (child.kind === 'lesson') return [child];
      chapters.push(child);
      return finish(child);
    });
    return chapter.lessons;
  }

  return { root, lessons: finish(root), chapters, byUrl };
}

function newChapter(dir: string, parent: Chapter | undefined): Chapter {
  return {
    kind: 'chapter',
    dir,
    url: noteUrl(dir),
    title: prettify(dir.slice(dir.lastIndexOf('/') + 1)),
    children: [],
    lessons: [],
    parents: parent ? [...parent.parents, parent] : [],
  };
}

function sortName(node: Chapter | Lesson): string {
  const path = node.kind === 'chapter' ? node.dir : node.file;
  return path.slice(path.lastIndexOf('/') + 1);
}

function claimUrl(byUrl: Map<string, Chapter | Lesson>, node: Chapter | Lesson) {
  const taken = byUrl.get(node.url);
  if (taken) {
    const describe = (n: Chapter | Lesson) => `${NOTES_DIR}/${n.kind === 'chapter' ? `${n.dir}/` : n.file}`;
    throw new Error(
      `"${describe(taken)}" and "${describe(node)}" would both be published at ${node.url}. Rename one of them.`,
    );
  }
  byUrl.set(node.url, node);
}

function readingMinutes(body = ''): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Link that opens the note in GitHub's web editor. */
export function editUrl(repo: string, branch: string, note: Note): string {
  return `${repo}/edit/${branch}/${encodePath(note.filePath ?? '')}`;
}

/** Link to GitHub's "new file" page inside a chapter's folder. */
export function newLessonUrl(repo: string, branch: string, chapter: Chapter): string {
  return `${repo}/new/${branch}/${encodePath([NOTES_DIR, chapter.dir].filter(Boolean).join('/'))}`;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}
