/**
 * Comments on passages of a note, as in a code review: readers select text and comment on it
 * or suggest new wording, and the comment is posted as a GitHub issue (lib/comments.ts).
 * Signed-in readers see the changes that comments led to highlighted in the text, once they're
 * voted in on GitHub and until they're merged, on every language version of the note: on hover,
 * the passage a change rewrites, what it becomes and the comment it came from.
 *
 * Passages are found again by their text (TextQuote), in the text of the note as it reads:
 * whitespace collapsed into single spaces and each formula as its TeX source, like `$x^2$`.
 */
import { CONTEXT, LIMITS, type NewComment, type PageComment, type TextQuote } from '../lib/comments.ts';
import { localizeUrl, plural, type Lang, type ui } from '../lib/i18n.ts';
import { COMMENTS_KEY, avatarUrl, paintAccount, readReader } from './account.ts';

type Strings = (typeof ui)['en']['comments'] & { lang: Lang };

/** A comment's change as this page shows it: one passage it rewrites in this page's version of the note. */
interface ShownComment extends PageComment {
  /** Tells the passages apart, as `data-comment` on their marks: the pull request's number and the change's. */
  key: string;
  quote: TextQuote;
  suggestion: string;
  /** The passage as the page shows it. */
  text: string;
  /** The language the reader commented in, when they read another version of the note. */
  from?: Lang;
}

/** A comment being written, kept while the reader signs in. */
interface Draft {
  quote: TextQuote;
  comment: string;
  /** Empty when the reader hasn't changed the passage. */
  suggestion: string;
}

const DRAFT_KEY = 'ml-workout:comment-draft';
/** Whether comments are highlighted; readers can turn it off to read without them. */
const SHOWN_KEY = 'ml-workout:comments-shown';
const CACHE_TIME = 60 * 1000;
const DRAFT_TIME = 60 * 60 * 1000;
const MARK = 'mark.comment-mark[data-comment]';

const root = document.querySelector<HTMLElement>('.prose[data-comments]');
const parts = document.querySelector<HTMLElement>('[data-comment-ui]');
if (root && parts) setUpComments(root, parts);

function setUpComments(root: HTMLElement, parts: HTMLElement) {
  const t: Strings = JSON.parse(parts.querySelector('[data-comment-strings]')!.textContent!);
  const float = parts.querySelector<HTMLButtonElement>('[data-comment-float]')!;
  const card = parts.querySelector<HTMLElement>('[data-comment-card]')!;
  const toast = parts.querySelector<HTMLElement>('[data-comment-toast]')!;
  const dialog = parts.querySelector<HTMLDialogElement>('[data-comment-dialog]')!;
  const form = dialog.querySelector<HTMLFormElement>('[data-comment-form]')!;
  const quoteView = dialog.querySelector<HTMLElement>('[data-comment-quote]')!;
  const commentField = form.elements.namedItem('comment') as HTMLTextAreaElement;
  const suggestionField = form.elements.namedItem('suggestion') as HTMLTextAreaElement;
  const suggest = dialog.querySelector<HTMLDetailsElement>('[data-comment-suggest]')!;
  const error = dialog.querySelector<HTMLElement>('[data-comment-error]')!;
  const postButton = dialog.querySelector<HTMLButtonElement>('[data-comment-post]')!;
  // Placed by page coordinates, so they belong outside the page's containers.
  document.body.append(float, card, toast);

  const page = {
    file: root.dataset.comments!,
    path: root.dataset.commentsPath!,
    title: root.dataset.commentsTitle!,
    lang: t.lang,
  };
  /** The passages of this page that comments' changes rewrite, oldest comment first. */
  let comments: ShownComment[] = [];
  let shown = read(localStorage, SHOWN_KEY) !== '0';
  /** The passage selected in the text. */
  let selected: TextQuote | undefined;
  /** What the form is open for. */
  let draft: Draft | undefined;
  /** Marks that show the passage while the form is open, since the selection goes away. */
  let pending: HTMLElement[] = [];
  /** The mark the card is showing comments for. */
  let cardFor: HTMLElement | undefined;
  let lastPointer = 'mouse';
  let floatPressed = 0;
  let selectionTimer = 0;
  let showTimer = 0;
  let hideTimer = 0;
  let toastTimer = 0;
  let refocusing = false;

  // ---------- Comments in the text ----------

  async function load() {
    const all = readReader() ? await fetchComments() : undefined;
    const passages = (all ?? []).flatMap(onThisPage).sort((a, b) => a.created.localeCompare(b.created));
    for (const passage of passages) {
      const text = highlightComment(passage);
      if (text !== undefined) comments.push({ ...passage, text });
    }
    paintChip();
  }

  /** The passages `comment`'s change rewrites in this page's version of the note. */
  function onThisPage(comment: PageComment): Omit<ShownComment, 'text'>[] {
    // Kept by an older version of this script, before the comments had changes.
    if (!Array.isArray(comment.changes)) return [];
    const from = comment.file === page.file ? undefined : comment.lang;
    return comment.changes.flatMap(({ file, quote, suggestion }, i) =>
      file === page.file ? [{ ...comment, key: `${comment.number}-${i}`, quote, suggestion, from }] : [],
    );
  }

  /** Highlights the passage of `comment` in the text and gives its text; undefined when it's not there, as when the note changed. */
  function highlightComment(comment: Omit<ShownComment, 'text'>): string | undefined {
    const index = indexText(root);
    const span = findQuote(index, comment.quote);
    if (!span) return undefined;
    const marks = highlight(index, span, () => makeMark(comment.key));
    // One stop per passage when tabbing through the page.
    if (marks[0]) marks[0].tabIndex = 0;
    return marks.length > 0 ? index.text.slice(...span) : undefined;
  }

  function makeMark(key?: string): HTMLElement {
    const mark = document.createElement('mark');
    mark.className = key === undefined ? 'comment-mark is-pending' : 'comment-mark';
    if (key !== undefined) mark.dataset.comment = key;
    return mark;
  }

  function paintChip() {
    const toggle = document.querySelector<HTMLButtonElement>('[data-comments-toggle]');
    const hint = document.querySelector<HTMLElement>('[data-comments-hint]');
    // A change can rewrite more than one passage; it counts once.
    const count = new Set(comments.map((comment) => comment.number)).size;
    if (toggle) {
      toggle.hidden = count === 0;
      toggle.setAttribute('aria-pressed', String(shown));
      toggle.querySelector('[data-comments-count]')!.textContent = plural(t.lang, count, t.count);
    }
    if (hint) hint.hidden = count > 0;
    root.classList.toggle('comments-hidden', !shown);
    // Hidden highlights aren't stops when tabbing through the page.
    for (const mark of root.querySelectorAll<HTMLElement>(`${MARK}[tabindex]`)) mark.tabIndex = shown ? 0 : -1;
  }

  // ---------- Selecting a passage ----------

  document.addEventListener('selectionchange', () => {
    clearTimeout(selectionTimer);
    selectionTimer = window.setTimeout(checkSelection, 150);
  });

  function checkSelection() {
    // Pressing the button can clear the selection on touch screens; the passage is already kept.
    if (dialog.open || Date.now() - floatPressed < 600) return;
    const selection = getSelection();
    const range = selection && selectedRange(selection, root);
    const index = range && indexText(root);
    const span = index && spanOf(index, range);
    if (!selection || !range || !index || !span) {
      float.hidden = true;
      selected = undefined;
      return;
    }
    selected = quoteAt(index, span);
    placeFloat(range, isBackward(selection));
  }

  /**
   * Next to where the selection ends, where the pointer let go. Touch screens show their own
   * menu over the selection and handles at its ends, so there it goes further under the selection.
   */
  function placeFloat(range: Range, backward: boolean) {
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
    const touch = lastPointer !== 'mouse';
    const above = backward && !touch;
    const rect = above ? rects[0] : rects.at(-1);
    if (!rect) return;
    float.hidden = false;
    const { offsetWidth: width, offsetHeight: height } = float;
    const gap = touch ? 28 : 8;
    const top = clamp(above ? rect.top - height - gap : rect.bottom + gap, 8, innerHeight - height - 8);
    const left = clamp((above ? rect.left : rect.right) - width / 2, 8, document.documentElement.clientWidth - width - 8);
    float.style.top = `${top + scrollY}px`;
    float.style.left = `${left + scrollX}px`;
  }

  float.addEventListener('pointerdown', (event) => {
    floatPressed = Date.now();
    // Keeps the selection, and the page from scrolling to the button.
    if (event.pointerType === 'mouse') event.preventDefault();
  });

  float.addEventListener('click', () => {
    if (!selected) return;
    if (selected.exact.length > LIMITS.quote) {
      showToast(t.tooLong.replace('#', String(LIMITS.quote)));
      return;
    }
    openForm({ quote: selected, comment: '', suggestion: '' });
  });

  // ---------- Writing a comment ----------

  function openForm(next: Draft) {
    float.hidden = true;
    hideCard();
    unmarkPending();
    draft = next;
    const index = indexText(root);
    const span = findQuote(index, next.quote);
    pending = span ? highlight(index, span, () => makeMark()) : [];
    quoteView.textContent = clip(next.quote.exact, 300);
    commentField.value = next.comment;
    suggestionField.value = next.suggestion || next.quote.exact;
    suggest.open = Boolean(next.suggestion);
    error.textContent = '';
    setPosting(false);
    paintAccount();
    getSelection()?.removeAllRanges();
    dialog.showModal();
    commentField.focus();
  }

  function currentDraft(): Draft | undefined {
    if (!draft) return undefined;
    const suggestion = suggestionField.value === draft.quote.exact ? '' : suggestionField.value;
    return { quote: draft.quote, comment: commentField.value, suggestion };
  }

  function unmarkPending() {
    for (const mark of pending) unwrap(mark);
    pending = [];
  }

  function setPosting(posting: boolean) {
    postButton.disabled = posting;
    postButton.textContent = posting ? t.posting : t.post;
  }

  for (const button of dialog.querySelectorAll('[data-comment-cancel]')) {
    button.addEventListener('click', () => dialog.close());
  }

  dialog.addEventListener('close', () => {
    unmarkPending();
    draft = undefined;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const written = currentDraft();
    if (!written || postButton.disabled) return;
    if (!written.comment.trim() && !written.suggestion.trim()) {
      error.textContent = t.errors.empty;
      commentField.focus();
      return;
    }
    if (!readReader()) {
      paintAccount();
      error.textContent = t.errors.signedOut;
      return;
    }

    const body: NewComment = { ...page, quote: written.quote, comment: written.comment.trim(), suggestion: written.suggestion || undefined };
    setPosting(true);
    error.textContent = '';
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.status === 201) {
        // The comment is discussed on GitHub first; the page shows the change it leads to once it's voted in.
        const { issue } = (await response.json()) as { issue: { number: number; url: string } };
        dialog.close();
        showToast(t.posted, { href: issue.url, text: t.viewOnGitHub });
        return;
      }
      // The API signed the reader out; the form now offers to sign in again.
      if (response.status === 401) paintAccount();
      error.textContent = response.status === 401 ? t.errors.signedOut : response.status === 429 ? t.errors.rateLimited : t.errors.generic;
    } catch {
      error.textContent = t.errors.generic;
    } finally {
      setPosting(false);
    }
  });

  /** After signing in, the reader comes back to the form as they left it. */
  function restoreDraft() {
    let saved: (Partial<Draft> & { file?: string; at?: number }) | undefined;
    try {
      saved = JSON.parse(read(sessionStorage, DRAFT_KEY) ?? 'null') ?? undefined;
    } catch {
      saved = undefined;
    }
    if (!saved || saved.file !== page.file) return;
    remove(sessionStorage, DRAFT_KEY);
    if (!isQuote(saved.quote) || Date.now() - (saved.at ?? 0) > DRAFT_TIME) return;
    openForm({ quote: saved.quote, comment: String(saved.comment ?? ''), suggestion: String(saved.suggestion ?? '') });
  }

  // ---------- The card with the comments on a passage ----------

  function markAt(target: EventTarget | null): HTMLElement | null {
    return target instanceof Element ? target.closest<HTMLElement>(MARK) : null;
  }

  /** The comments on the text at `mark`: its own and those of marks around it. */
  function commentsAt(mark: HTMLElement): ShownComment[] {
    const keys = new Set<string>();
    for (let el: HTMLElement | null = mark; el && el !== root; el = el.parentElement) {
      if (el.matches(MARK)) keys.add(el.dataset.comment!);
    }
    return comments.filter((comment) => keys.has(comment.key));
  }

  function showCard(mark: HTMLElement, point?: { x: number; y: number }) {
    const shownComments = commentsAt(mark);
    if (!shown || shownComments.length === 0) return;
    clearTimeout(hideTimer);
    card.replaceChildren(...shownComments.map((comment) => renderComment(comment, t)));
    unmarkCard();
    cardFor = mark;
    mark.setAttribute('aria-describedby', card.id);
    // The whole of each passage lights up, not only the part of it under the pointer.
    const passages = shownComments.map((comment) => `mark.comment-mark[data-comment="${CSS.escape(comment.key)}"]`).join();
    for (const part of root.querySelectorAll(passages)) part.classList.add('is-active');
    placeCard(mark, point);
  }

  function hideCard() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    card.hidden = true;
    unmarkCard();
    cardFor = undefined;
  }

  function unmarkCard() {
    cardFor?.removeAttribute('aria-describedby');
    for (const part of root.querySelectorAll('mark.is-active')) part.classList.remove('is-active');
  }

  /** Under the line of the mark the pointer is on, or over it when there's no room below. */
  function placeCard(mark: HTMLElement, point?: { x: number; y: number }) {
    card.hidden = false;
    const rects = [...mark.getClientRects()];
    const rect =
      (point && rects.find((line) => point.y >= line.top && point.y <= line.bottom)) ?? rects[0] ?? mark.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = card;
    const below = rect.bottom + 6;
    const above = rect.top - height - 6;
    const top = below + height <= innerHeight - 8 || above < 8 ? below : above;
    const left = clamp(point && rects.length > 1 ? point.x - 24 : rect.left, 8, document.documentElement.clientWidth - width - 8);
    card.style.top = `${top + scrollY}px`;
    card.style.left = `${left + scrollX}px`;
  }

  root.addEventListener('pointerover', (event) => {
    const mark = markAt(event.target);
    if (event.pointerType !== 'mouse' || !mark) return;
    clearTimeout(hideTimer);
    if (mark === cardFor) return;
    clearTimeout(showTimer);
    showTimer = window.setTimeout(() => showCard(mark, { x: event.clientX, y: event.clientY }), 150);
  });

  root.addEventListener('pointerout', (event) => {
    const mark = markAt(event.target);
    const to = event.relatedTarget as Node | null;
    if (event.pointerType !== 'mouse' || !mark || (to && (card.contains(to) || markAt(to) === mark))) return;
    clearTimeout(showTimer);
    hideTimer = window.setTimeout(hideCard, 300);
  });

  card.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  card.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') hideTimer = window.setTimeout(hideCard, 300);
  });

  document.addEventListener(
    'pointerdown',
    (event) => {
      lastPointer = event.pointerType;
      const target = event.target as Node;
      if (!card.hidden && !card.contains(target) && !markAt(target)) hideCard();
    },
    true,
  );

  // Touch screens have no hover: a tap shows the card, another hides it.
  root.addEventListener('click', (event) => {
    const mark = markAt(event.target);
    if (!mark || !getSelection()?.isCollapsed) return;
    if (lastPointer !== 'mouse' && mark === cardFor) hideCard();
    else if (mark !== cardFor) showCard(mark, { x: event.clientX, y: event.clientY });
  });

  root.addEventListener('focusin', (event) => {
    const mark = markAt(event.target);
    if (mark && !refocusing) showCard(mark);
  });

  root.addEventListener('focusout', (event) => {
    if (markAt(event.target) && !card.contains(event.relatedTarget as Node | null)) hideCard();
  });

  // Enter on a highlighted passage moves into its card, to reach the links to GitHub.
  root.addEventListener('keydown', (event) => {
    const mark = markAt(event.target);
    if (!mark || event.key !== 'Enter') return;
    event.preventDefault();
    if (mark !== cardFor) showCard(mark);
    card.querySelector('a')?.focus();
  });

  card.addEventListener('focusout', (event) => {
    const to = event.relatedTarget as Node | null;
    if (!card.contains(to) && to !== cardFor) hideCard();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || card.hidden) return;
    const back = card.contains(document.activeElement) ? cardFor : undefined;
    hideCard();
    refocusing = true;
    back?.focus();
    refocusing = false;
  });

  window.addEventListener('resize', () => {
    float.hidden = true;
    hideCard();
  });

  // ---------- Header chip, signing in, messages ----------

  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target.closest('[data-comments-toggle]')) {
      shown = !shown;
      write(localStorage, SHOWN_KEY, shown ? '1' : '0');
      hideCard();
      paintChip();
    }
    // Signing in leaves the page; keep what's written for when the reader comes back.
    const written = target.closest('[data-comment-sign-in]') && currentDraft();
    if (written) write(sessionStorage, DRAFT_KEY, JSON.stringify({ ...written, file: page.file, at: Date.now() }));
  });

  function showToast(message: string, link?: { href: string; text: string }) {
    toast.replaceChildren(message);
    if (link && isGitHubUrl(link.href)) toast.append(' ', externalLink(link.href, link.text));
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.replaceChildren(), 8000);
  }

  paintChip();
  load().then(restoreDraft);
}

// ---------- Loading comments ----------

async function fetchComments(): Promise<PageComment[] | undefined> {
  try {
    const cached: { at: number; comments: PageComment[] } | null = JSON.parse(read(sessionStorage, COMMENTS_KEY) ?? 'null');
    if (cached && Date.now() - cached.at < CACHE_TIME && Array.isArray(cached.comments)) return cached.comments;
  } catch {
    // Loaded again below.
  }
  try {
    const response = await fetch('/api/comments', { headers: { Accept: 'application/json' } });
    // The API signed the reader out, as when their GitHub token was revoked.
    if (response.status === 401) paintAccount();
    if (!response.ok) return undefined;
    const { comments } = (await response.json()) as { comments: PageComment[] };
    write(sessionStorage, COMMENTS_KEY, JSON.stringify({ at: Date.now(), comments }));
    return comments;
  } catch {
    return undefined;
  }
}

// ---------- The text of a note ----------

/** Elements whose text isn't part of the note as it reads: KaTeX's copy for screen readers, and controls. */
const SKIP = 'script, style, template, textarea, button, select, .katex-mathml';

/** Elements that start a new line; a space between them keeps words apart in passages. */
const BLOCKS =
  'address, article, aside, blockquote, dd, details, div, dl, dt, figcaption, figure, footer, h1, h2, h3, h4, h5, h6, header, ' +
  'li, ol, p, pre, section, summary, table, tbody, td, tfoot, th, thead, tr, ul, .katex-display';

/** Characters that don't show, like soft hyphens and zero-width spaces. */
const INVISIBLE = /[­​-‍⁠﻿]/;

/** Characters words are made of. */
const WORD = /[\p{L}\p{M}\p{N}]/u;

interface TextIndex {
  text: string;
  /** Where each character of `text` is: a text node and the offset in it, or a formula and -1. */
  nodes: Node[];
  offsets: number[];
}

/**
 * The note's text as it reads, and where each character of it is on the page. Marks don't
 * change it, so it's the same with comments highlighted; it's made again after each change.
 */
function indexText(root: HTMLElement): TextIndex {
  const chars: string[] = [];
  const nodes: Node[] = [];
  const offsets: number[] = [];
  // Before the next character comes a space: where whitespace started, or null between blocks.
  let space: [Node, number] | null | undefined;

  const gap = (at: [Node, number] | null) => {
    if (space === undefined) space = at;
  };
  const add = (char: string, node: Node, offset: number) => {
    if (space !== undefined && chars.length > 0) {
      chars.push(' ');
      nodes.push(space ? space[0] : node);
      offsets.push(space ? space[1] : offset);
    }
    space = undefined;
    chars.push(char);
    nodes.push(node);
    offsets.push(offset);
  };

  const walk = (parent: Node) => {
    for (let node = parent.firstChild; node; node = node.nextSibling) {
      if (node instanceof Text) {
        const { data } = node;
        for (let i = 0; i < data.length; i++) {
          if (INVISIBLE.test(data[i])) continue;
          if (/\s/.test(data[i])) gap([node, i]);
          else add(data[i], node, i);
        }
      } else if (node instanceof Element && !node.matches(SKIP)) {
        if (node.matches('br, hr, img')) {
          gap(null);
        } else if (node.classList.contains('katex')) {
          const tex = node.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim().replace(/\s+/g, ' ');
          const math = !tex ? '' : node.parentElement?.classList.contains('katex-display') ? `$$${tex}$$` : `$${tex}$`;
          for (let i = 0; i < math.length; i++) add(math[i], node, -1);
        } else {
          const isBlock = node.matches(BLOCKS);
          if (isBlock) gap(null);
          walk(node);
          if (isBlock) gap(null);
        }
      }
    }
  };
  walk(root);
  return { text: chars.join(''), nodes, offsets };
}

/** The boundary point right before character `i`. */
function pointOf(index: TextIndex, i: number): [Node, number] {
  const node = index.nodes[i];
  if (index.offsets[i] !== -1) return [node, index.offsets[i]];
  return [node.parentNode!, childIndex(node)];
}

function childIndex(node: Node): number {
  return Array.prototype.indexOf.call(node.parentNode!.childNodes, node);
}

/**
 * The characters a range covers, as `[start, end)`, without spaces at either end. A range that
 * starts or ends inside a word covers the whole word.
 */
function spanOf(index: TextIndex, range: Range): [number, number] | undefined {
  const probe = document.createRange();
  /** The first character at or after a point; a point inside a formula counts as before it or, for `after`, after it. */
  const characterAt = (node: Node, offset: number, after: boolean): number => {
    const math = (node instanceof Element ? node : node.parentElement)?.closest('.katex');
    if (math?.parentNode) {
      offset = childIndex(math) + (after ? 1 : 0);
      node = math.parentNode;
    }
    probe.setStart(node, offset);
    probe.collapse(true);
    let low = 0;
    let high = index.text.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      const [n, o] = pointOf(index, middle);
      if (probe.comparePoint(n, o) < 0) low = middle + 1;
      else high = middle;
    }
    return low;
  };
  let start = characterAt(range.startContainer, range.startOffset, false);
  let end = characterAt(range.endContainer, range.endOffset, true);
  while (start < end && index.text[start] === ' ') start++;
  while (end > start && index.text[end - 1] === ' ') end--;
  if (start >= end) return undefined;
  // Formulas are never words, so this doesn't reach into one.
  const isWord = (i: number) => index.offsets[i] !== -1 && WORD.test(index.text[i] ?? '');
  while (isWord(start - 1) && isWord(start)) start--;
  while (isWord(end - 1) && isWord(end)) end++;
  return [start, end];
}

function quoteAt(index: TextIndex, [start, end]: [number, number]): TextQuote {
  return {
    exact: index.text.slice(start, end),
    prefix: index.text.slice(Math.max(0, start - CONTEXT), start),
    suffix: index.text.slice(end, end + CONTEXT),
  };
}

/**
 * Where a passage is now: where its text is, with most of the text it had around it. Quotes
 * count as the same whether they're straight or curly, as the notes and the pages have them.
 */
function findQuote(index: TextIndex, quote: TextQuote): [number, number] | undefined {
  const text = foldQuotes(index.text);
  const exact = foldQuotes(quote.exact);
  const prefix = foldQuotes(quote.prefix);
  const suffix = foldQuotes(quote.suffix);
  let best: [number, number] | undefined;
  let bestScore = -1;
  for (let at = text.indexOf(exact); at !== -1 && exact; at = text.indexOf(exact, at + 1)) {
    const end = at + exact.length;
    let score = 0;
    while (score < prefix.length && text[at - score - 1] === prefix[prefix.length - score - 1]) score++;
    for (let i = 0; i < suffix.length && text[end + i] === suffix[i]; i++) score++;
    if (score > bestScore) {
      best = [at, end];
      bestScore = score;
    }
  }
  return best;
}

/** Each quote as a straight one: one character for one, so the text's positions stay the same. */
function foldQuotes(text: string): string {
  return text.replace(/[‘’‚‛]/g, "'").replace(/[“”„‟]/g, '"');
}

/** Wraps characters `[start, end)` in marks from `make`: one for each text node or formula they're in. */
function highlight(index: TextIndex, [start, end]: [number, number], make: () => HTMLElement): HTMLElement[] {
  const marks: HTMLElement[] = [];
  for (let i = start, j = start; i < end; i = j) {
    const node = index.nodes[i];
    while (j < end && index.nodes[j] === node) j++;
    if (index.offsets[i] === -1) {
      // A displayed formula is a block: its mark goes around the block, where KaTeX's styles still apply.
      const display = node.parentElement?.classList.contains('katex-display') ? node.parentElement : undefined;
      const mark = make();
      if (display) mark.classList.add('is-display');
      (display ?? (node as Element)).before(mark);
      mark.append(display ?? node);
      marks.push(mark);
      continue;
    }
    const text = node as Text;
    const from = index.offsets[i];
    const to = index.offsets[j - 1] + 1;
    // Whitespace between blocks, like the line break between two list items, stays as it is.
    if (!text.data.slice(from, to).trim()) continue;
    const range = document.createRange();
    range.setStart(text, from);
    range.setEnd(text, to);
    const mark = make();
    range.surroundContents(mark);
    marks.push(mark);
  }
  return marks;
}

function unwrap(mark: HTMLElement) {
  const parent = mark.parentNode;
  if (!parent) return;
  mark.replaceWith(...mark.childNodes);
  parent.normalize();
}

/** The selection, if it's in the note; one that goes beyond it is cut to the note. */
function selectedRange(selection: Selection, root: HTMLElement): Range | undefined {
  if (selection.isCollapsed || selection.rangeCount === 0) return undefined;
  const range = selection.getRangeAt(0).cloneRange();
  if (!range.intersectsNode(root)) return undefined;
  if (!root.contains(range.startContainer)) range.setStart(root, 0);
  if (!root.contains(range.endContainer)) range.setEnd(root, root.childNodes.length);
  return range;
}

/** Whether the selection was made from its end to its start, so the pointer is at the start. */
function isBackward(selection: Selection): boolean {
  const { anchorNode, focusNode } = selection;
  if (!anchorNode || !focusNode) return false;
  if (anchorNode === focusNode) return selection.focusOffset < selection.anchorOffset;
  return Boolean(anchorNode.compareDocumentPosition(focusNode) & Node.DOCUMENT_POSITION_PRECEDING);
}

function isQuote(value: unknown): value is TextQuote {
  const quote = value as Partial<TextQuote> | null;
  return typeof quote?.exact === 'string' && typeof quote.prefix === 'string' && typeof quote.suffix === 'string' && quote.exact !== '';
}

// ---------- Showing a comment ----------

function renderComment(comment: ShownComment, t: Strings): HTMLElement {
  const article = element('article', 'comment-entry');

  const header = element('header', 'comment-entry-header');
  const avatar = document.createElement('img');
  avatar.className = 'avatar';
  avatar.alt = '';
  avatar.width = avatar.height = 24;
  const src = avatarUrl(comment.author.avatar, 24);
  if (src) avatar.src = src;
  const time = element('time', '', ago(comment.created, t.lang));
  time.setAttribute('datetime', comment.created);
  time.title = new Date(comment.created).toLocaleString(t.lang);
  header.append(avatar, element('strong', 'comment-author', `@${comment.author.login}`), time, element('span', 'comment-status', t.awaitingMerge));
  article.append(header);

  // The version the reader commented on, where the comment's passage is.
  if (comment.from) {
    const origin = element('p', 'comment-origin');
    const page = new URL(localizeUrl(comment.path, comment.from), location.href);
    // Linked only when it's a page of this site, whatever the pull request says.
    if (page.origin === location.origin) {
      const link = element('a', '', t.onVersion[comment.from]);
      link.href = page.href;
      origin.append(link);
    } else {
      origin.append(t.onVersion[comment.from]);
    }
    article.append(origin);
  }
  if (comment.comment) article.append(element('p', 'comment-body', comment.comment));
  const change = element('div', 'comment-change');
  change.append(element('p', 'comment-change-label', t.votedChange), element('del', '', comment.text));
  if (comment.suggestion) change.append(element('ins', '', comment.suggestion));
  article.append(change);

  // Where the change was discussed and voted in, and where it waits to be merged.
  const footer = element('footer', 'comment-entry-footer');
  if (isGitHubUrl(comment.issue.url)) footer.append(externalLink(comment.issue.url, t.discussion));
  if (isGitHubUrl(comment.url)) footer.append(externalLink(comment.url, t.pullRequest));
  article.append(footer);
  return article;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function externalLink(href: string, text: string): HTMLAnchorElement {
  const link = element('a', '', text);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener';
  return link;
}

function isGitHubUrl(url: string): boolean {
  return url.startsWith('https://github.com/');
}

/** `3 days ago`, in the page's language. */
function ago(date: string, lang: Lang): string {
  const seconds = (Date.parse(date) - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 86400],
    ['month', 30 * 86400],
    ['week', 7 * 86400],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, 'second');
}

function clip(text: string, length: number): string {
  return text.length <= length ? text : `${text.slice(0, length - 1).trimEnd()}…`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

// ---------- Storage, which can be unavailable, as in private windows ----------

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Not kept; works for this page anyway.
  }
}

function remove(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // Nothing kept.
  }
}
