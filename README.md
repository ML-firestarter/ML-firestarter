# ML-firestarter

My machine learning notes, published as a course website in English and Polish.

Every Markdown file in [`notes/`](notes/) becomes a lesson and every folder becomes a chapter. Lessons can have multiple-choice tests, kept in [`tests/`](tests/), and Python exercises that readers solve in the page, kept in [`exercises/`](exercises/). Chapters can have [exams](#exams), which the site grades, with a [certificate](#certificates) for readers who pass. Each push to `main` makes Netlify build and publish a new version of the site.

## Writing lessons

```text
notes/
├── README.md                ← introduction on the home page
├── README.pl.md             ← the same in Polish
├── 01-start-here/           ← chapter "Start here"
│   ├── README.md            ← chapter introduction (title and description)
│   ├── 01-how-this-works.md ← lesson "How this works"
│   └── 02-markdown-cheatsheet.md
├── 02-python/
│   └── 01-basics/           ← a chapter inside a chapter
│       └── 01-conditions-and-functions.md
├── 04-foundations/
│   └── 01-what-is-machine-learning.md
└── vocabulary/              ← no numbers, so sorted by title
    └── sft.md
```

- Numbered files and folders (`01-`, `02-`, …) come first, in number order, and the rest follow alphabetically by title. The numbers don't appear in titles or addresses.
- A lesson's title comes from `title:` in its frontmatter, else its first `# Heading`, else its file name.
- Frontmatter is optional: `title`, `description`, and `draft: true` to hide a lesson.
- Link notes to each other with relative paths (`../04-foundations/01-what-is-machine-learning.md`); the links work on GitHub and on the site.
- Math (`$…$` and `$$…$$`), highlighted code, tables, task lists, footnotes and GitHub callouts (`> [!TIP]`) all work, and Python examples can be [run in the page](#runnable-examples).

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

## Writing exercises

Exercises are Python tasks that readers solve in the page: they write code in an editor, run it, and **Check** runs the exercise's checks on it. Python runs in the reader's browser, in [Pyodide](https://pyodide.org), so readers install nothing and the site's servers run none of their code.

An exercise is a folder in [`exercises/`](exercises/), inside a folder with its lesson's path, the way tests sit at their lesson's path:

```text
exercises/02-python/01-basics/01-conditions-and-functions/  ← exercises on notes/02-python/01-basics/01-conditions-and-functions.md
└── 01-old-enough/
    ├── task.md       ← what to do, published at /exercises/python/basics/conditions-and-functions/old-enough/
    ├── task.pl.md    ← the same in Polish
    ├── starter.py    ← the code the reader starts from
    ├── solution.py   ← our solution, shown once the reader's code passes
    ├── checks.py     ← what the code has to do
    └── files/        ← optional: files the code can open, like open("words.txt"), 1 MB in all
```

`checks.py` sets `CHECKS` to a list of checks, each a Python expression, as a string, with what it should give:

```python
CHECKS = [
    ("area(2, 3)", 6),                       # returns 6
    ("average([])", raises(ValueError)),     # raises a ValueError
    ("greet('Ada')", prints("Hello, Ada!")), # prints this text
    ("program('3', '4')", prints("Width? 3\nHeight? 4\nArea: 12\n")),
]
```

- An expression can use anything the reader's code defines. Numbers count as equal when they differ only by rounding, and `True`, `False` and `None` only equal themselves.
- `raises(SomeError)` expects an error of that kind, and `prints("…")` what's printed. Spaces at the ends of lines and blank lines at the end don't count.
- `program('3', '4')` runs the whole file as a program, with those lines typed in, and `program()` runs it with nothing typed in: that's for exercises that are programs rather than functions. What it prints includes each `input()` prompt followed by the line typed after it, as in a terminal.
- Each check has 10 seconds.
- The page writes what each check tried and what happened in the reader's language, from the expression and the values, so one `checks.py` serves every language. `starter.py` and `solution.py` do too, so keep words out of what they print where you can.

`task.md` is written like a lesson. Its frontmatter can have `title`, `description`, `input` for what the page's **Input** box holds at first, and `draft: true` to hide the exercise. The **Input** box is there when the exercise sets `input` or its code calls `input()`. Numbered folders (`01-`, `02-`, …) set the exercises' order, and the lesson lists them after its text.

Readers' code, and which exercises they've passed, are saved in their browser, like lesson progress. An exercise's checks are in the page with the values they expect, so they can be fooled, and exercises count toward a reader's progress but not toward exams or certificates. An exam's [tasks](#writing-exam-tasks) are what ask readers for code that counts: the page runs it, but the values it should give stay with the site.

A chapter can end with a workbook: a lesson whose exercises mix what the chapter taught, like `notes/02-python/05-workbook.md` with the exercises in `exercises/02-python/05-workbook/`. It's an ordinary lesson and ordinary exercises, and numbering the lesson's file after the others puts it at the end of the chapter.

`npm run check:exercises` runs each exercise's checks on its `solution.py`, which has to pass them all, and on its `starter.py`, which mustn't, in the same Pyodide as the site. Pull requests that change exercises run it too ([`check-exercises.yml`](.github/workflows/check-exercises.yml)), and show any problems next to the files. A missing lesson or file fails the build.

### Runnable examples

A code block in a lesson fenced as ```` ```python run ```` gets a **Run** button, and readers can edit the code and run it again:

````md
```python run
print("Hello!")
```
````

The output shows under the code, and an example that calls `input()` gets an **Input** box.

### PyTorch in the page

PyTorch can't run in a browser, so code that does `import torch` or `import torchmetrics` gets a small one that the site carries in [`src/python/`](src/python/): tensors, autograd, `torch.nn`, `torch.optim`, `torch.utils.data` and `torchmetrics`, written with NumPy, which Pyodide has. It behaves like PyTorch for what the lessons use, down to what it prints: tensors print the way PyTorch's do, errors say what PyTorch's say, and after `torch.manual_seed(42)` the random numbers are the ones PyTorch makes, so the numbers in a lesson are the ones a reader gets on their own computer, give or take the last digit of a decimal. What it doesn't have it doesn't pretend to: there's no GPU (`torch.cuda.is_available()` is `False`), no `create_graph=True`, no convolutions yet, and `torch.save` writes its own file, not a `.pt` that PyTorch can read. A reader who needs more installs PyTorch on their computer, and the lessons say when.

The first code that imports it gets NumPy loaded and the files of `src/python/` written out (`provide` in `harness.py`, called from `python.worker.ts`, and from the scripts that run Python under Node, through `scripts/libraries.mjs`), and every run starts with a fresh `import torch`, as in a new terminal, so that the random numbers and settings of the last run don't carry over. Examples, exercises and their checks, and exam tasks all work the same way. A folder put in `src/python/` becomes a library of the same kind.

`npm run check:torch` checks it against the real PyTorch. [`scripts/torch/cases/`](scripts/torch/cases/) has about 470 small programs that use `torch` and print, [`scripts/torch/golden/`](scripts/torch/golden/) holds what PyTorch 2.14.1 printed for each, and the check runs them with the site's `torch` in the same Pyodide as the site and compares the text: a number may differ in its last digit, and the rest, with every error message, has to be the same. To add a case, add it to a file in `cases/` and run `python scripts/torch/harness.py generate` on a computer with PyTorch, which writes what PyTorch prints for it into `golden/`. Pull requests that change the library run the check too ([`check-torch.yml`](.github/workflows/check-torch.yml)), and so do the exercises' checks.

## Translations

English pages are at the root of the site and Polish ones under `/pl/`. A translation sits next to its original: `sft.pl.md` is the Polish version of `sft.md` and is published at `/pl/vocabulary/sft/`. Tests and exercises' `task.md` are translated the same way. Until a note, test or task is translated, the Polish site shows the original with a notice and a link for adding the translation on GitHub. Progress, test scores and passed exercises are shared between the languages.

## Comments

Readers can comment on the vocabulary, Python and foundations lessons the way code gets reviewed: they select a passage, write what they think of it and can suggest new wording for it. They sign in with GitHub to do it, and each comment becomes an issue in this repository, opened in their name, with the passage, the comment, the suggested change as a diff and a link back to the page. Each comment's issue is assigned to its reader, so GitHub tells them about replies and about what becomes of it. The sections that take comments are listed under `comments` in `src/site.config.ts`; with none, signing in stays for the [exams](#exams) only.

Copilot checks each new comment ([`triage-comments.yml`](.github/workflows/triage-comments.yml)): it closes spam, tests and comments that aren't about the notes, and gives the rest the `needs-review` label. The workflow run of an issue says why Copilot closed or kept it, and Copilot's instructions are in [`triage-comment.prompt.yml`](.github/prompts/triage-comment.prompt.yml).

When Copilot keeps a comment that suggests new wording or points out a typo, the issue gets the `quick-fix` label and Copilot proposes a change on it: the change written into every language version of the note, so the English and Polish versions keep saying the same thing whichever one the reader commented on. Anyone can discuss the proposal there. The reader or a maintainer can comment `/propose` followed by what to change, and Copilot writes a new proposal that follows the discussion and the proposals so far, with their votes. A reader can ask for five proposals on their comment, and a maintainer for as many as they like. Copilot's instructions for the change are in [`sync-change.prompt.yml`](.github/prompts/sync-change.prompt.yml).

The other comments Copilot keeps, like one that points out a mistake in the facts, the math or the code, asks a question, or asks for a link or a new entry, are for the comment agent ([`investigate-comments.yml`](.github/workflows/investigate-comments.yml)). It uses a stronger model, Claude Opus 5.5 unless the `COPILOT_AGENT_MODEL` repository variable names another, and reads the notes before it answers, with tools that can only read and search the repository. It answers the reader on the issue and proposes the change the comment calls for, which can reach other notes and add new ones, like a vocabulary entry, for a vote like Copilot's proposals. Its runs cost more, so only maintainers start it: on a maintainer's comment it starts on its own, and on anyone else's once a maintainer adds the `agent` label to the issue or comments `/propose` followed by what to change. The label works on any comment's issue, and taking it off and adding it back once the agent has answered starts it again; anyone else's `agent` label is taken off. Once the agent has looked into a comment, the comment's `/propose` goes to the agent rather than to Copilot. To start it by hand, run the workflow with the issue's number. The agent's instructions are in [`investigate-comment.prompt.yml`](.github/prompts/investigate-comment.prompt.yml).

People vote for a proposal by reacting to it with 👍. A proposal gets the votes with three of them, or with one from a maintainer, and the first to get them becomes a pull request from a `comment-<issue number>` branch, credited to the reader ([`open-changes.yml`](.github/workflows/open-changes.yml)). The votes go on while the pull request is open, and proposals asked for with `/propose` meanwhile join them: when another proposal with the votes has more of them, its change replaces the one on the pull request, and the issue says so. On a tie, the pull request keeps its change. A maintainer doesn't have to wait for the votes: commenting `/accept` and a proposal's number, or just `/accept` for the newest one, puts that proposal on the pull request right away, opening one if needed, and then the votes no longer change it; another `/accept` does. Once a maintainer commits to the branch themselves, neither changes it, and once the pull request is closed without merging, only the proposals and `/accept` comments written after that count. The `CHANGE_VOTES` repository variable sets how many votes it takes. GitHub has no event for reactions, so the votes are counted on a schedule, which GitHub runs only every few hours; run the workflow by hand to count them right away. Copilot and the comment agent translate the change themselves, so check the wording in both languages before merging. Merging closes the comment's issue.

The site shows signed-in readers the changes that are waiting to be merged, on every language version of the note: for each pull request, the change it has now. Each one shows as a highlighted passage, with what it becomes in that page's language, the reader's comment and links to the discussion and the pull request. Open issues aren't shown, and a change is no longer shown once its pull request is merged or closed, or once its passage is reworded in the meantime.

### Setting up comments

1. Create a GitHub App under **Settings → Developer settings → GitHub Apps → New GitHub App**:
   - **Callback URL**: `https://<your site>/api/auth/callback`, and `http://localhost:4321/api/auth/callback` for running the site locally. Leave **Expire user authorization tokens** on.
   - **Webhook**: turn off **Active**.
   - **Repository permissions**: **Issues**, read and write. Nothing else: the site reads the pull requests too, which needs no permission while the repository is public. Add **Pull requests**, read-only, if it isn't.
   - **Where can this GitHub App be installed?**: **Any account**, so that everyone can sign in with it.
2. On the app's page, copy the **Client ID** and generate a **client secret**. Then, under **Install App**, install it on the ML-firestarter organization for the ML-firestarter repository only.
3. In Netlify, under **Site configuration → Environment variables**, add these for Functions:
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from step 2;
   - `SESSION_SECRET`: 32 or more random characters, like the output of `openssl rand -base64 32`. It encrypts the sign-in cookies, and changing it signs everyone out.

   Deploy previews have addresses of their own, so signing in works on one only once its callback URL is added to the app.
4. For Copilot to check the comments, create a fine-grained personal access token (**Settings → Developer settings → Personal access tokens → Fine-grained tokens**) with the **Copilot Requests** permission, and add it to this repository as the `COPILOT_GITHUB_TOKEN` secret (**Settings → Secrets and variables → Actions**). The checks, the proposals and the comment agent use your Copilot plan's AI credits, at $0.01 each, and how many depends on the model and on how much it reads and writes. Copilot's checks and proposals read one note each and cost little; the comment agent reads more, with a stronger model, and a run stops at 300 AI credits unless the `COPILOT_AGENT_CREDITS` repository variable sets another limit. Copilot picks the model from the ones your plan has, unless the `COPILOT_MODEL` repository variable names one, like `claude-haiku-4.5`. The comment agent's Claude Opus 5.5 needs Copilot Pro+, Max, Business or Enterprise; Copilot Free and Student only have Auto, which picks the model itself: on those, leave `COPILOT_MODEL` unset and set `COPILOT_AGENT_MODEL` to `auto`. Without the token, or once it expires, every comment is kept for review. When Copilot can't answer, the workflow run shows the Copilot CLI's error.
5. For the changes that get the votes to become pull requests, turn on **Allow GitHub Actions to create and approve pull requests** under **Settings → Actions → General → Workflow permissions**, first in the organization's settings and then in the repository's, whose checkbox stays greyed out until the organization allows it. Until then, the change is still made on its `comment-<issue number>` branch, and the issue gets a link that opens the pull request filled in. To change how many votes a proposal needs, add a `CHANGE_VOTES` repository variable (**Settings → Secrets and variables → Actions → Variables**), like `5`. GitHub turns off scheduled workflows, like the vote count, after 60 days without activity in the repository. Turn it back on under **Actions → Open voted changes**.

To try comments locally, copy `.env.example` to `.env` and fill it in.

## Exams

Each chapter can end with an exam on all of its lessons. Unlike the tests, which check the answers in the browser and show which ones are right, the exams are graded by the site, which keeps the results and never shows the right answers. Readers sign in with GitHub to take one.

- An attempt has up to 10 questions (`exams.questions` in `src/site.config.ts`), drawn from the chapter's lessons in turn, and every practical [task](#writing-exam-tasks) the chapter has, in which readers write code in the page. The Python chapter's exam is six tasks, from the easiest to the hardest. The reader has 24 hours to hand it in and can leave and come back until then: their answers, and the code they've written, are kept in the browser.
- Questions and tasks count the same toward the score. An exam is passed at 80% of them (`passScore`, as for the tests: five tasks out of six), and then it's done. After an attempt that doesn't pass, the reader can start another 24 hours later (`exams.wait`), with the code they wrote still in the editors.
- Once an attempt is handed in, the reader sees their score and the lessons to read again: those of the questions they answered wrong and of the tasks they didn't solve. A pass earns a [certificate](#certificates), which the reader can publish.
- The **Tests** tab lists each chapter's exam after its tests, and the chapter's page links to it.

### Writing exam questions

The questions aren't in this repository but in the private [ML-firestarter-exams](https://github.com/ML-firestarter/ML-firestarter-exams) one (`exams.repo`), laid out like `tests/`: `vocabulary/sft.md` holds the exam questions on `notes/vocabulary/sft.md`, and `vocabulary/sft.pl.md` is their Polish translation. They're written like tests, except that:

- Readers only see the questions and their answers. Anything after a question's answers is left out, so it can hold notes for whoever writes the questions. Footnotes fail the build; put their text in the question instead.
- The answers are shown in an order of the site's own, the same on every attempt and in every language, so the right ones can go anywhere in the list. As in tests, several `[x]` make checkboxes.
- A translation asks the same questions in the same order, with the same answers in the same order and the same ones marked `[x]`: one answer key grades every language. Until a lesson's questions are translated, the Polish exam page shows the original.
- Only lessons in a chapter can have exam questions, and each top-level chapter with some gets an exam. `draft: true` leaves a file out, as does hiding its lesson. `README.md` files describe the repository and are left out too.
- Once changed questions are published, attempts started before have to be started again.

Mistakes fail the build with an explanation that never says which answers are right.

### Writing exam tasks

A task asks readers to write Python in the page. Its card has an editor, a **Run** button and an **Input** box, as an exercise's page does, but no **Check** button: what the code does is looked at only when the attempt is handed in. Tasks are in the private repository too, in a `tasks/` folder in the chapter's folder, a folder to a task. Every attempt gives all of a chapter's tasks, in the order of their folders:

```text
02-python/tasks/01-triangles/   ← a task of the exam on notes/02-python/, with the id python-triangles
├── task.md       ← what to do
├── task.pl.md    ← the same in Polish
├── starter.py    ← the code the reader starts from
├── solution.py   ← our solution, which never leaves the private repository
├── cases.py      ← makes the task's instances
├── pool.json     ← the instances, and what solution.py does on them: `npm run exam-tasks` writes it
├── wrong/*.py    ← solutions that each have one plausible mistake
└── files/        ← optional: files the reader's code can open, like open("votes.txt")
```

`task.md` is written like an exercise's. Its frontmatter has `lessons`, the lessons the task draws on as paths inside `notes/`, which the exam links to readers who don't solve it, and can have `title`, `input` for what the **Input** box holds at first, and `draft: true` to leave the task out. The **Input** box is there when the task sets `input` or its starter calls `input()`. A translation's `lessons` and `input` are the original's. As a task shows no checks, its text has to say everything the cases rely on: the names and parameters of the functions, a table of example calls with what they return, and for a program, what it reads and prints, exactly.

`cases.py` defines `make(rng, index)`, which returns an instance of the task, `{"cases": [...], "files": {...}}`. The cases are expressions as in an exercise's `checks.py`, written as text, like `triangle_kind(3, 4, 5)` or `program('3', '4 5')`, and `files` are the files they read, as text by name. An instance has up to 40 cases of up to 400 characters, and up to 20,000 characters of files. `rng` is a `random.Random` made for the instance, so that instances differ and `npm run exam-tasks` makes the same ones every time. `INSTANCES` is how many to make (8 unless it says, and at least 6) and `RAISES` lists the kinds of error the right code may raise, like `RAISES = ["ValueError"]`: any other error from `solution.py` is a mistake in the task.

An attempt gets one instance of each task. The cases come without answers: what each did on the reader's code is compared with what it did on `solution.py`. That's a piece of text:

- the value of the expression, written the same for equal values: `3.0` is `3`, other numbers are rounded to nine significant digits, `True` isn't `1`, dictionaries and sets come in order, lists and tuples keep theirs and aren't alike, and anything else is only its type;
- for `program(…)`, what the program printed, with spaces at the ends of lines and blank lines at the end not counting. Unlike an exercise's checks, it leaves out the lines typed in, so that code that reads everything before it prints and code that prints between reads give the same. A prompt in `input("…")` is printed, so a task says whether the program has prompts, and asks for none unless it needs them;
- `raised ValueError`, the kind of error the expression raised, or `too much output`.

Each text is cut at 1,000 characters, so keep a case's result shorter for all of it to count. Each case has 10 seconds.

`npm run exam-tasks` writes each task's `pool.json` from its `cases.py` and `solution.py`: the instances, and what `solution.py` did on each. Commit it with the task, as the site's build needs it and never runs `cases.py` or `solution.py`. `npm run check:exam-tasks` checks that the pool is what they make now, and that:

- `solution.py` runs on every instance, and uses only what the lessons teach: a task asks for what the Basics lessons covered, so its solution is written with that alone. `LINT` in [`scripts/exam-tasks.mjs`](scripts/exam-tasks.mjs) lists the builtins, methods and statements the lessons use, and a mistake names the line and what it used;
- `starter.py` and the solutions in `wrong/` pass no instance, and there are some: each of those has one plausible mistake, like `<` for `<=`, and the cases have to catch it. When one passes, add a case that catches it to `cases.py`.

Both take a part of a task's name to work on only some tasks, like `npm run exam-tasks -- triangles`. They run Python in the same Pyodide as the site. Changing a task changes the exam's version, so attempts started before have to be started again, but the code readers wrote stays in their editors.

### How the answers stay secret

The exam page holds the questions of every lesson of the chapter, hidden until an attempt draws some of them, and the text and starting code of its tasks, with nothing that tells the right answers. It also holds the exam's answer key, encrypted with `EXAM_SECRET`, which only the site's API has. Starting an attempt sends the key to the API, which draws the questions and an instance of each task, and gives the page the attempt, encrypted the same way, with the cases of the instances it drew. Handing in sends the attempt back with the answers and with what the reader's code did on each case: the API checks the answers, compares what the code did with what the right code does, keeps the result, and only then tells the reader their score. So:

- The right answers, and what the right code does on the tasks' cases, are only ever in the private repository: not in the published pages, the site's code, the build logs or Netlify's build cache. Of a task, the build downloads its text, starting code, pool and files, never its solution or the code that makes its instances, and the key holds only a digest of what the right code does on each instance, which only `EXAM_SECRET` can make.
- An attempt can be handed in only once, and starting it again draws the same questions and instances, so readers can't try answers out or look for easier ones. Each reader has an order of their own for a task's instances, and each attempt takes the next one, so an instance doesn't come back before the others have been used.
- The results are kept by the site's bot, a GitHub App of its own, in the private [ML-firestarter-results](https://github.com/ML-firestarter/ML-firestarter-results) repository (`exams.results`). Each reader has a file there, `readers/<GitHub id>.json`, with the date, score and version of the questions and tasks of each of their attempts, and whether it passed, and their certificates, signed, with whether they're published; their answers and code aren't kept.

A few things still show. Checkboxes tell that a question has several right answers, as in tests, and the lessons to read again tell which questions were answered wrong when only one question of a lesson was drawn, and which tasks weren't solved. A task's cases show more: the instance an attempt drew is in the page, as the reader's code runs on it in their browser, so readers see what each case asks of their code and what their code gives, but not what it should give. The site's servers run none of the reader's code, so they can't tell that what a hand-in says the code did is true: someone who knows what the right code gives on each case, from solving the task some other way or from somebody else, can hand that in. Exams aren't proctored, and questions can be asked around just the same. If that ever matters, a sandbox on a server can run the reader's code on the same cases, and the API compare what it did in the same way. All readers share the bot's rate limit, 5,000 requests an hour, and each attempt or certificate takes a few.

### Certificates

Passing a chapter's exam earns a certificate, which the site signs with its Ed25519 key, `CERTIFICATE_KEY`, as a JWS. It says who passed, with their GitHub id, login and name, the chapter and the lessons its exam asked about or set tasks on, when and how well they passed, the version of the questions and tasks, and when it was issued. It's kept with the reader's results, and publishing it is up to them, on the exam's page: the site's bot then writes it to the public [ML-firestarter-certificates](https://github.com/ML-firestarter/ML-firestarter-certificates) repository (`exams.certificates`) as `certificates/<id>.json`, and it has a page of its own, like `/certificates/3f9a1c0e7b2d4a55/`, in each language. The page shows who it was issued to, with their GitHub name and picture, the chapter and its lessons, and when and how well they passed: the questions answered right, the tasks solved, or both.

- The certificate's page reads it straight from the repository and checks its signature in the browser, with the public key the site publishes at `/certificates/keys.json`. One whose signature doesn't check out, because it was changed or signed with another key, isn't shown as a certificate. Anyone can check one the same way: its file holds it as a JWS, `jws`, next to a copy to read, `certificate`, which doesn't count.
- The repository keeps a record too: GitHub marks the bot's commits as verified, so a certificate's history shows that the site's bot published it.
- Readers can unpublish their certificate on the exam's page, which deletes its file. It stays in the repository's history, and in their results, so they can publish it again. Taking a certificate back isn't possible yet: deleting its file takes its page down, but its reader can publish it again.
- Each reader gets one certificate for each exam they pass. It names the chapter and its lessons, and its reader, as they were when it was issued, and doesn't change when they do. It holds nothing about the questions, the tasks or their answers.
- On the certificate's page, the reader it was issued to gets a badge for the README of their GitHub profile, as Markdown to copy, linked to the page, and a link that adds the certificate to their LinkedIn profile. Each top-level chapter has a badge in each language, like `/certificates/badges/foundations.svg`.
- Without `CERTIFICATE_KEY`, the exams give no certificates. Readers who pass while it isn't set get theirs signed when they publish it, once it is. Changing the key makes the certificates signed with the old one fail their check, so keep it, and keep it secret.

### Setting up exams

Exams need signing in, so set up [comments](#setting-up-comments) first (steps 1 to 3). Then:

1. Use the organization's three repositories: two private ones, `ML-firestarter-exams` for the questions and tasks and `ML-firestarter-results`, initially empty, for the results, and the public [ML-firestarter-certificates](https://github.com/ML-firestarter/ML-firestarter-certificates) for the certificates, with a README saying what they are. To name them otherwise, change `exams` in `src/site.config.ts`.
2. Create the bot, a second GitHub App, in the organization's settings under **Developer settings → GitHub Apps → New GitHub App**:
   - **Homepage URL**: the site's address. It needs no callback URL.
   - **Webhook**: turn off **Active**.
   - **Repository permissions**: **Contents**, read and write. Nothing else.
   - **Where can this GitHub App be installed?**: **Only on this account**. That's the organization, since it owns the app; an app created in your own account's settings could only be installed on your account.

   On the app's page, copy the **App ID** and generate a **private key**. Then, under **Install App**, install it on the organization for those three repositories only.
3. In Netlify, under **Site configuration → Environment variables**, add these for Builds and Functions, and for the **Production** deploy context only:
   - `EXAM_SECRET`: 32 or more random characters, like the output of `openssl rand -base64 32`. It encrypts the answer keys and the attempts; changing it ends the attempts in progress, and the results stay.
   - `BOT_APP_ID`: the App ID from step 2.
   - `BOT_APP_PRIVATE_KEY`: the private key from step 2, the whole file.
   - `CERTIFICATE_KEY`: the key that signs the [certificates](#certificates), made with `openssl genpkey -algorithm ed25519 -out certificate-key.pem`, the whole file. Keep a copy somewhere safe: the certificates it signs only check out with it. Without it, the exams give no certificates.

   Deploy previews run the code of pull requests, which anyone can open, so they mustn't get these settings: with them, that code could read the questions the build downloads, answers and all, open the answer keys or sign certificates of its own. Without them, deploy previews are built without exams. Mark `EXAM_SECRET`, `BOT_APP_PRIVATE_KEY` and `CERTIFICATE_KEY` as secret values, too, so that Netlify hides them.

The next production build downloads the questions and the files tasks need, and its log says how many files it found. `exams/` is left as it is in other builds, including local ones: to try the exams locally, clone the questions repository into it with `git clone https://github.com/ML-firestarter/ML-firestarter-exams exams` and add the settings to `.env`. Builds with `exams/` need `EXAM_SECRET`, and render its questions afresh every time, so a new `EXAM_SECRET` applies at once. `npm run dev` keeps results in the same results repository as the site and publishes certificates to the same certificates repository, so give it a `CERTIFICATE_KEY` of its own: the site doesn't accept the certificates it signs.

## Running it locally

Needs Node.js 22.12 or newer.

```sh
npm install
npm run dev     # http://localhost:4321, reloads as you edit notes
npm run build   # production build into dist/
npm run check   # type-check the site code
npm run check:exercises   # run every exercise's checks on its solution and starter
npm run check:torch       # run the cases that compare the page's PyTorch with the real one
npm run exam-tasks        # make the exam tasks' pools, in exams/ (see Writing exam tasks)
npm run check:exam-tasks  # check the exam tasks, their pools and their solutions
```

`npm run dev` also serves the API behind signing in, comments, exams and certificates, with the settings from `.env` (see [Comments](#comments) and [Exams](#exams)), and shows certificates' pages as Netlify does.

## Deployment

Netlify builds the site from this repository. The settings are in [`netlify.toml`](netlify.toml): it runs `npm run build` on Node 24, publishes `dist/`, shows the certificate page at each certificate's address, lets any site read the certificates' public keys, and serves the Polish "page not found" page for missing addresses under `/pl/`. A push to `main` deploys to production. If a build fails, the previous version stays online, and the Netlify deploy log explains what went wrong.

Pyodide isn't part of the deploy, which it would make 13 MB bigger: readers' browsers load it from [jsDelivr](https://www.jsdelivr.com), at the version in `package.json`, the first time they run some code.

## Code

Built with [Astro](https://astro.build). The code is in `src/`:

- `lib/i18n.ts` lists the languages and holds the interface text in each of them.
- `lib/course.ts` turns the notes into chapters and lessons, one course per language, picks each note's translation, gives each lesson its test and exercises and each chapter its exam, with the exam's tasks.
- `lib/paths.ts` turns file paths into titles and addresses.
- `lib/markdown.ts` handles math, callouts, footnotes, the leading heading, links between notes and runnable examples, and turns tests and exam questions into question forms.
- `lib/comments.ts` describes readers' comments, the issues that hold them and the pull requests with the changes they lead to, `lib/exams.ts` the exams' attempts and results, and `lib/certificates.ts` the certificates. `lib/badge.ts` draws the certificates' badges.
- `pages/` holds the home, chapter, lesson, test, exercise, exam, certificate and 404 pages, the tests overview, the badges and the certificates' public keys, and `pages/[lang]/` the home and 404 pages of the other languages. `components/` holds the parts the pages are built from, and `styles/global.css` the styling.
- `scripts/app.ts` handles lesson progress (saved in the browser), the dark theme and the mobile menu. `scripts/quiz.ts` checks a test's answers, and `scripts/scores.ts` saves the scores in the browser and shows them. `scripts/account.ts` shows who's signed in, and `scripts/comments.ts` handles selecting passages, the comment form and the highlighted changes. `scripts/exam.ts` takes an exam and gets its certificate, `scripts/exam-tasks.ts` runs the code of the exam's tasks and keeps the reader's drafts, `scripts/exams.ts` shows the reader's results wherever an exam is linked, and `scripts/certificate.ts` shows a certificate.
- `scripts/exercise.ts` runs and checks the code on an exercise's page, and `scripts/runnable.ts` runs the lessons' examples; `scripts/running.ts` holds what they share. `scripts/editor.ts` is the code editor, [CodeMirror](https://codemirror.net), and `scripts/exercises.ts` saves which exercises the reader has passed and shows them. `scripts/python.ts` runs Python in a Web Worker, `scripts/python.worker.ts`, which loads Pyodide and `scripts/harness.py`, the Python that runs the reader's code and the checks, or the cases of an exam task. [`scripts/check-exercises.mjs`](scripts/check-exercises.mjs) and [`scripts/exam-tasks.mjs`](scripts/exam-tasks.mjs), outside `src/`, run the harness under Node for `npm run check:exercises` and `npm run exam-tasks`.
- `server/api.ts` is the API for signing in with GitHub, for comments and for the exams and their certificates, with `server/session.ts` keeping readers signed in with encrypted cookies and `server/github.ts` talking to GitHub, as the reader or as the site's bot. Netlify runs it as a function ([`netlify/functions/api.ts`](netlify/functions/api.ts)), and `server/dev.ts` serves it in `npm run dev`. `server/exams.ts` seals the answer keys into the exam pages, draws and grades the attempts, their questions and their tasks, and keeps the results, `server/certificates.ts` signs the certificates and publishes and unpublishes them, and `server/exam-questions.ts` downloads the exam questions and the files of the tasks for production builds.
- `python/` holds the libraries that code in the page can import but Pyodide doesn't have: a small PyTorch, `torch`, and `torchmetrics` (see [PyTorch in the page](#pytorch-in-the-page)), which `scripts/python.worker.ts` writes out for code that imports them. [`scripts/check-torch.mjs`](scripts/check-torch.mjs) runs the cases in [`scripts/torch/`](scripts/torch/) with them under Node for `npm run check:torch`, and [`scripts/libraries.mjs`](scripts/libraries.mjs) gives the libraries to the scripts that run Python the way the page does.
- `site.config.ts` holds the site title, the tagline in each language, the GitHub repository, the tests' pass mark, the sections that take comments and the exams' settings.

To add a language, add its code to `LANGS` in `lib/i18n.ts` and run `npm run check`, which lists the text still missing for it. Then add a certificate rule and a "page not found" rule for it to `netlify.toml`, like the ones for `/pl/`.
