# ML-workout

My machine learning notes, published as a course website.

Every Markdown file in [`notes/`](notes/) becomes a lesson and every folder becomes a chapter. Each push to `main` makes Netlify build and publish a new version of the site.

## Writing lessons

```text
notes/
├── README.md                ← introduction on the home page
├── 01-start-here/           ← chapter "Start here"
│   ├── 01-how-this-works.md ← lesson "How this works"
│   └── 02-markdown-cheatsheet.md
└── 02-foundations/
    ├── README.md            ← chapter introduction (title and description)
    └── 01-what-is-machine-learning.md
```

- Number files and folders (`01-`, `02-`, …) to set their order. The numbers don't appear in titles or addresses.
- A lesson's title comes from `title:` in its frontmatter, else its first `# Heading`, else its file name.
- Frontmatter is optional: `title`, `description`, and `draft: true` to hide a lesson.
- Link notes to each other with relative paths (`../02-foundations/01-what-is-machine-learning.md`); the links work on GitHub and on the site.
- Math (`$…$` and `$$…$$`), highlighted code, tables, task lists, footnotes and GitHub callouts (`> [!TIP]`) all work.

The [How this works](notes/01-start-here/01-how-this-works.md) and [Markdown cheatsheet](notes/01-start-here/02-markdown-cheatsheet.md) lessons have the details.

## Running it locally

Needs Node.js 22.12 or newer.

```sh
npm install
npm run dev     # http://localhost:4321, reloads as you edit notes
npm run build   # production build into dist/
npm run check   # type-check the site code
```

## Deployment

Netlify builds the site from this repository. The settings are in [`netlify.toml`](netlify.toml): it runs `npm run build` on Node 24 and publishes `dist/`. A push to `main` deploys to production. If a build fails, the previous version stays online, and the Netlify deploy log explains what went wrong.

## Code

Built with [Astro](https://astro.build). The code is in `src/`:

- `lib/course.ts` turns the notes into chapters and lessons.
- `lib/markdown.ts` handles math, callouts, the leading heading and links between notes.
- `pages/` holds the home, chapter, lesson and 404 pages; `styles/global.css` the styling.
- `scripts/app.ts` handles lesson progress (saved in the browser), the dark theme and the mobile menu.
- `site.config.ts` holds the site title, tagline and GitHub repository.
