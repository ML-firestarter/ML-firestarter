# How this works

## Which of these files in `notes/` is *not* a lesson?

- [ ] `02-foundations/02-linear-regression.md`
- [ ] `vocabulary/agent.md`
- [x] `02-foundations/README.md`
- [ ] `01-start-here/02-markdown-cheatsheet.md`

A folder's `README.md` (or `index.md`) is the introduction on its chapter's page. Every other `.md` file is a lesson, and every folder is a chapter.

## Where is `02-foundations/01-what-is-machine-learning.md` published?

- [ ] `/02-foundations/01-what-is-machine-learning/`
- [x] `/foundations/what-is-machine-learning/`
- [ ] `/foundations/01-what-is-machine-learning/`
- [ ] `/what-is-machine-learning/`

The numbers only set the order, so they're left out of the address and the title. That's why renumbering a lesson keeps its address, while renaming it doesn't.

## A lesson saved as `03-descent.md` has `title: Gradient descent, step by step` in its frontmatter and starts with `# Gradient descent`. What's its title?

- [ ] Gradient descent
- [ ] Descent
- [x] Gradient descent, step by step
- [ ] 03 descent

The frontmatter `title` comes first, then the `# Heading` on the first line, and only then the file name.

## How do you add a Polish version of `notes/vocabulary/sft.md`?

- [x] Save it next to the original as `sft.pl.md`
- [ ] Save it as `notes/pl/vocabulary/sft.md`
- [ ] Add a Polish section at the end of `sft.md`
- [ ] Add `lang: pl` to the frontmatter of `sft.md`

A translation sits next to its original, with the language code before `.md`. It's published at the original's address under `/pl/`, like `/pl/vocabulary/sft/`.

## Which of these are true about **Mark lesson as done**?

- [x] Progress is saved in this browser only
- [ ] Progress syncs between your devices
- [x] A lesson marked as done in English also counts as done in Polish
- [ ] Renaming the lesson's file keeps its tick

Progress is kept in the browser, so it doesn't sync between devices, and it's shared between languages. A renamed lesson gets a new address and loses its tick.

## Where does the test for `notes/vocabulary/sft.md` go?

- [ ] At the end of `notes/vocabulary/sft.md`, under a `## Test` heading
- [x] In `tests/vocabulary/sft.md`
- [ ] In `notes/vocabulary/sft.test.md`
- [ ] In `tests/sft.md`

A test has the same path in `tests/` as its lesson in `notes/`, and its Polish translation is `tests/vocabulary/sft.pl.md`.

## A test question has two answers marked `[x]`. How does it work?

- [ ] It gets radio buttons, and either right answer counts
- [x] It gets checkboxes, and counts as right only when both right answers, and nothing else, are picked
- [ ] It gets checkboxes, and each right answer picked earns half a point
- [ ] The build fails, because a question can only have one right answer

One `[x]` gives radio buttons and several give checkboxes. A question counts as right only when exactly its right answers are picked; there are no half points.
