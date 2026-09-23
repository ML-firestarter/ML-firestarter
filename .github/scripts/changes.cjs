// What the comment workflows share. The triage (.github/workflows/triage-comments.yml) has
// Copilot propose a change for a reader's comment, written into every language version of the
// note, and posts it on the comment's issue for a vote. The first proposal to get the votes becomes
// a pull request (.github/workflows/open-changes.yml), which then has whichever proposal with the
// votes has the most of them, or the one a maintainer accepts. Its hidden marker holds what the
// site needs to show the change (changeFrom in src/lib/comments.ts).
'use strict';

/** The languages of the notes, as LANGS in src/lib/i18n.ts, English first. */
const LANGUAGES = { en: 'English', pl: 'Polish' };

/** Open the hidden markers: of a comment's issue (MARKER in src/lib/comments.ts), of a proposal, and of a pull request with a change (CHANGE_MARKER). */
const COMMENT = 'ml-workout:comment';
const PROPOSAL = 'ml-workout:proposal';
const CHANGE = 'ml-workout:change';

/** Who writes the proposals and opens the pull requests. */
const WORKFLOWS = 'github-actions[bot]';

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
  const markup = (text) => (text.match(/<\/?[a-z][\w-]*|&#|\][(:]\s*<?\s*(?:javascript|vbscript|data):/gi) ?? []).map((token) => token.toLowerCase().replace(/\s+/g, ''));
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
 * The edits, made on the notes as they are at `ref`: each replaces text that's in its note once.
 * Gives each note changed, before and after, with the runs of lines that changed; or the problem.
 */
async function applyEdits(github, { owner, repo }, ref, edits) {
  const files = new Map();
  for (const { lang, path, find, replace } of edits) {
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
    const at = file.after.indexOf(find);
    if (at === -1 || file.after.includes(find, at + 1)) {
      return { problem: `the text it replaces in ${path} is ${at === -1 ? 'not in the note' : 'in the note more than once'}` };
    }
    file.after = file.after.slice(0, at) + replace + file.after.slice(at + find.length);
  }
  const changed = [...files.values()].filter((file) => file.after !== file.before);
  if (changed.length === 0) return { problem: 'it changes nothing' };
  return { files: changed.map((file) => ({ ...file, hunks: hunks(file.before, file.after) })) };
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

/** The changes to each version of the note as diff blocks, which GitHub shows in red and green. */
function diffs(files) {
  return files.map((file) => {
    const lines = file.hunks
      .flatMap(({ line, before, after }) => [`@@ line ${line} @@`, ...before.map((text) => `-${text}`), ...after.map((text) => `+${text}`)])
      .join('\n');
    return `${LANGUAGES[file.lang] ?? file.lang}, \`${file.path}\`:\n\n${fence(lines)}diff\n${lines}\n${fence(lines)}`;
  });
}

/** Each language version of the note, and whether the change changes it. */
function versionList({ versions, read }, files) {
  return Object.keys(LANGUAGES)
    .map((lang) => {
      const file = versions[lang];
      const state = !file ? 'there is none yet' : files.some((changed) => changed.lang === lang) ? 'changed' : 'not changed, as Copilot found nothing to change in it';
      return `- ${LANGUAGES[lang]}${file ? `, \`${file}\`` : ''}${lang === read ? ', which the reader commented on' : ''}: ${state}`;
    })
    .join('\n');
}

/** Votes a proposal needs, from the CHANGE_VOTES repository variable: 3 unless it names another number. */
function votesNeeded(value) {
  const votes = Number(value);
  return value && Number.isInteger(votes) && votes >= 1 && votes <= 100 ? votes : 3;
}

/** The issue comment with a proposal: the change as diffs, how to vote for it, and the proposal in its marker for open-changes.yml. */
function proposalBody(proposal, files, votes) {
  const needed = votes === 1 ? 'With a vote' : `With ${votes} votes, or one from a maintainer,`;
  return [
    `### Proposal ${proposal.number}`,
    "Copilot's change for this comment, in every language version of the note:",
    versionList(proposal, files),
    ...diffs(files),
    proposal.remarks && `**Copilot's remarks:** ${plain(proposal.remarks)}`,
    `Vote for this change by reacting to this comment with 👍. ${needed} it becomes a pull request, for the maintainer to check and merge. When more than one proposal gets that far, the pull request has the one with the most votes, until it's merged or closed. The votes are counted every 15 minutes. A maintainer can put this proposal on the pull request right away by commenting \`/accept ${proposal.number}\`, and then the votes no longer change it. The reader and the maintainers can ask Copilot for another proposal by commenting \`/propose\` and what to change.`,
    marker(PROPOSAL, proposal),
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** A proposal's data as proposalBody writes it; false when it's something else. */
function isProposal(data) {
  if (!isRecord(data) || data.v !== 1 || !Number.isInteger(data.number)) return false;
  const { name, read, versions, file, path, lang, comment, remarks, edits } = data;
  if (![name, file, path, comment, remarks].every(isText) || !isNote(file) || !PAGE_PATH.test(path)) return false;
  if (!Object.hasOwn(LANGUAGES, read) || !Object.hasOwn(LANGUAGES, lang) || !isRecord(versions)) return false;
  if (!Object.entries(versions).every(([key, value]) => Object.hasOwn(LANGUAGES, key) && isNote(value))) return false;
  return (
    Array.isArray(edits) &&
    edits.length > 0 &&
    edits.every((edit) => isRecord(edit) && Object.hasOwn(versions, edit.lang) && edit.path === versions[edit.lang] && isText(edit.find) && edit.find !== '' && isText(edit.replace))
  );
}

/** The proposals among an issue's comments, oldest first, settled or not: the workflows' comments with a proposal's marker. */
function proposalsIn(comments) {
  return comments.flatMap((comment) => {
    if (comment.user?.login !== WORKFLOWS) return [];
    const data = readMarker(comment.body ?? '', PROPOSAL);
    return isProposal(data) ? [{ comment, data }] : [];
  });
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

module.exports = {
  LANGUAGES,
  COMMENT,
  PROPOSAL,
  CHANGE,
  WORKFLOWS,
  MAX_PROPOSALS,
  MAX_BODY,
  isNote,
  marker,
  readMarker,
  plain,
  clip,
  commentFrom,
  versionsOf,
  parseAnswer,
  problemWith,
  applyEdits,
  hunks,
  diffs,
  versionList,
  votesNeeded,
  proposalBody,
  isProposal,
  proposalsIn,
  settledBody,
  isMaintainer,
};
