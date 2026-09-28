// What the comment workflows share. The triage (.github/workflows/triage-comments.yml) has
// Copilot propose a change for a reader's comment, written into every language version of the
// note, and posts it on the comment's issue for a vote. A comment that needs more than new wording
// or a fixed typo goes to the comment agent instead (.github/workflows/investigate-comments.yml),
// which reads the notes before it answers the reader, and whose change can reach other notes and
// add new ones. The first proposal to get the votes becomes a pull request
// (.github/workflows/open-changes.yml), which then has whichever proposal with the votes has the
// most of them, or the one a maintainer accepts. Its hidden marker holds what the site needs to
// show the change (changeFrom in src/lib/comments.ts).
'use strict';

const posix = require('node:path').posix;

/** The languages of the notes, as LANGS in src/lib/i18n.ts, English first. */
const LANGUAGES = { en: 'English', pl: 'Polish' };

/**
 * Open the hidden markers: of a comment's issue (MARKER in src/lib/comments.ts), of a proposal, of
 * a pull request with a change (CHANGE_MARKER), and of the comment agent's comment on an issue.
 */
const COMMENT = 'ml-workout:comment';
const PROPOSAL = 'ml-workout:proposal';
const CHANGE = 'ml-workout:change';
const AGENT = 'ml-workout:agent';

/** Who writes the proposals and opens the pull requests. */
const WORKFLOWS = 'github-actions[bot]';

/** The comment agent's workflow, which the triage and the agent label start. */
const AGENT_WORKFLOW = 'investigate-comments.yml';

/** How GitHub tells that the author of an issue or a comment is a maintainer. */
const MAINTAINERS = ['OWNER', 'MEMBER', 'COLLABORATOR'];

/** The labels of comments' issues. */
const LABELS = [
  { name: 'text-comment', color: 'c5def5', description: 'Comment on a passage of the notes, sent from the site' },
  { name: 'needs-review', color: 'fbca04', description: 'Comment kept by the triage for the maintainer' },
  { name: 'off-topic', color: 'd4c5f9', description: 'Comment closed by the triage: not feedback on the notes' },
  { name: 'proposal', color: '0e8a16', description: 'A change from the comment is up for a vote' },
  { name: 'quick-fix', color: 'bfdadc', description: 'New wording or a typo, which Copilot fixes in place' },
  { name: 'agent', color: '5319e7', description: "Copilot's comment agent looks into this comment; a maintainer adds it to start the agent" },
];

/** Proposals a reader can ask for on their comment; maintainers can ask for more. */
const MAX_PROPOSALS = 5;

/** GitHub's longest comment or pull request description, in characters, with some to spare. */
const MAX_BODY = 65_000;

/** A language-neutral URL of a page, as PAGE_PATH in src/lib/comments.ts. */
const PAGE_PATH = /^\/(?:[\p{L}\p{N}-]+\/)*$/u;

/** Something like a GitHub token, which is never published. */
const TOKEN = /\b(?:github_pat|gh[pousr])_[A-Za-z0-9_]{20,}/;

const isText = (value) => typeof value === 'string';
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Whether `file` is a note: a Markdown file in notes/, with no way out of it. */
function isNote(file) {
  return isText(file) && /^notes\/[^\\]+\.md$/.test(file) && !file.split('/').some((part) => ['', '.', '..'].includes(part));
}

/** The language of the note `file`, as splitLang in src/lib/paths.ts: `sft.pl.md` is Polish, and `sft.md` English. */
function langOf(file) {
  const lang = /\.([a-z]{2})\.md$/i.exec(file)?.[1].toLowerCase();
  return lang !== undefined && Object.hasOwn(LANGUAGES, lang) ? lang : 'en';
}

/** Text for a prompt that can't end the tags the prompts put around it, nor pass for one of them. */
function inert(text) {
  return text.replace(/<(\/?)(note|passage|comment|suggestion|discussion|entry|proposals|proposal|request|edit|find|replace|remarks|reply|create|answer)\b/gi, '‹$1$2');
}

/**
 * The HTML tags, character references and script links in `text`, which a reader's text can't
 * bring into the notes: only the maintainer writes them.
 */
function markup(text) {
  return (text.match(/<\/?[a-z][\w-]*|&#|\][(:]\s*<?\s*(?:javascript|vbscript|data):/gi) ?? []).map((token) => token.toLowerCase().replace(/\s+/g, ''));
}

/** JSON that can sit inside an HTML comment, as markerJson in src/lib/comments.ts: `<`, `>` and `&` escaped, so it can't contain `-->`. */
function markerJson(data) {
  return JSON.stringify(data).replace(/[<>&]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

function marker(name, data) {
  return `<!-- ${name} ${markerJson(data)} -->`;
}

/** The data in the last `name` marker of `body`, as readMarker in src/lib/comments.ts: one written into the text by hand comes before it. */
function readMarker(body, name) {
  const start = body.lastIndexOf(`<!-- ${name} `);
  const end = body.indexOf(' -->', start);
  if (start === -1 || end === -1) return undefined;
  try {
    return JSON.parse(body.slice(start + `<!-- ${name} `.length, end));
  } catch {
    return undefined;
  }
}

/** Text shown on GitHub as it is: nobody is mentioned and nothing is linked through it. */
function plain(text) {
  return text.replace(/[\\`*_[\]<>#|~$&]/g, '\\$&').replace(/@/g, '@\u200b');
}

/** A code fence longer than any run of backticks in `text`. */
function fence(text) {
  return '`'.repeat(Math.max(3, ...(text.match(/`+/g) ?? []).map((run) => run.length + 1)));
}

/** At most `bytes` of `text`, cut at a character. */
function clip(text, bytes) {
  const buffer = Buffer.from(text);
  return buffer.length <= bytes ? text : `${buffer.subarray(0, bytes).toString('utf8').replace(/\uFFFD+$/, '')}\n[…]`;
}

/** The comment in a comment's issue, as the site wrote it (issueFor in src/lib/comments.ts); undefined when it isn't one. */
function commentFrom(body) {
  const data = readMarker(body ?? '', COMMENT);
  if (!isRecord(data)) return undefined;
  const { file, path, lang, quote, comment, suggestion } = data;
  if (!isNote(file) || !Object.hasOwn(LANGUAGES, lang) || !isText(path) || !PAGE_PATH.test(path)) return undefined;
  if (!isRecord(quote) || !isText(quote.exact) || quote.exact === '' || !isText(comment)) return undefined;
  if (suggestion !== undefined && !isText(suggestion)) return undefined;
  return { file, path, lang, exact: quote.exact, comment, suggestion };
}

/**
 * Every language version the note `file` can have, as splitLang and withLang in src/lib/paths.ts:
 * `sft.md` is English and `sft.pl.md` its Polish translation. The version `file` is comes first.
 */
function versionsOf(file) {
  const read = Object.keys(LANGUAGES).find((lang) => lang !== 'en' && file.endsWith(`.${lang}.md`)) ?? 'en';
  const original = read === 'en' ? file : `${file.slice(0, -`.${read}.md`.length)}.md`;
  const paths = {};
  for (const lang of [read, ...Object.keys(LANGUAGES).filter((other) => other !== read)]) {
    paths[lang] = lang === 'en' ? original : original.replace(/\.md$/, `.${lang}.md`);
  }
  return { name: original.slice('notes/'.length, -'.md'.length), read, paths };
}

/** Copilot's edits and remarks, in the form .github/prompts/sync-change.prompt.yml asks for. */
function parseAnswer(response) {
  const EDIT = /<edit\s+lang="([a-z]{2})"\s*>\s*<find>\n?([\s\S]*?)\n?<\/find>\s*<replace>\n?([\s\S]*?)\n?<\/replace>\s*<\/edit>/g;
  const edits = [...response.matchAll(EDIT)].map(([, lang, find, replace]) => ({ lang, find, replace })).filter((edit) => edit.find !== edit.replace);
  const said = /<remarks>([\s\S]*?)<\/remarks>/.exec(response)?.[1].replace(/\s+/g, ' ').trim() ?? '';
  return { edits, remarks: said.length <= 600 ? said : `${said.slice(0, 599).trimEnd()}…` };
}

/**
 * Why Copilot's edits can't be proposed, if they can't. Copilot only names a version: the files
 * are the note's own. The maintainer reviews every change, and still a reader's text can't bring
 * HTML, character references or script links into the notes this way, nor rewrite a whole note.
 * And should Copilot ever come across a GitHub token, it isn't published. A first proposal changes
 * the version the reader commented on; later ones follow the discussion, wherever it went.
 */
function problemWith(edits, { versions, read, remarks, first }) {
  if (edits.length > 6) return 'it has more edits than a comment calls for';
  if ([remarks, ...edits.map((edit) => edit.replace)].some((text) => TOKEN.test(text))) return 'it has something like a GitHub token in it';
  for (const { lang, find, replace } of edits) {
    if (!Object.hasOwn(versions, lang)) return `the note has no "${lang}" version`;
    if (!find.trim()) return 'an edit has no text to replace';
    if (find.length > 3000 || replace.length > 3000) return 'an edit is longer than a comment calls for';
    const known = new Set(markup(find));
    if (markup(replace).some((token) => !known.has(token))) return 'it adds HTML or a script link, which is for the maintainer to write';
  }
  if (first && !edits.some((edit) => edit.lang === read)) return "it doesn't change the version the reader commented on";
}

/**
 * The comment agent's answer, in the form .github/prompts/investigate-comment.prompt.yml asks for:
 * its reply to the reader, its edits, the notes it adds and its remarks. The agent may say what it's
 * doing on the way, so the answer is the last one it gives. A new note is an edit with nothing to
 * find, as proposals keep it.
 */
function parseAgentAnswer(response) {
  const start = response.lastIndexOf('<answer>');
  const answer = start === -1 ? response : response.slice(start).replace(/<\/answer>[\s\S]*$/, '');
  const EDIT = /<edit\s+file="([^"]*)"\s*>\s*<find>\n?([\s\S]*?)\n?<\/find>\s*<replace>\n?([\s\S]*?)\n?<\/replace>\s*<\/edit>/g;
  const CREATE = /<create\s+file="([^"]*)"\s*>([\s\S]*?)<\/create>/g;
  const edits = [...answer.matchAll(EDIT)].map(([, path, find, replace]) => ({ path, lang: langOf(path), find, replace })).filter((edit) => edit.find !== edit.replace);
  const created = [...answer.matchAll(CREATE)].map(([, path, text]) => ({ path, lang: langOf(path), find: '', replace: `${text.trim()}\n` }));
  const reply = /<reply>([\s\S]*?)<\/reply>/.exec(answer)?.[1].trim() ?? '';
  const said = /<remarks>([\s\S]*?)<\/remarks>/.exec(answer)?.[1].replace(/\s+/g, ' ').trim() ?? '';
  return { reply, edits, created, remarks: said.length <= 600 ? said : `${said.slice(0, 599).trimEnd()}…` };
}

/**
 * Why the comment agent's change can't be proposed, if it can't. It can change any note and add
 * new ones, named like the notes, but nothing else. As with problemWith, the maintainer reviews
 * every change, and still a stranger's text can't bring HTML, character references or script links
 * into the notes this way, nor a GitHub token onto the issue.
 */
function problemWithAgent({ edits, created, remarks }) {
  if (edits.length > 16) return 'it has more edits than a comment calls for';
  if (created.length > 4) return 'it adds more notes than a comment calls for';
  if ([remarks, ...edits.map((edit) => edit.replace), ...created.map((note) => note.replace)].some((text) => TOKEN.test(text))) {
    return 'it has something like a GitHub token in it';
  }
  // Paths the agent names, and only those, go into the messages.
  const isPath = (path) => /^notes\/[\w./-]+\.md$/.test(path) && isNote(path);
  const added = new Set();
  for (const { path, replace } of created) {
    if (!isPath(path)) return "it adds a file that isn't a note";
    const lang = /\.([a-z]{2})\.md$/i.exec(path)?.[1];
    if (lang !== undefined && (lang === 'en' || !Object.hasOwn(LANGUAGES, lang))) return `the new note ${path} isn't named like a language version of a note`;
    if (added.has(path)) return `it adds ${path} twice`;
    added.add(path);
    if (replace.trim() === '') return `the new note ${path} is empty`;
    if (replace.length > 20_000) return `the new note ${path} is longer than a comment calls for`;
    if (markup(replace).length > 0) return 'it adds HTML or a script link, which is for the maintainer to write';
  }
  for (const { path, find, replace } of edits) {
    if (!isPath(path)) return "it changes a file that isn't a note";
    if (added.has(path)) return `it adds ${path} and edits it too`;
    if (!find.trim()) return 'an edit has no text to replace';
    if (find.length > 5000 || replace.length > 8000) return 'an edit is longer than a comment calls for';
    const known = new Set(markup(find));
    if (markup(replace).some((token) => !known.has(token))) return 'it adds HTML or a script link, which is for the maintainer to write';
  }
}

/**
 * What the notes in the repository, `entries` (paths from a Git tree, each a `blob` or a `tree`),
 * say against the new notes of the comment agent's change: each has to go in a folder that's there,
 * and a translation needs its original. Gives the problem, if there's one.
 */
function problemWithPlace(created, entries) {
  const adding = new Set(created.map((note) => note.path));
  for (const { path, lang } of created) {
    if (entries.get(posix.dirname(path)) !== 'tree') return `the folder of the new note ${path} isn't in the repository`;
    const original = lang === 'en' ? path : path.replace(/\.[a-z]{2}\.md$/i, '.md');
    if (original !== path && entries.get(original) !== 'blob' && !adding.has(original)) return `the new note ${path} is a translation of ${original}, which isn't in the repository`;
  }
}

/**
 * The links a change adds to notes that point to files that aren't in the repository, `entries`
 * (as in problemWithPlace), nor among its new notes: each with the note it's in. Links to pages
 * elsewhere, and links the notes had already, aren't looked at.
 */
function brokenLinks(files, entries) {
  const adding = new Set(files.filter((file) => file.created).map((file) => file.path));
  const targets = (text) => new Set([...text.matchAll(/\]\(\s*<?([^\s()<>]+)/g)].map(([, href]) => href));
  const broken = [];
  for (const file of files) {
    const had = targets(file.before);
    for (const href of targets(file.after)) {
      // External, absolute and same-page links, as noteLinks in src/lib/markdown.ts.
      if (had.has(href) || /^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) continue;
      let target;
      try {
        target = posix.join(posix.dirname(file.path), decodeURI(href.replace(/[?#].*$/, ''))).replace(/\/$/, '');
      } catch {
        target = undefined;
      }
      if (target === undefined || !(entries.has(target) || adding.has(target))) broken.push({ file: file.path, href });
    }
  }
  return broken;
}

/**
 * The edits, made on the notes as they are at `ref`: each replaces text that's in its note once,
 * and one with nothing to find adds a note that isn't there yet. Gives each note changed, before
 * and after, with the runs of lines that changed, or added; or the problem.
 */
async function applyEdits(github, { owner, repo }, ref, edits) {
  const files = new Map();
  for (const { lang, path, find, replace } of edits) {
    if (find === '') {
      if (files.has(path)) return { problem: `it adds ${path} and edits it too` };
      try {
        await github.rest.repos.getContent({ owner, repo, path, ref });
        return { problem: `${path}, which it adds, is in the repository already` };
      } catch (error) {
        if (error.status !== 404) throw error;
      }
      files.set(path, { path, lang, before: '', after: replace, created: true });
      continue;
    }
    if (!files.has(path)) {
      let data;
      try {
        ({ data } = await github.rest.repos.getContent({ owner, repo, path, ref }));
      } catch (error) {
        if (error.status === 404) return { problem: `${path} is no longer in the repository` };
        throw error;
      }
      if (Array.isArray(data) || data.type !== 'file' || !isText(data.content)) return { problem: `${path} isn't a note` };
      const text = Buffer.from(data.content, 'base64').toString('utf8');
      files.set(path, { path, lang, before: text, after: text });
    }
    const file = files.get(path);
    if (file.created) return { problem: `it adds ${path} and edits it too` };
    const at = file.after.indexOf(find);
    if (at === -1 || file.after.includes(find, at + 1)) {
      return { problem: `the text it replaces in ${path} is ${at === -1 ? 'not in the note' : 'in the note more than once'}` };
    }
    file.after = file.after.slice(0, at) + replace + file.after.slice(at + find.length);
  }
  const changed = [...files.values()].filter((file) => file.after !== file.before);
  if (changed.length === 0) return { problem: 'it changes nothing' };
  // A new note has no text of its own for the site to show a change on.
  return { files: changed.map((file) => ({ ...file, hunks: file.created ? [] : hunks(file.before, file.after) })) };
}

/**
 * The runs of lines that differ between two versions of a note: where each starts in `before`,
 * its lines there and the lines it became. A run that only adds lines comes with the line above
 * it, or at the start of the note the one below, so it has text of the note to be shown on.
 */
function hunks(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let end = 0;
  while (end < a.length - start && end < b.length - start && a[a.length - 1 - end] === b[b.length - 1 - end]) end++;
  const x = a.slice(start, a.length - end);
  const y = b.slice(start, b.length - end);

  // The lines kept in between, by the longest common subsequence; each run of lines is one
  // change when that's too much to work out.
  const kept = [];
  if (x.length * y.length <= 4_000_000) {
    const width = y.length + 1;
    const table = new Uint16Array((x.length + 1) * width);
    for (let i = x.length - 1; i >= 0; i--) {
      for (let j = y.length - 1; j >= 0; j--) {
        table[i * width + j] = x[i] === y[j] ? table[(i + 1) * width + j + 1] + 1 : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
      }
    }
    for (let i = 0, j = 0; i < x.length && j < y.length; ) {
      if (x[i] === y[j]) kept.push([i++, j++]);
      else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) i++;
      else j++;
    }
  }
  kept.push([x.length, y.length]);
  const runs = [];
  let i = 0;
  let j = 0;
  for (const [nextI, nextJ] of kept) {
    if (nextI > i || nextJ > j) runs.push({ aStart: start + i, aEnd: start + nextI, bStart: start + j, bEnd: start + nextJ });
    i = nextI + 1;
    j = nextJ + 1;
  }

  // The lines between runs are the same in both, so a run grows by as many on each side.
  const blank = (line) => line.trim() === '';
  const out = [];
  runs.forEach((run, k) => {
    let r = { ...run };
    if (a.slice(r.aStart, r.aEnd).every(blank)) {
      const floor = out.length > 0 ? out.at(-1).aEnd : 0;
      let above = r.aStart - 1;
      while (above >= floor && blank(a[above])) above--;
      if (above >= floor) {
        r.bStart -= r.aStart - above;
        r.aStart = above;
      } else if (out.length > 0) {
        const previous = out.pop();
        r = { aStart: previous.aStart, aEnd: r.aEnd, bStart: previous.bStart, bEnd: r.bEnd };
      } else {
        const ceiling = runs[k + 1]?.aStart ?? a.length;
        let below = r.aEnd;
        while (below < ceiling && blank(a[below])) below++;
        // Up to the line below, or up to the next run, which it then joins.
        const grow = below < ceiling ? below + 1 - r.aEnd : ceiling - r.aEnd;
        r.aEnd += grow;
        r.bEnd += grow;
      }
    }
    const previous = out.at(-1);
    if (previous && r.aStart <= previous.aEnd) {
      previous.aEnd = r.aEnd;
      previous.bEnd = r.bEnd;
    } else {
      out.push(r);
    }
  });
  return out.map((r) => ({ line: r.aStart + 1, before: a.slice(r.aStart, r.aEnd), after: b.slice(r.bStart, r.bEnd) }));
}

/** The changes to each note as diff blocks, which GitHub shows in red and green; a new note is all green. */
function diffs(files) {
  return files.map((file) => {
    const lines = (
      file.created
        ? ['@@ new note @@', ...file.after.replace(/\n$/, '').split('\n').map((text) => `+${text}`)]
        : file.hunks.flatMap(({ line, before, after }) => [`@@ line ${line} @@`, ...before.map((text) => `-${text}`), ...after.map((text) => `+${text}`)])
    ).join('\n');
    return `${LANGUAGES[file.lang] ?? file.lang}, \`${file.path}\`${file.created ? ', a new note' : ''}:\n\n${fence(lines)}diff\n${lines}\n${fence(lines)}`;
  });
}

/**
 * Each language version of the note, and whether the change changes it or adds it; then the other
 * notes it changes or adds, as the comment agent's changes can.
 */
function versionList({ name, versions, read, agent }, files) {
  const listed = new Set();
  const lines = Object.keys(LANGUAGES).map((lang) => {
    const file = versions[lang] ?? files.find((changed) => changed.created && changed.path === `notes/${name}${lang === 'en' ? '' : `.${lang}`}.md`)?.path;
    const change = files.find((changed) => changed.path === file);
    listed.add(file);
    const state = !file ? 'there is none yet' : change?.created ? 'new' : change ? 'changed' : `not changed, as ${agent ? 'the comment agent' : 'Copilot'} found nothing to change in it`;
    return `- ${LANGUAGES[lang]}${file ? `, \`${file}\`` : ''}${lang === read ? ', which the reader commented on' : ''}: ${state}`;
  });
  const others = files.filter((file) => !listed.has(file.path)).map((file) => `- \`${file.path}\`: ${file.created ? 'new' : 'changed'}`);
  return [...lines, ...others].join('\n');
}

/** Votes a proposal needs, from the CHANGE_VOTES repository variable: 3 unless it names another number. */
function votesNeeded(value) {
  const votes = Number(value);
  return value && Number.isInteger(votes) && votes >= 1 && votes <= 100 ? votes : 3;
}

/**
 * The issue comment with a proposal: the change as diffs, how to vote for it, and the proposal in
 * its marker for open-changes.yml. `broken` has the links it adds to files that aren't there.
 */
function proposalBody(proposal, files, votes, broken = []) {
  const needed = votes === 1 ? 'With a vote' : `With ${votes} votes, or one from a maintainer,`;
  const again = proposal.agent
    ? 'A maintainer can ask the comment agent for another proposal by commenting `/propose` and what to change.'
    : 'The reader and the maintainers can ask Copilot for another proposal by commenting `/propose` and what to change.';
  return [
    `### Proposal ${proposal.number}`,
    proposal.agent ? "The comment agent's change for this comment:" : "Copilot's change for this comment, in every language version of the note:",
    versionList(proposal, files),
    ...diffs(files),
    broken.length > 0 &&
      `> [!WARNING]\n> The change links to files that aren't in the repository: ${broken.map(({ file, href }) => `${plain(href)} in \`${file}\``).join(', ')}. Correct the links before merging.`,
    proposal.remarks && `**${proposal.agent ? "The comment agent's" : "Copilot's"} remarks:** ${plain(proposal.remarks)}`,
    `Vote for this change by reacting to this comment with 👍. ${needed} it becomes a pull request, for the maintainer to check and merge. When more than one proposal gets that far, the pull request has the one with the most votes, until it's merged or closed. The votes are counted every few hours. A maintainer can put this proposal on the pull request right away by commenting \`/accept ${proposal.number}\`, and then the votes no longer change it. ${again}`,
    marker(PROPOSAL, proposal),
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** A proposal's data as proposalBody writes it; false when it's something else. */
function isProposal(data) {
  if (!isRecord(data) || data.v !== 1 || !Number.isInteger(data.number)) return false;
  const { name, read, versions, file, path, lang, comment, remarks, edits, agent } = data;
  if (![name, file, path, comment, remarks].every(isText) || !isNote(file) || !PAGE_PATH.test(path)) return false;
  if (!Object.hasOwn(LANGUAGES, read) || !Object.hasOwn(LANGUAGES, lang) || !isRecord(versions) || ![undefined, true].includes(agent)) return false;
  if (!Object.entries(versions).every(([key, value]) => Object.hasOwn(LANGUAGES, key) && isNote(value))) return false;
  // Copilot's edits are to the versions of the note. The comment agent's are to any note, and one
  // with nothing to find adds a note.
  const fits = (edit) =>
    agent
      ? isNote(edit.path) && edit.lang === langOf(edit.path) && (edit.find !== '' || edit.replace !== '')
      : Object.hasOwn(versions, edit.lang) && edit.path === versions[edit.lang] && edit.find !== '';
  return Array.isArray(edits) && edits.length > 0 && edits.every((edit) => isRecord(edit) && isText(edit.find) && isText(edit.replace) && fits(edit));
}

/** The proposals among an issue's comments, oldest first, settled or not: the workflows' comments with a proposal's marker. */
function proposalsIn(comments) {
  return comments.flatMap((comment) => {
    if (comment.user?.login !== WORKFLOWS) return [];
    const data = readMarker(comment.body ?? '', PROPOSAL);
    return isProposal(data) ? [{ comment, data }] : [];
  });
}

/** The number of the next proposal on an issue: one more than the last, so no two share a number even when one was deleted. */
async function nextProposal(github, { owner, repo }, issue_number) {
  const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number, per_page: 100 });
  return Math.max(0, ...proposalsIn(comments).map(({ data }) => data.number)) + 1;
}

/**
 * What's been said on a comment's issue, for Copilot: people's comments, oldest first, as many of
 * the newest as fit, each with its author and their role; the proposals so far with their votes,
 * the most voted and then the newest, by number; and `request`, the /propose Copilot answers ({
 * comment, text, maintainer }), if there is one. The workflows' comments are left out but for the
 * proposals, and for the comment agent, `agent`, its answers in earlier runs. The agent gets more
 * of it all, and the files of the edits.
 */
function discussionOf(comments, { reader, request, agent = false }) {
  const room = agent ? { all: 20_000, each: 3000 } : { all: 10_000, each: 1500 };
  const roleOf = (login, maintainer) => [login === reader && 'the reader', maintainer && 'maintainer'].filter(Boolean).join(' and ') || 'someone else';
  const answers = new Set(agent ? agentRunsIn(comments).filter(({ data }) => data.state === 'done').map(({ comment }) => comment.id) : []);
  const entries = [];
  let bytes = 0;
  for (const said of comments.filter((comment) => comment.id !== request?.comment.id && (comment.user?.type !== 'Bot' || answers.has(comment.id))).slice(-30).reverse()) {
    const login = said.user?.login ?? 'ghost';
    const entry = answers.has(said.id)
      ? `<entry author="comment agent" role="you, in an earlier run">\n${clip(inert(said.body.slice(0, said.body.lastIndexOf(`<!-- ${AGENT} `)).trim()), room.each)}\n</entry>`
      : `<entry author="${login}" role="${roleOf(login, MAINTAINERS.includes(said.author_association))}">\n${clip(inert(said.body ?? ''), room.each)}\n</entry>`;
    bytes += Buffer.byteLength(entry);
    if (bytes > room.all) break;
    entries.unshift(entry);
  }

  const votesFor = ({ comment }) => comment.reactions?.['+1'] ?? 0;
  const editOf = ({ path, lang, find, replace }) => {
    if (agent && find === '') return `<create file="${path}">\n${inert(replace)}</create>`;
    return `<edit ${agent ? `file="${path}"` : `lang="${lang}"`}>\n<find>\n${inert(find)}\n</find>\n<replace>\n${inert(replace)}\n</replace>\n</edit>`;
  };
  const shown = [];
  let left = room.all;
  for (const proposal of proposalsIn(comments).sort((a, b) => votesFor(b) - votesFor(a) || b.data.number - a.data.number)) {
    if (left < 1000) break;
    const entry = `<proposal number="${proposal.data.number}" votes="${votesFor(proposal)}">\n${clip(proposal.data.edits.map(editOf).join('\n'), left - 100)}\n</proposal>`;
    left -= Buffer.byteLength(entry);
    shown.push({ number: proposal.data.number, entry });
  }
  shown.sort((a, b) => a.number - b.number);

  const asker = request?.comment.user?.login ?? 'ghost';
  return [
    `<discussion>\n${entries.join('\n') || '(Nothing said yet.)'}\n</discussion>`,
    shown.length > 0 && `<proposals>\n${shown.map(({ entry }) => entry).join('\n')}\n</proposals>`,
    request && `<request author="${asker}" role="${roleOf(asker, request.maintainer)}">\n${clip(inert(request.text.trim()), 3000) || '(Nothing more.)'}\n</request>`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * A proposal's comment once it's settled, with `note` on top saying how, and the `status` in its
 * marker, so it's voted on no more: `stale` once the note changed so much that it no longer fits.
 */
function settledBody(body, proposal, status, note) {
  const start = body.lastIndexOf(`<!-- ${PROPOSAL} `);
  const end = body.indexOf(' -->', start) + ' -->'.length;
  return `> [!NOTE]\n> ${note}\n\n${body.slice(0, start)}${marker(PROPOSAL, { ...proposal, status })}${body.slice(end)}`;
}

/** Whether `login` can push to the repository, as its maintainers can. */
async function isMaintainer(github, { owner, repo }, login) {
  try {
    const { data } = await github.rest.repos.getCollaboratorPermissionLevel({ owner, repo, username: login });
    // `write` stands for the maintain role too.
    return data.permission === 'admin' || data.permission === 'write';
  } catch (error) {
    if (error.status === 404) return false;
    throw error;
  }
}

/** Adds the labels of comments' issues that the repository doesn't have yet. */
async function ensureLabels(github, { owner, repo }) {
  const labels = await github.paginate(github.rest.issues.listLabelsForRepo, { owner, repo, per_page: 100 });
  const have = new Set(labels.map((label) => label.name.toLowerCase()));
  for (const label of LABELS.filter(({ name }) => !have.has(name))) {
    try {
      await github.rest.issues.createLabel({ owner, repo, ...label });
    } catch (error) {
      // 422: another run added it meanwhile.
      if (error.status !== 422) throw error;
    }
  }
}

/**
 * The comment agent's comments on an issue, oldest first, with the run in their marker: each says
 * the agent is `working`, and then has its answer, `done`, or why there's none, `failed`.
 */
function agentRunsIn(comments) {
  return comments.flatMap((comment) => {
    if (comment.user?.login !== WORKFLOWS) return [];
    const data = readMarker(comment.body ?? '', AGENT);
    return isRecord(data) && data.v === 1 && isText(data.state) && isText(data.at) ? [{ comment, data }] : [];
  });
}

/** Who had the comment agent look into a comment, and how, for its comment on the issue. */
function askedFor({ trigger, by, request }) {
  if (trigger === 'label') return `, as ${plain(by)} asked with the \`agent\` label`;
  if (trigger === 'propose') return `, as ${plain(by)} [asked](#issuecomment-${request})`;
  if (trigger === 'manual') return `, as ${plain(by)} asked`;
  return '';
}

/** How a maintainer has the comment agent look into a comment again. */
const AGAIN = 'A maintainer can start the agent again by commenting `/propose` and what to change, or by taking the `agent` label off the issue and adding it back.';

/**
 * Has the comment agent look into the comment of issue `issue_number`, on the branch this run is
 * on. A comment of its own says so, and later has its answer. `trigger` is what started it: a
 * maintainer's comment `opened`, their `label`, their /propose, whose comment is `request`, or a
 * `manual` run; `by` is who and `at` when. Gives the problem when GitHub doesn't start it.
 */
async function startAgent(github, context, { issue_number, trigger, by, at, request }) {
  const { owner, repo } = context.repo;
  // To the second, as GitHub gives the times of comments and reactions.
  const run = { v: 1, state: 'working', trigger, by, at: new Date(at).toISOString().replace(/\.\d+Z$/, 'Z'), ...(request === undefined ? {} : { request }) };
  const working = `**Copilot's comment agent** is looking into this comment${askedFor(run)}. It reads the notes and what's been said here, and its answer will be here in a few minutes.`;
  const { data: status } = await github.rest.issues.createComment({ owner, repo, issue_number, body: `${working}\n\n${marker(AGENT, run)}` });
  await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['agent'] });
  try {
    await github.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: AGENT_WORKFLOW,
      ref: context.ref.replace(/^refs\/heads\//, ''),
      inputs: { issue: String(issue_number), status: String(status.id) },
    });
    return {};
  } catch (error) {
    const failed = `**Copilot's comment agent** couldn't look into this comment, as GitHub didn't start it; [this run](${context.serverUrl}/${owner}/${repo}/actions/runs/${context.runId}) says why. ${AGAIN}`;
    await github.rest.issues.updateComment({ owner, repo, comment_id: status.id, body: `${failed}\n\n${marker(AGENT, { ...run, state: 'failed' })}` });
    return { problem: error.message };
  }
}

/**
 * The comment agent's reply to the reader, as it's shown on the issue. What strangers wrote went
 * into it, so it mentions nobody, references no issues elsewhere, and has no HTML, images or
 * links, but for links to this repository written out, like `repository`/blob/main/notes/…; math
 * can't link either. That's done all through it, in code too, so however GitHub reads it, it stays
 * safe; code only shows a little differently.
 */
function safeReply(text, repository) {
  const home = new RegExp(`^${repository.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[/#?][\\w.~/#?=-]*)?[.,:;!?)'"*_~]*$`);
  const kept = (url) => home.test(url) && !url.includes('/.');
  const safe = text
    // Character references, which could spell anything.
    .replace(/&(?=#|[a-z][a-z\d]*;)/gi, '&amp;')
    // HTML, comments like the markers, and links in angle brackets.
    .replace(/<(?=[a-z/!?])/gi, '&lt;')
    // Links, images and link definitions.
    .replace(/\]([(:])/g, ']\\$1')
    // In math, \href and \url link, and an even run of backslashes before them is a line break.
    .replace(/\\+(?=(?:href|url)\b)/gi, (run) => (run.length % 2 === 1 ? `${run}\\` : run))
    .replace(/@(?=[\w-])/g, '@\u200b')
    .replace(/(?<![\w./-])([\w.-]+\/[\w.-]+)#(?=\d)/g, '$1#\u200b')
    // Addresses, which GitHub links by themselves; a character after `://` or `www` stops that.
    .replace(/[a-z][a-z\d+.-]*:\/\/[^\s<]*/gi, (url) => (kept(url) ? url : url.replace('://', '://\u200b')))
    .replace(/\bwww\./gi, 'www\u200b.');
  return clip(safe, 6000);
}

module.exports = {
  LANGUAGES,
  COMMENT,
  PROPOSAL,
  CHANGE,
  AGENT,
  WORKFLOWS,
  AGENT_WORKFLOW,
  MAX_PROPOSALS,
  MAX_BODY,
  TOKEN,
  AGAIN,
  isNote,
  langOf,
  inert,
  marker,
  readMarker,
  plain,
  clip,
  commentFrom,
  versionsOf,
  parseAnswer,
  problemWith,
  parseAgentAnswer,
  problemWithAgent,
  problemWithPlace,
  brokenLinks,
  applyEdits,
  hunks,
  diffs,
  versionList,
  votesNeeded,
  proposalBody,
  isProposal,
  proposalsIn,
  nextProposal,
  discussionOf,
  settledBody,
  isMaintainer,
  ensureLabels,
  agentRunsIn,
  askedFor,
  startAgent,
  safeReply,
};
