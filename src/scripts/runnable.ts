/**
 * Lessons' runnable examples: Python code blocks whose fence says `run` (markdown.ts marks them)
 * get a Run button, which runs the code with Python in the browser (python.ts), and an Edit
 * button, which puts it in an editor (editor.ts). Both load only when they're first used, so
 * lessons stay as quick to open as before.
 */
import type { EditorView } from './editor.ts';
import { describeRun, element, say, setRunning, write, type Strings } from './running.ts';

/** What reads a line of input, so the example needs an input box. */
const READS_INPUT = /\binput\s*\(/;

const blocks = document.querySelectorAll<HTMLPreElement>('.prose pre[data-run]');
const template = document.querySelector<HTMLTemplateElement>('template[data-runnable]');
const strings = document.querySelector('[data-runnable-strings]');
if (blocks.length && template && strings) {
  const t: Strings = JSON.parse(strings.textContent!);
  blocks.forEach((pre, i) => setUpExample(pre, i + 1, template, t));
}

function setUpExample(pre: HTMLPreElement, number: number, template: HTMLTemplateElement, t: Strings) {
  // The parts are looked up before they join the code block, which has a data-run of its own.
  const parts = template.content.cloneNode(true) as DocumentFragment;
  const runButton = parts.querySelector<HTMLButtonElement>('[data-run]')!;
  const editButton = parts.querySelector<HTMLButtonElement>('[data-edit]')!;
  const restoreButton = parts.querySelector<HTMLButtonElement>('[data-restore]')!;
  const inputField = parts.querySelector<HTMLElement>('[data-input-field]')!;
  const input = parts.querySelector<HTMLTextAreaElement>('[data-input]')!;
  const hint = parts.querySelector<HTMLElement>('[data-input-hint]')!;
  const status = parts.querySelector<HTMLElement>('[data-status]')!;
  const output = parts.querySelector<HTMLElement>('[data-output]')!;
  const box = element('div', 'runnable');
  pre.before(box);
  box.append(pre, parts);
  const original = pre.textContent ?? '';
  inputField.hidden = !READS_INPUT.test(original);
  hint.id = `example-${number}-input-hint`;
  input.setAttribute('aria-describedby', hint.id);

  let editor: EditorView | undefined;
  let running = false;
  /** Counts this example's runs, so one that was replaced leaves the example alone when it ends. */
  let runs = 0;

  async function start() {
    const mine = ++runs;
    running = true;
    setRunning(runButton, true, t.stop);
    say(status, '');
    output.replaceChildren();
    output.hidden = true;
    const code = editor?.state.doc.toString() ?? original;
    const { run } = await import('./python.ts');
    // Running another example stops this one, which then says it was stopped.
    const outcome = await run(code, input.value, '{}', {
      onLoading: () => mine === runs && say(status, t.loading),
      onOutput: (kind, text) => {
        if (mine !== runs) return;
        say(status, '');
        output.hidden = false;
        write(output, kind, text);
      },
    });
    if (mine !== runs) return;
    running = false;
    setRunning(runButton, false, t.run);
    say(status, describeRun(outcome, Boolean(output.textContent), t));
  }

  runButton.addEventListener('click', async () => {
    if (!running) return start();
    const { stop } = await import('./python.ts');
    stop();
  });

  editButton.addEventListener('click', async () => {
    const [{ createEditor }, { warmUp }] = await Promise.all([import('./editor.ts'), import('./python.ts')]);
    if (editor) return;
    // Whoever edits an example is about to run it.
    warmUp();
    const holder = element('div', 'runnable-editor');
    pre.after(holder);
    editor = createEditor({ parent: holder, code: original, label: t.editor, onRun: start });
    pre.hidden = true;
    editButton.hidden = true;
    restoreButton.hidden = false;
    editor.focus();
  });

  // Back to the example as the lesson wrote it, without what the reader's version printed.
  restoreButton.addEventListener('click', async () => {
    if (!editor) return;
    editor.dom.parentElement!.remove();
    editor.destroy();
    editor = undefined;
    pre.hidden = false;
    restoreButton.hidden = true;
    editButton.hidden = false;
    editButton.focus();
    runs++;
    output.replaceChildren();
    output.hidden = true;
    say(status, '');
    if (!running) return;
    running = false;
    setRunning(runButton, false, t.run);
    const { stop } = await import('./python.ts');
    stop();
  });
}
