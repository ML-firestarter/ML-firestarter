/**
 * Chapter exams, as the site's API (server/exams.ts) and the exam page (scripts/exam.ts) share them.
 *
 * An exam's page holds all of the chapter's exam questions without their answers, and its
 * answer key sealed with EXAM_SECRET, which only the API can open. Starting an attempt draws
 * the questions to answer; handing it in has the API check the answers and keep the result in
 * the reader's file of the private results repository. Pages get scores and the lessons to
 * read again, never which answers are right. A pass earns a certificate, which the reader can
 * publish (lib/certificates.ts).
 *
 * An exam can also have practical tasks, in which the reader writes Python. The page holds their
 * texts and the code to start from; the key holds, for each task, a pool of instances, each with
 * the cases to run on the reader's code and a digest of what the right code does with them. An
 * attempt draws one instance of each task and gives the page its cases. The page runs them on the
 * reader's code in their browser (scripts/python.ts) and hands in what each did, which the API
 * compares with the digest: the cases never come with their answers, and the reader's code
 * never runs on the server.
 */
import type { CertificateState, Covered } from './certificates.ts';

/** A question of an exam's answer key. */
export interface KeyQuestion {
  /** Like `vocabulary-sft-2`, the same in every language: from its lesson's path and its number there. */
  id: string;
  /** Language-neutral URL of the lesson it asks about. */
  lesson: string;
  /** Positions of its right answers in its list of answers. */
  right: number[];
}

/** A practical task of an exam's answer key. */
export interface KeyTask {
  /** Like `python-triangles`, the same in every language: from its chapter's path and its folder's name. */
  id: string;
  /** Language-neutral URLs of the lessons it draws on, in the order of the lessons. */
  lessons: string[];
  /** What attempts draw from; every attempt gets one. */
  instances: KeyInstance[];
}

/** One instance of a practical task: what to run on the reader's code, and what the right code does with it. */
export interface KeyInstance {
  /** Python expressions to evaluate in the code, like `triangle_kind(3, 4, 5)`, or `program('3', '4')` to run it as a program. */
  cases: string[];
  /** The files the cases read, by name, as text. */
  files: Record<string, string>;
  /** Keyed digest of what the right code does with the cases (server/exams.ts), which doesn't give it away. */
  digest: string;
}

/** An exam's answer key, sealed into its page. */
export interface ExamKey {
  /** Language-neutral URL of the chapter the exam covers, like `/foundations/`. */
  chapter: string;
  /** Changes whenever the questions or tasks change, in any language. */
  version: string;
  /** Every question of the exam, in the order of the lessons. */
  questions: KeyQuestion[];
  /** The exam's practical tasks, a `KeyTask[]` packed to keep the key small (server/exams.ts); missing without any, and in keys sealed before there were tasks. */
  tasks?: string;
  /** What the exam's certificates say it covers; keys sealed before certificates don't have it. */
  covers?: Covered;
}

/** A handed-in attempt, as the reader's results keep it; their answers and code aren't kept. */
export interface Attempt {
  /** When it was handed in, as an ISO date. */
  at: string;
  /** Share of right answers and solved tasks, from 0 to 1. */
  score: number;
  /** Questions answered right, and tasks solved. */
  right: number;
  /** Questions and tasks in all. */
  questions: number;
  /** How many of `questions` were practical tasks; missing in attempts at exams that had none. */
  tasks?: number;
  passed: boolean;
  /** Version of the questions it was drawn from. */
  version: string;
}

/** A reader's attempts at one exam. */
export interface ExamRecord {
  attempts: Attempt[];
  /** When the reader can start another attempt, as an ISO date; missing once they can, and once they've passed. */
  next?: string;
  /** The reader's certificate for the exam, once they have one. */
  certificate?: CertificateState;
}

/** GET /api/exams: the reader's attempts, by the chapter's language-neutral URL. */
export interface ExamStatus {
  exams: Record<string, ExamRecord>;
}

/** POST /api/exams/start */
export interface StartRequest {
  /** The sealed answer key from the exam's page. */
  key: string;
}

export interface StartResponse {
  /** The attempt, sealed: the questions and tasks drawn and their answers, to hand back with the reader's answers. */
  attempt: string;
  /** Ids of the questions drawn, in the order of the lessons. */
  questions: string[];
  /** Every practical task of the exam, with the instance this attempt runs on the reader's code. */
  tasks: StartedTask[];
  /** When the attempt has to be handed in by, as an ISO date. */
  expires: string;
}

/** A practical task of an attempt: what to run on the reader's code when they hand it in. */
export interface StartedTask {
  id: string;
  /** Python expressions to evaluate in the reader's code (scripts/python.ts's `observe`). */
  cases: string[];
  /** The files the cases read, by name, in base64. */
  files: Record<string, string>;
}

/** POST /api/exams/submit */
export interface SubmitRequest {
  attempt: string;
  /** Positions of the answers picked, by question id. */
  answers: Record<string, number[]>;
  /** What each case of each task did on the reader's code, by task id: empty when the code couldn't run them. */
  observations: Record<string, string[]>;
}

export interface SubmitResponse {
  result: Attempt;
  /** Language-neutral URLs of the lessons with questions answered wrong, and those the tasks that weren't solved draw on. */
  review: string[];
  /** When the reader can try again, as an ISO date; missing once they've passed. */
  next?: string;
  /** The certificate the attempt earned, when it passed and the site signs certificates. */
  certificate?: CertificateState;
}

/**
 * What the API answers when it can't do what was asked; `next` comes with `waiting`.
 *
 * - `outdated`: the page's answer key was sealed with another secret, or before certificates, so the page needs reloading.
 * - `expired`: the attempt ran out of time, or isn't the reader's; it has to be started again.
 * - `handed-in`: the attempt was handed in already, from another tab or device.
 * - `not-passed`: a certificate was published or unpublished for an exam the reader hasn't passed.
 */
export interface ExamError {
  error:
    | 'signed-out'
    | 'not-configured'
    | 'outdated'
    | 'expired'
    | 'handed-in'
    | 'waiting'
    | 'passed'
    | 'not-passed'
    | 'rate-limited'
    | 'invalid'
    | 'forbidden'
    | 'github'
    | 'server';
  message: string;
  next?: string;
}
