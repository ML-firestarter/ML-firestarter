# ML-workout

My machine learning notes, published as a course website in English and Polish.

Every Markdown file in [`notes/`](notes/) becomes a lesson and every folder becomes a chapter. Lessons can have multiple-choice tests, kept in [`tests/`](tests/). Each push to `main` makes Netlify build and publish a new version of the site.

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

## Writing tests

A lesson's test sits in [`tests/`](tests/) at the same path as the lesson in `notes/`: `tests/vocabulary/sft.md` tests `notes/vocabulary/sft.md`, and `tests/vocabulary/sft.pl.md` is its Polish translation. The site lists the tests in the **Tests** tab.

```md
## What does SFT train on?

- [ ] Pairs of better and worse responses
- [x] Prompts paired with high-quality responses
- [ ] Raw text from the web

The model is trained to produce the responses in its examples.
```

- Every `## Heading` is a question, and the checklist under it holds the answers: `[x]` for right ones, `[ ]` for wrong ones. Several `[x]` make checkboxes, and the question counts as right only when exactly those are picked.
- Anything between the heading and the list is part of the question. Anything after the list explains the answer and shows once the answers are checked.
- The answers are shuffled on every attempt. A test is passed at 80% (`passScore` in `src/site.config.ts`).
- `draft: true` hides a test, and a hidden lesson's test is hidden too. A test with a mistake, or without a lesson, fails the build with an explanation.

The [Tests](notes/01-start-here/01-how-this-works.md#tests) section of *How this works* has the details.

## Translations

English pages are at the root of the site and Polish ones under `/pl/`. A translation sits next to its original: `sft.pl.md` is the Polish version of `sft.md` and is published at `/pl/vocabulary/sft/`. Tests are translated the same way. Until a note or test is translated, the Polish site shows the original with a notice and a link for adding the translation on GitHub. Progress and test scores are shared between the languages.

## Comments

Readers can comment on the vocabulary and foundations pages the way code gets reviewed: they select a passage, write what they think of it and can suggest new wording for it. They sign in with GitHub to do it, and each comment becomes an issue in this repository, opened in their name, with the passage, the comment, the suggested change as a diff and a link back to the page. Each comment's issue is assigned to its reader, so GitHub tells them about replies and about what becomes of it. The sections that take comments are listed under `comments` in `src/site.config.ts`.

Copilot checks each new comment ([`triage-comments.yml`](.github/workflows/triage-comments.yml)): it closes spam, tests and comments that aren't about the notes, and gives the rest the `needs-review` label. The workflow run of an issue says why Copilot closed or kept it, and Copilot's instructions are in [`triage-comment.prompt.yml`](.github/prompts/triage-comment.prompt.yml).

When Copilot keeps a comment that suggests new wording or points out a mistake, it proposes a change on the issue: the change written into every language version of the note, so the English and Polish versions keep saying the same thing whichever one the reader commented on. Anyone can discuss the proposal there. The reader or a maintainer can comment `/propose` followed by what to change, and Copilot writes a new proposal that follows the discussion and the proposals so far, with their votes. A reader can ask for five proposals on their comment, and a maintainer for as many as they like. Copilot's instructions for the change are in [`sync-change.prompt.yml`](.github/prompts/sync-change.prompt.yml).

People vote for a proposal by reacting to it with 👍. A proposal gets the votes with three of them, or with one from a maintainer, and the first to get them becomes a pull request from a `comment-<issue number>` branch, credited to the reader ([`open-changes.yml`](.github/workflows/open-changes.yml)). The votes go on while the pull request is open, and proposals asked for with `/propose` meanwhile join them: when another proposal with the votes has more of them, its change replaces the one on the pull request, and the issue says so. On a tie, the pull request keeps its change. Once a maintainer commits to the branch themselves, the votes no longer change it, and once the pull request is closed without merging, only the proposals written after that count. The `CHANGE_VOTES` repository variable sets how many votes it takes. GitHub has no event for reactions, so the votes are counted every 15 minutes; run the workflow by hand to count them right away. Copilot translates the change itself, so check the wording in both languages before merging. Merging closes the comment's issue.

The site shows signed-in readers the changes that are waiting to be merged, on every language version of the note: for each pull request, the change it has now. Each one shows as a highlighted passage, with what it becomes in that page's language, the reader's comment and links to the discussion and the pull request. Open issues aren't shown, and a change is no longer shown once its pull request is merged or closed, or once its passage is reworded in the meantime.

### Setting up comments

1. Create a GitHub App under **Settings → Developer settings → GitHub Apps → New GitHub App**:
   - **Callback URL**: `https://<your site>/api/auth/callback`, and `http://localhost:4321/api/auth/callback` for running the site locally. Leave **Expire user authorization tokens** on.
   - **Webhook**: turn off **Active**.
   - **Repository permissions**: **Issues**, read and write. Nothing else: the site reads the pull requests too, which needs no permission while the repository is public. Add **Pull requests**, read-only, if it isn't.
   - **Where can this GitHub App be installed?**: **Any account**, so that everyone can sign in with it.
2. On the app's page, copy the **Client ID** and generate a **client secret**. Then, under **Install App**, install it on your account for the ML-workout repository only.
3. In Netlify, under **Site configuration → Environment variables**, add these for Functions:
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from step 2;
   - `SESSION_SECRET`: 32 or more random characters, like the output of `openssl rand -base64 32`. It encrypts the sign-in cookies, and changing it signs everyone out.

   Deploy previews have addresses of their own, so signing in works on one only once its callback URL is added to the app.
4. For Copilot to check the comments, create a fine-grained personal access token (**Settings → Developer settings → Personal access tokens → Fine-grained tokens**) with the **Copilot Requests** permission, and add it to this repository as the `COPILOT_GITHUB_TOKEN` secret (**Settings → Secrets and variables → Actions**). The checks and proposals use your Copilot plan's requests, one for each comment and one more for each proposal. Copilot picks the model from the ones your plan has, unless the `COPILOT_MODEL` repository variable names one, like `claude-haiku-4.5`. Without the token, or once it expires, every comment is kept for review. When Copilot can't answer, the workflow run shows the Copilot CLI's error.
5. For the changes that get the votes to become pull requests, turn on **Allow GitHub Actions to create and approve pull requests** under **Settings → Actions → General → Workflow permissions**. Until then, the change is still made on its `comment-<issue number>` branch, and the issue gets a link that opens the pull request filled in. To change how many votes a proposal needs, add a `CHANGE_VOTES` repository variable (**Settings → Secrets and variables → Actions → Variables**), like `5`. GitHub turns off the vote count, a scheduled workflow, after 60 days without activity in the repository; turn it back on under **Actions → Open voted changes**.

To try comments locally, copy `.env.example` to `.env` and fill it in.

## Running it locally

Needs Node.js 22.12 or newer.

```sh
npm install
npm run dev     # http://localhost:4321, reloads as you edit notes
npm run build   # production build into dist/
npm run check   # type-check the site code
```

`npm run dev` also serves the API behind signing in and comments, with the settings from `.env` (see [Comments](#comments)).

## Deployment

Netlify builds the site from this repository. The settings are in [`netlify.toml`](netlify.toml): it runs `npm run build` on Node 24, publishes `dist/`, and serves the Polish "page not found" page for missing addresses under `/pl/`. A push to `main` deploys to production. If a build fails, the previous version stays online, and the Netlify deploy log explains what went wrong.

## Code

Built with [Astro](https://astro.build). The code is in `src/`:

- `lib/i18n.ts` lists the languages and holds the interface text in each of them.
- `lib/course.ts` turns the notes into chapters and lessons, one course per language, picks each note's translation and gives each lesson its test.
- `lib/paths.ts` turns file paths into titles and addresses.
- `lib/markdown.ts` handles math, callouts, footnotes, the leading heading and links between notes, and turns tests into question forms.
- `lib/comments.ts` describes readers' comments, the issues that hold them and the pull requests with the changes they lead to.
- `pages/` holds the home, chapter, lesson, test and 404 pages and the tests overview, and `pages/[lang]/` the home and 404 pages of the other languages. `components/` holds the parts the pages are built from, and `styles/global.css` the styling.
- `scripts/app.ts` handles lesson progress (saved in the browser), the dark theme and the mobile menu. `scripts/quiz.ts` checks a test's answers, and `scripts/scores.ts` saves the scores in the browser and shows them. `scripts/account.ts` shows who's signed in, and `scripts/comments.ts` handles selecting passages, the comment form and the highlighted changes.
- `server/api.ts` is the API for signing in with GitHub and for comments, with `server/session.ts` keeping readers signed in with encrypted cookies and `server/github.ts` talking to GitHub. Netlify runs it as a function ([`netlify/functions/api.ts`](netlify/functions/api.ts)), and `server/dev.ts` serves it in `npm run dev`.
- `site.config.ts` holds the site title, the tagline in each language, the GitHub repository, the tests' pass mark and the sections that take comments.

To add a language, add its code to `LANGS` in `lib/i18n.ts` and run `npm run check`, which lists the text still missing for it. Then add a "page not found" rule for it to `netlify.toml`, like the one for `/pl/`.
