# ML-workout

My machine learning notes, published as a course website in English and Polish.

Every Markdown file in [`notes/`](notes/) becomes a lesson and every folder becomes a chapter. Each push to `main` makes Netlify build and publish a new version of the site.

## Writing lessons

```text
notes/
├── README.md                ← introduction on the home page
├── README.pl.md             ← the same in Polish
├── 01-start-here/           ← chapter "Start here"
│   ├── README.md            ← chapter introduction (title and description)
│   ├── 01-how-this-works.md ← lesson "How this works"
│   └── 02-markdown-cheatsheet.md
├── 02-foundations/
│   └── 01-what-is-machine-learning.md
└── vocabulary/              ← no numbers, so sorted by title
    └── sft.md
```

- Numbered files and folders (`01-`, `02-`, …) come first, in number order, and the rest follow alphabetically by title. The numbers don't appear in titles or addresses.
- A lesson's title comes from `title:` in its frontmatter, else its first `# Heading`, else its file name.
- Frontmatter is optional: `title`, `description`, and `draft: true` to hide a lesson.
- Link notes to each other with relative paths (`../02-foundations/01-what-is-machine-learning.md`); the links work on GitHub and on the site.
- Math (`$…$` and `$$…$$`), highlighted code, tables, task lists, footnotes and GitHub callouts (`> [!TIP]`) all work.

The [How this works](notes/01-start-here/01-how-this-works.md) and [Markdown cheatsheet](notes/01-start-here/02-markdown-cheatsheet.md) lessons have the details.

## Translations

English pages are at the root of the site and Polish ones under `/pl/`. A translation sits next to its original: `sft.pl.md` is the Polish version of `sft.md` and is published at `/pl/vocabulary/sft/`. Until a note is translated, the Polish site shows the original with a notice and a link for adding the translation on GitHub. Progress is shared between the languages.

## Running it locally

Needs Node.js 22.12 or newer.

```sh
npm install
npm run dev     # http://localhost:4321, reloads as you edit notes
npm run build   # production build into dist/
npm run check   # type-check the site code
```

## Deployment

Netlify builds the site from this repository. The settings are in [`netlify.toml`](netlify.toml): it runs `npm run build` on Node 24, publishes `dist/`, and serves the Polish "page not found" page for missing addresses under `/pl/`. A push to `main` deploys to production. If a build fails, the previous version stays online, and the Netlify deploy log explains what went wrong.

## Code

Built with [Astro](https://astro.build). The code is in `src/`:

- `lib/i18n.ts` lists the languages and holds the interface text in each of them.
- `lib/course.ts` turns the notes into chapters and lessons, one course per language, and picks each note's translation.
- `lib/paths.ts` turns file paths into titles and addresses.
- `lib/markdown.ts` handles math, callouts, footnotes, the leading heading and links between notes.
- `pages/` holds the home, chapter, lesson and 404 pages, and `pages/[lang]/` the home and 404 pages of the other languages. `components/` holds the parts the pages are built from, and `styles/global.css` the styling.
- `scripts/app.ts` handles lesson progress (saved in the browser), the dark theme and the mobile menu.
- `site.config.ts` holds the site title, the tagline in each language and the GitHub repository.

To add a language, add its code to `LANGS` in `lib/i18n.ts` and run `npm run check`, which lists the text still missing for it. Then add a "page not found" rule for it to `netlify.toml`, like the one for `/pl/`.
