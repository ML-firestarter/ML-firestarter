/**
 * Chapter exams, as the site's API (server/exams.ts) and the exam page (scripts/exam.ts) share them.
 *
 * An exam's page holds all of the chapter's exam questions without their answers, and its
 * answer key sealed with EXAM_SECRET, which only the API can open. Starting an attempt draws
 * the questions to answer; handing it in has the API check the answers and keep the result in
 * the reader's file of the private results repository. Pages get scores and the lessons to
 * read again, never which answers are right. A pass earns a certificate, which the reader can
 * publish (lib/certificates.ts).
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

/** An exam's answer key, sealed into its page. */
export interface ExamKey {
  /** Language-neutral URL of the chapter the exam covers, like `/foundations/`. */
  chapter: string;
  /** Changes whenever the questions change, in any language. */
  version: string;
  /** Every question of the exam, in the order of the lessons. */
  questions: KeyQuestion[];
  /** What the exam's certificates say it covers; keys sealed before certificates don't have it. */
  covers?: Covered;
}

/** A handed-in attempt, as the reader's results keep it; their answers aren't kept. */
export interface Attempt {
  /** When it was handed in, as an ISO date. */
  at: string;
  /** Share of right answers, from 0 to 1. */
  score: number;
  right: number;
  questions: number;
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
  /** The attempt, sealed: the questions drawn and their answers, to hand back with the reader's answers. */
  attempt: string;
  /** Ids of the questions drawn, in the order of the lessons. */
  questions: string[];
  /** When the attempt has to be handed in by, as an ISO date. */
  expires: string;
}

/** POST /api/exams/submit */
export interface SubmitRequest {
  attempt: string;
  /** Positions of the answers picked, by question id. */
  answers: Record<string, number[]>;
}

export interface SubmitResponse {
  result: Attempt;
  /** Language-neutral URLs of the lessons with questions answered wrong, in the order of the lessons. */
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
