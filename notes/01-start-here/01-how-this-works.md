---
description: How your Markdown files become lessons, and how a push to GitHub updates the site.
---

# How this works

This site is built from the `notes` folder of the ML-workout repository on GitHub. Every time you push a change, Netlify rebuilds the site and publishes the new version, usually within a minute.

## Lessons and chapters

- Every `.md` file in `notes/` is a **lesson**.
- Every folder is a **chapter**. Folders inside folders become sub-chapters.
- A `README.md` (or `index.md`) is not a lesson. It's the introduction shown on its chapter's page, and the one directly in `notes/` is the introduction on the home page.

```text
notes/
├── README.md                        ← home page introduction
├── 01-start-here/
│   ├── 01-how-this-works.md         ← a lesson
│   └── 02-markdown-cheatsheet.md
└── 02-foundations/
    ├── README.md                    ← chapter introduction
    ├── 01-what-is-machine-learning.md
    ├── 02-linear-regression.md
    └── images/
        └── linear-regression.svg
```

## Order and names

Files and folders are sorted by name, so start each name with a number: `01-`, `02-`, `03-`… The number is left out of the page address and the title, so `02-foundations/01-what-is-machine-learning.md` is published at `/foundations/what-is-machine-learning/`.

A lesson's title is, in order of preference:

1. the `title` in its frontmatter,
2. the `# Heading` on its first line,
3. its file name: `03-gradient-descent.md` becomes "Gradient descent".

A chapter's title is the first heading of its `README.md`, or else its folder name.

> [!NOTE]
> Renaming a file changes its address. Links between your notes keep working because they're resolved on every build, but a renamed lesson loses its "done" tick.

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

Link to another note by its file path, just as you would on GitHub, for example `[Linear regression](../02-foundations/02-linear-regression.md)`. The link works on GitHub and on this site. Add `#section-name` to jump to a heading, like [the normal equation](../02-foundations/02-linear-regression.md#the-normal-equation).

Keep images next to your notes (an `images` folder works well) and use a relative path: `![A scatter plot](images/scatter.png)`.

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

## Tracking progress

Press **Mark lesson as done** at the end of a lesson. Progress is stored in this browser only, so it doesn't sync between devices.
