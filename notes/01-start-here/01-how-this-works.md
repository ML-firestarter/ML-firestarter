---
description: How your Markdown files become lessons, and how a push to GitHub updates the site.
---

# How this works

This site is built from the `notes` folder of the ML-firestarter repository on GitHub. Every time you push a change, Netlify rebuilds the site and publishes the new version, usually within a minute.

## Lessons and chapters

- Every `.md` file in `notes/` is a **lesson**.
- Every folder is a **chapter**. Folders inside folders become sub-chapters.
- A `README.md` (or `index.md`) is not a lesson. It's the introduction shown on its chapter's page, and the one directly in `notes/` is the introduction on the home page.

```text
notes/
├── README.md                        ← home page introduction
├── README.pl.md                     ← the same in Polish
├── 01-start-here/
│   ├── README.md                    ← chapter introduction
│   ├── 01-how-this-works.md         ← a lesson
│   ├── 01-how-this-works.pl.md      ← its Polish translation
│   └── 02-markdown-cheatsheet.md
├── 02-python/
│   ├── README.md
│   └── 01-basics/                   ← a sub-chapter
│       ├── README.md
│       └── 01-running-python.md
├── 04-foundations/
│   ├── README.md
│   ├── 01-what-is-machine-learning.md
│   ├── 02-linear-regression.md
│   └── images/
│       └── linear-regression.svg
└── vocabulary/                      ← no numbers: sorted by title
    ├── README.md
    ├── agent.md
    └── arr.md
```

## Order and names

Files and folders whose names start with a number, like `01-`, `02-`, `03-`…, come first, in number order. Everything else follows alphabetically by title, which suits reference chapters such as the vocabulary. The number is left out of the page address and the title, so `04-foundations/01-what-is-machine-learning.md` is published at `/foundations/what-is-machine-learning/`.

A lesson's title is, in order of preference:

1. the `title` in its frontmatter,
2. the `# Heading` on its first line,
3. its file name: `03-gradient-descent.md` becomes "Gradient descent".

A chapter's title is the first heading of its `README.md`, or else its folder name.

> [!NOTE]
> Renaming a file changes its address, unless only its number changes. Links between your notes keep working because they're resolved on every build, but a renamed lesson loses its "done" tick.

## Frontmatter

Optional settings go at the very top of a file, between `---` lines:

```yaml
---
title: Gradient descent, step by step
description: A one-line summary shown under the title and in lesson lists.
draft: true # hides the lesson until you remove this line or set it to false
---
```

## Links and images

Link to another note by its file path, just as you would on GitHub, for example `[Linear regression](../04-foundations/02-linear-regression.md)`. The link works on GitHub and on this site. Add `#section-name` to jump to a heading, like [the normal equation](../04-foundations/02-linear-regression.md#the-normal-equation).

Keep images next to your notes (an `images` folder works well) and use a relative path: `![A scatter plot](images/scatter.png)`.

## Translations

The site comes in English and Polish. English pages are at the usual addresses, like `/vocabulary/sft/`, and Polish ones under `/pl/`, like `/pl/vocabulary/sft/`. The **PL** and **EN** buttons at the top switch to the same page in the other language.

To translate a note, save the translation next to it with the language code before `.md`: `sft.pl.md` is the Polish version of `sft.md`. Translate each chapter's `README.md` too, because the chapter's title comes from it. Pictures with text in them can have a translated copy of their own, like the `images/linear-regression.pl.svg` used by the Polish linear regression lesson.

- A page that isn't translated yet still appears in the Polish version, in English, with a link for adding the translation on GitHub.
- On the site, a link to `sft.md` and a link to `sft.pl.md` both open the page in the reader's language. Link Polish notes to Polish files anyway, so the links work on GitHub too.
- Progress is shared: a lesson marked as done in one language counts as done in the other.

## Writing and publishing

1. Edit a note. Every lesson has an **Edit on GitHub** link, or you can clone the repository and use any editor.
2. Commit and push to the `main` branch.
3. Netlify builds and publishes the site. If something is wrong with a note (for example two files that would get the same address), the build fails with an explanation in the Netlify deploy log, and the previous version stays online.

To preview changes on your computer before pushing, run this in the repository folder:

```sh
npm install
npm run dev
```

Then open <http://localhost:4321>. Pages update as you save.

## Tests

Every lesson can have a short test in the **Tests** tab. A test is a Markdown file in the `tests` folder, at the same path as its lesson in `notes`: `tests/vocabulary/sft.md` tests `notes/vocabulary/sft.md`, and `tests/vocabulary/sft.pl.md` is its Polish translation. The test takes its title from the lesson.

Each `## Heading` in a test is a question. The checklist under it holds the answers, `[x]` for right ones and `[ ]` for wrong ones. Anything after the list explains the answer and shows once the answers are checked:

```md
## Why is SFT called *supervised*?

- [x] Every example comes with the answer to imitate
- [ ] People watch the model while it trains
- [ ] The model supervises its own training

In RL, by contrast, the model only gets a score.
```

- A question with several `[x]` answers gets checkboxes, and counts as right only when exactly its right answers are picked.
- Text, math, code or a picture between the heading and the list is part of the question.
- The answers come in a new order on every attempt, so avoid answers like "Both of the above".
- A test is passed when at least 80% of its questions are answered right. The pass mark is `passScore` in `src/site.config.ts`.
- `draft: true` in its frontmatter hides a test, and a hidden lesson's test is hidden too.
- If a test has a mistake, such as a question without a right answer, or there's no lesson at its path, the build fails and says what to fix.

## Exercises

Lessons can end with exercises: small Python tasks that you solve in the page. There's nothing to install, because Python runs in your browser. The first time you run some code, the browser downloads Python, about 6 MB, which takes a few seconds. After that it starts right away.

An exercise's page has the task, an editor with the code to start from, and these buttons:

- **Run** runs your code and shows what it prints under **Output**. When the code reads what's typed in with `input()`, type that in the **Input** box first, one line for each `input()`.
- **Check** runs the exercise's checks on your code and says which ones pass, and for the others, what your code did and what it should have done.
- **Stop** ends code that runs too long, like a loop that never ends. Each check stops on its own after 10 seconds.
- **Start over** puts back the code you started from, and <kbd>Ctrl</kbd>+<kbd>Z</kbd> (<kbd>⌘</kbd>+<kbd>Z</kbd> on a Mac) in the editor brings yours back.

Once your code passes every check, **Our solution** appears under it. Yours doesn't have to look the same: any code that passes the checks is right. Your code is saved in this browser as you type, so you can leave and come back to it.

The code examples in lessons run too: press **Run** under an example, or **Edit** to change it first. **Undo changes** brings back the lesson's version.

To write an exercise, make a folder for it in `exercises/`, inside a folder with its lesson's path, the way tests sit at their lesson's path:

```text
exercises/02-python/01-basics/01-running-python/
└── 01-how-long-is-a-week/
    ├── task.md       ← the task, written like a lesson
    ├── task.pl.md    ← its Polish translation
    ├── starter.py    ← the code the reader starts from
    ├── solution.py   ← our solution
    └── checks.py     ← what the code has to do
```

`checks.py` lists the checks: each is a Python expression with what it should give, which is a value, `raises(SomeError)` for an error, or `prints("…")` for printed text. `program()` runs the whole file, and `program("3", "4")` runs it with those two lines typed in:

```python
CHECKS = [
    ("area(2, 3)", 6),
    ("program('3', '4')", prints("Width? 3\nHeight? 4\nArea: 12\n")),
]
```

To make a Python example in a lesson runnable, write `python run` after the backticks that open its code block. The [README](https://github.com/ML-firestarter/ML-firestarter#writing-exercises) has the details, including `npm run check:exercises`, which makes sure every solution passes its checks.

## Tracking progress

Press **Mark lesson as done** at the end of a lesson. After you take a test, your best score shows in the **Tests** tab and at the end of the lesson. The exercises you've passed get a tick in the lesson's list of exercises, and the sidebar counts them. Progress, scores and your exercises are shared between the languages and stored in this browser only, so they don't sync between devices.
