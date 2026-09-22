/**
 * The test page's form (TestView.astro): shuffles each question's answers, marks
 * them when the answers are checked, and saves the score (scores.ts).
 * A question counts as right when exactly its right answers are picked.
 */
import { isPass, percent, recordScore } from './scores.ts';

const form = document.querySelector<HTMLFormElement>('form[data-quiz]');
if (form) setUpQuiz(form);

function setUpQuiz(form: HTMLFormElement) {
  const questions = [...form.querySelectorAll<HTMLElement>('[data-question]')];
  const submitRow = form.querySelector<HTMLElement>('[data-submit-row]')!;
  const answered = form.querySelector<HTMLElement>('[data-answered]')!;
  const result = form.querySelector<HTMLElement>('[data-result]')!;

  function paintAnswered() {
    const count = questions.filter((question) => question.querySelector('input:checked')).length;
    answered.textContent = `${count}/${questions.length}`;
  }

  /** New order on every attempt, so answers are recalled rather than their places. */
  function shuffle() {
    for (const fieldset of form.querySelectorAll('fieldset')) {
      const answers = [...fieldset.children];
      for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
      }
      fieldset.append(...answers);
    }
  }

  function check() {
    let right = 0;
    for (const question of questions) {
      const inputs = [...question.querySelectorAll<HTMLInputElement>('fieldset input')];
      const isRight = (input: HTMLInputElement) => input.dataset.right !== undefined;
      const state = !inputs.some((input) => input.checked)
        ? 'skipped'
        : inputs.every((input) => input.checked === isRight(input))
          ? 'right'
          : 'wrong';
      if (state === 'right') right++;
      for (const input of inputs) {
        const answer = input.closest('.answer')!;
        answer.classList.toggle('is-answer', isRight(input));
        answer.classList.toggle('is-picked', input.checked);
      }
      question.classList.add('is-checked', `is-${state}`);
      question.querySelector<HTMLElement>('.feedback')!.hidden = false;
      question.querySelector('fieldset')!.disabled = true;
    }

    const share = questions.length ? right / questions.length : 0;
    recordScore(form.dataset.quiz!, share);
    result.classList.toggle('is-passed', isPass(share));
    result.querySelector('[data-result-percent]')!.textContent = percent(share);
    result.querySelector('[data-result-count]')!.textContent = `${right}/${questions.length}`;
    submitRow.hidden = true;
    result.hidden = false;
    result.focus();
  }

  function retry() {
    form.reset();
    for (const question of questions) {
      question.classList.remove('is-checked', 'is-right', 'is-wrong', 'is-skipped');
      question.querySelector<HTMLElement>('.feedback')!.hidden = true;
      question.querySelector('fieldset')!.disabled = false;
      for (const answer of question.querySelectorAll('.answer')) answer.classList.remove('is-answer', 'is-picked');
    }
    shuffle();
    paintAnswered();
    result.hidden = true;
    submitRow.hidden = false;
    form.querySelector('input')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }

  form.addEventListener('change', paintAnswered);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    check();
  });
  form.querySelector('[data-retry]')!.addEventListener('click', retry);

  shuffle();
  paintAnswered();
}
