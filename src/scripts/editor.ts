/**
 * The code editor, on exercise pages (exercise.ts) and in lessons' examples once the reader
 * edits them (runnable.ts): CodeMirror, set up for Python. Its colours are the site's (the
 * --code-* variables in global.css), which match the lessons' code, highlighted by Shiki.
 */
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { bracketMatching, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, drawSelection, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers } from '@codemirror/view';
import { tagHighlighter, tags } from '@lezer/highlight';

export type { EditorView };

/** Classes for Python's parts, coloured like Shiki's GitHub themes colour them. */
const highlighter = tagHighlighter([
  {
    tag: [
      tags.keyword,
      tags.modifier,
      tags.arithmeticOperator,
      tags.bitwiseOperator,
      tags.compareOperator,
      tags.definitionOperator,
      tags.updateOperator,
    ],
    class: 'tok-keyword',
  },
  { tag: tags.string, class: 'tok-string' },
  // Shiki colours the functions Python has, like print(), this way, and the reader's calls are mostly to those.
  { tag: [tags.number, tags.bool, tags.null, tags.escape, tags.function(tags.variableName)], class: 'tok-constant' },
  { tag: tags.comment, class: 'tok-comment' },
  { tag: [tags.function(tags.definition(tags.variableName)), tags.definition(tags.className), tags.meta], class: 'tok-definition' },
]);

const theme = EditorView.theme({
  '&': {
    color: 'var(--text)',
    backgroundColor: 'var(--surface)',
    fontSize: '0.87rem',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  '.cm-content': { padding: '0.75rem 0', caretColor: 'var(--text)' },
  '.cm-line': { padding: '0 1rem 0 0.75rem' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--text)' },
  '.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--code-selection)',
  },
  '.cm-gutters': {
    borderRight: '1px solid var(--border)',
    backgroundColor: 'var(--surface-2)',
    color: 'var(--muted)',
  },
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '2.5em', padding: '0 0.6em 0 0.4em' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--text)' },
  '&.cm-focused .cm-matchingBracket': { backgroundColor: 'var(--code-bracket)', outline: 'none' },
  '&.cm-focused .cm-nonmatchingBracket': { backgroundColor: 'transparent', outline: '1px solid var(--caution)' },
});

interface Options {
  /** Where the editor goes. */
  parent: HTMLElement;
  code: string;
  /** Names the editor for screen readers. */
  label: string;
  onChange?(code: string): void;
  /** Called on Ctrl+Enter, or ⌘+Enter on a Mac. */
  onRun?(): void;
}

export function createEditor({ parent, code, label, onChange, onRun }: Options): EditorView {
  return new EditorView({
    parent,
    state: EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        python(),
        syntaxHighlighting(highlighter),
        indentUnit.of('    '),
        EditorState.tabSize.of(4),
        keymap.of([
          { key: 'Mod-Enter', run: () => (onRun?.(), true) },
          ...defaultKeymap,
          ...historyKeymap,
          // Tab indents; Escape and then Tab leaves the editor, as CodeMirror does.
          indentWithTab,
        ]),
        EditorView.contentAttributes.of({ 'aria-label': label }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChange?.(update.state.doc.toString());
        }),
        theme,
      ],
    }),
  });
}

/** Replaces the editor's code in a way Ctrl+Z undoes. */
export function setCode(view: EditorView, code: string) {
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
}
