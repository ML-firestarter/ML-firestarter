/**
 * Certificates for the chapter exams (lib/exams.ts), as the API (server/certificates.ts), the
 * exam page and the certificate page share them.
 *
 * A reader who passed a chapter's exam can ask for its certificate. The site's bot writes it to
 * the public certificates repository (`exams.certificates` in site.config.ts) as
 * `certificates/<id>.json`, and the certificate page shows it at `/certificates/<id>/`, reading
 * the file from there. GitHub shows who wrote each file, and marks the bot's commits as
 * verified, so that repository is what vouches for a certificate.
 */
import type { Attempt } from './exams.ts';
import type { Lang } from './i18n.ts';

/** A title in each language, as the site showed it when the certificate was issued. */
export type Titles = Partial<Record<Lang, string>>;

/** What an exam covers, as its certificates say: its chapter, and the chapter's lessons it asks about. */
export interface Covered {
  /** The chapter's title. */
  title: Titles;
  /** The lessons with exam questions, in reading order: their language-neutral URLs and titles. */
  lessons: { path: string; title: Titles }[];
}

/** A certificate, as the certificates repository keeps it. */
export interface Certificate extends Covered {
  /** As in its address. */
  id: string;
  /** Who it was issued to, as GitHub knew them then; the GitHub id stays the same when they rename their account. */
  reader: { id: number; login: string; name?: string };
  /** Language-neutral URL of the chapter, like `/foundations/`. */
  chapter: string;
  /** The attempt that passed the exam. */
  passed: Attempt;
  /** When it was issued, as an ISO date. */
  issued: string;
  /** Address of the site that issued it. */
  site: string;
}

/** POST /api/certificates */
export interface CertificateRequest {
  /** The sealed answer key from the exam's page, which says what the exam covers. */
  key: string;
}

export interface CertificateResponse {
  /** The certificate's id. */
  certificate: string;
}

/** Whether `value` looks like a certificate's id: 16 lowercase hexadecimal characters. */
export function isCertificateId(value: string): boolean {
  return /^[0-9a-f]{16}$/.test(value);
}

/** Where a certificate is in the certificates repository `owner/name`: its path, its raw JSON, its page on GitHub and its history. */
export function certificateFile(repo: string, id: string) {
  const path = `certificates/${id}.json`;
  return {
    path,
    raw: `https://raw.githubusercontent.com/${repo}/HEAD/${path}`,
    page: `https://github.com/${repo}/blob/HEAD/${path}`,
    history: `https://github.com/${repo}/commits/HEAD/${path}`,
  };
}
