/**
 * Chapter exams on the server (lib/exams.ts): sealing each exam's answer key into its page at
 * build time, and taking an exam through the API: drawing an attempt's questions, checking the
 * answers and keeping the results in the private results repository, one file per reader.
 *
 * Everything here rests on EXAM_SECRET. Whoever has it can open the answer keys and seal keys
 * of their own, so only production builds and the production API may see it.
 */
import { createHmac } from 'node:crypto';
import type { Covered } from '../lib/certificates.ts';
import type { Exam } from '../lib/course.ts';
import type { Attempt, ExamKey, ExamRecord, KeyQuestion } from '../lib/exams.ts';
import { site } from '../site.config.ts';
import { botToken, isConflict, readFile, writeFile, type Bot } from './github.ts';
import { seal, unseal, type User } from './session.ts';

export interface ExamConfig {
  /** Seals answer keys and attempts, and makes versions, draws and certificate ids nobody can work out. */
  secret: string;
  bot: Bot;
  /** Repository that keeps readers' results, as `owner/name`. */
  results: string;
  /** Public repository that keeps the certificates, as `owner/name`. */
  certificates: string;
}

/** Longest an attempt can take, in ms: once it's over, the attempt has to be started again. */
export const ATTEMPT_TIME = 24 * 60 * 60 * 1000;

const KEY_SEAL = 'mlw_exam_key';
const ATTEMPT_SEAL = 'mlw_exam_attempt';

/** The API's exam settings, or the names of the ones that are missing. */
export function readExamConfig(env: Record<string, string | undefined> = process.env): ExamConfig | string[] {
  const { EXAM_SECRET: secret = '', BOT_APP_ID: appId = '', BOT_APP_PRIVATE_KEY: privateKey = '' } = env;
  const missing = [];
  if (secret.length < 32) missing.push('EXAM_SECRET (32 characters or more)');
  if (!appId) missing.push('BOT_APP_ID');
  if (!privateKey) missing.push('BOT_APP_PRIVATE_KEY');
  if (missing.length > 0) return missing;
  return { secret, bot: { appId, privateKey }, results: repoName(site.exams.results), certificates: repoName(site.exams.certificates) };
}

/** EXAM_SECRET, which builds with exam questions need to seal their answer keys into the pages. */
export function examSecret(env: Record<string, string | undefined> = process.env): string {
  const secret = env.EXAM_SECRET ?? '';
  if (secret.length < 32) {
    throw new Error(
      'The exam questions in exams/ need EXAM_SECRET, 32 characters or more, to seal their answer keys into the pages. ' +
        'Set it in .env, or in the site\'s environment variables on Netlify; see "Exams" in the README.',
    );
  }
  return secret;
}

/** `https://github.com/owner/name` → `owner/name` */
export function repoName(url: string): string {
  return new URL(url).pathname.replace(/^\/|\/$|\.git$/g, '');
}

// ---------- Answer keys ----------

/**
 * An exam's answer key, sealed for its page at build time, and the version of its questions,
 * which the page shows as it is: pages in every language get the same one. The key also holds
 * what the exam covers, in every language, for the certificates the API issues from it.
 */
export async function pageKey(exam: Exam, covers: Covered, secret: string): Promise<{ key: string; version: string }> {
  const files = exam.parts.flatMap((part) => part.versions.map((note) => ({ path: note.filePath ?? note.id, text: note.body ?? '' })));
  const version = examVersion(files, secret);
  const questions = exam.parts.flatMap((part) => part.key.map(({ id, right }) => ({ id, lesson: part.lesson.path, right })));
  return { key: await sealKey({ chapter: exam.chapter.path, version, questions, covers }, secret), version };
}

/**
 * Version of an exam's questions, from the text of every language version of them: it changes
 * with any change to them. It's keyed with the secret, so it doesn't let anyone check guesses
 * of the questions' text, answers included, against it.
 */
function examVersion(files: { path: string; text: string }[], secret: string): string {
  const sorted = [...files].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return createHmac('sha256', secret)
    .update(`version\n${JSON.stringify(sorted.map((file) => [file.path, file.text]))}`)
    .digest('hex')
    .slice(0, 16);
}

export function sealKey(key: ExamKey, secret: string): Promise<string> {
  return seal(key, KEY_SEAL, secret);
}

/** The answer key sealed into a page, or undefined when it was sealed with another secret or changed. */
export function openKey(sealed: string, secret: string): Promise<ExamKey | undefined> {
  return unseal<ExamKey>(sealed, KEY_SEAL, secret);
}

// ---------- Attempts ----------

/** An attempt in progress, sealed into the token the page hands back with the answers. */
export interface OpenAttempt {
  /** The reader's GitHub id. */
  reader: number;
  chapter: string;
  version: string;
  /** How many attempts the reader had handed in when it started. */
  number: number;
  /** The questions drawn, with their right answers. */
  questions: KeyQuestion[];
  /** When it started, in ms since 1970. */
  at: number;
}

export function sealAttempt(attempt: OpenAttempt, secret: string): Promise<string> {
  return seal(attempt, ATTEMPT_SEAL, secret);
}

export function openAttempt(sealed: string, secret: string): Promise<OpenAttempt | undefined> {
  return unseal<OpenAttempt>(sealed, ATTEMPT_SEAL, secret);
}

/**
 * The questions of a reader's attempt: `count` of them, taken from each lesson in turn so that
 * every lesson is asked about, in the order of the lessons. The draw depends on the reader, the
 * questions' version and the attempt's number, in a way only the secret can work out: starting
 * the same attempt again draws the same questions, so it can't be used to fish for easier ones.
 */
export function drawQuestions(key: ExamKey, reader: number, number: number, count: number, secret: string): KeyQuestion[] {
  const rank = (name: string) =>
    createHmac('sha256', secret).update(`draw\n${reader}\n${key.chapter}\n${key.version}\n${number}\n${name}`).digest('hex');
  const shuffle = <T>(items: T[], name: (item: T) => string) =>
    items
      .map((item) => ({ item, rank: rank(name(item)) }))
      .sort((a, b) => (a.rank < b.rank ? -1 : 1))
      .map(({ item }) => item);

  const byLesson = new Map<string, KeyQuestion[]>();
  for (const question of key.questions) byLesson.set(question.lesson, [...(byLesson.get(question.lesson) ?? []), question]);
  const queues = shuffle([...byLesson.keys()], (lesson) => `lesson ${lesson}`).map((lesson) =>
    shuffle(byLesson.get(lesson)!, (question) => `question ${question.id}`),
  );

  const drawn = new Set<KeyQuestion>();
  const total = Math.min(count, key.questions.length);
  while (drawn.size < total) {
    for (const queue of queues) {
      const question = queue.shift();
      if (question && drawn.size < total) drawn.add(question);
    }
  }
  return key.questions.filter((question) => drawn.has(question));
}

/** The questions answered right and wrong: right means exactly the right answers were picked. */
export function checkAnswers(questions: KeyQuestion[], answers: Record<string, unknown>): { right: KeyQuestion[]; wrong: KeyQuestion[] } {
  const right: KeyQuestion[] = [];
  const wrong: KeyQuestion[] = [];
  for (const question of questions) {
    const given = Object.hasOwn(answers, question.id) ? answers[question.id] : undefined;
    const picked = new Set(Array.isArray(given) ? given : []);
    const isRight = picked.size === question.right.length && question.right.every((answer) => picked.has(answer));
    (isRight ? right : wrong).push(question);
  }
  return { right, wrong };
}

/** A reader's attempts at an exam, with when they can try again: `wait` hours after an attempt, unless they've passed. */
export function examRecord(attempts: Attempt[], now = Date.now()): ExamRecord {
  const last = attempts.at(-1);
  if (!last || attempts.some((attempt) => attempt.passed)) return { attempts };
  const next = Date.parse(last.at) + site.exams.wait * 60 * 60 * 1000;
  return next > now ? { attempts, next: new Date(next).toISOString() } : { attempts };
}

// ---------- Results ----------

/** A reader's file in the results repository, `readers/<GitHub id>.json`. */
export interface Results {
  /** GitHub id, which stays the same when the reader renames their account. */
  id: number;
  /** GitHub login as of their last attempt. */
  login: string;
  /** Attempts at each exam, by the chapter's language-neutral URL, oldest first. */
  exams: Record<string, Attempt[]>;
  /** Ids of the reader's certificates, by the chapter's language-neutral URL; missing until they ask for one. */
  certificates?: Record<string, string>;
}

function resultsFile(reader: number): string {
  return `readers/${reader}.json`;
}

/** A reader's results, and the SHA of their file for replacing it; a reader without a file has none yet. */
export async function readResults(config: ExamConfig, reader: User): Promise<{ results: Results; sha?: string }> {
  const token = await botToken(config.bot, config.results, 'write');
  const file = await readFile(token, config.results, resultsFile(reader.id));
  if (!file) return { results: { id: reader.id, login: reader.login, exams: {} } };
  const results = JSON.parse(file.text) as Partial<Results>;
  const exams = Object.entries(typeof results.exams === 'object' && results.exams !== null ? results.exams : {});
  const certificates = Object.entries(typeof results.certificates === 'object' && results.certificates !== null ? results.certificates : {});
  const ids = certificates.filter(([, id]) => typeof id === 'string');
  return {
    results: {
      id: reader.id,
      login: String(results.login ?? reader.login),
      exams: Object.fromEntries(exams.filter(([, attempts]) => Array.isArray(attempts))),
      ...(ids.length > 0 && { certificates: Object.fromEntries(ids) }),
    },
    sha: file.sha,
  };
}

/**
 * Adds a handed-in attempt to the reader's results, as number `number` of that exam. Gives false,
 * and records nothing, when that number is already taken: the attempt was handed in already,
 * from another tab or device.
 */
export function recordAttempt(config: ExamConfig, reader: User, chapter: string, number: number, attempt: Attempt): Promise<boolean> {
  const message = `${chapter} exam: @${reader.login}, ${Math.round(attempt.score * 100)}%${attempt.passed ? ', passed' : ''}`;
  return updateResults(config, reader, message, (results) => {
    const attempts = results.exams[chapter] ?? [];
    if (attempts.length !== number) return undefined;
    return { ...results, login: reader.login, exams: { ...results.exams, [chapter]: [...attempts, attempt] } };
  });
}

/** Notes the id of the reader's certificate for a chapter in their results, and gives the id they have: theirs already, if they had one. */
export async function recordCertificate(config: ExamConfig, reader: User, chapter: string, id: string): Promise<string> {
  let kept = id;
  await updateResults(config, reader, `${chapter} certificate: @${reader.login}`, (results) => {
    const had = results.certificates?.[chapter];
    kept = had ?? id;
    return had ? undefined : { ...results, certificates: { ...results.certificates, [chapter]: id } };
  });
  return kept;
}

/**
 * Replaces the reader's results with what `change` makes of them, or leaves them as they are
 * when it gives undefined; gives whether they changed. When the file changes while it's being
 * written, it's read and changed again.
 */
async function updateResults(config: ExamConfig, reader: User, message: string, change: (results: Results) => Results | undefined): Promise<boolean> {
  const token = await botToken(config.bot, config.results, 'write');
  for (let tries = 1; ; tries++) {
    const { results, sha } = await readResults(config, reader);
    const updated = change(results);
    if (!updated) return false;
    try {
      await writeFile(token, config.results, resultsFile(reader.id), `${JSON.stringify(updated, null, 2)}\n`, message, sha);
      return true;
    } catch (error) {
      if (!isConflict(error) || tries === 3) throw error;
    }
  }
}
