/**
 * Certificates for the chapter exams (lib/exams.ts), as the API (server/certificates.ts), the
 * exam page and the certificate page share them.
 *
 * A reader who passes a chapter's exam gets a certificate for it, signed by the site as a JWS
 * with its Ed25519 key and kept in their results. It's theirs to publish: the site's bot then
 * writes it to the public certificates repository (`exams.certificates` in site.config.ts) as
 * `certificates/<id>.json`, and the certificate page shows it at `/certificates/<id>/`, reading
 * the file from there and checking its signature against the site's public key, which the site
 * publishes at `/certificates/keys.json`. Unpublishing deletes the file again.
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

/** A certificate, as the site signs it. */
export interface Certificate extends Covered {
  /** As in its address. */
  id: string;
  /** Who it was issued to, as GitHub knew them then; the GitHub id stays the same when they rename their account. */
  reader: { id: number; login: string; name?: string };
  /** Language-neutral URL of the chapter, like `/foundations/`. */
  chapter: string;
  /** The attempt that passed the exam, with the version of the questions it was drawn from. */
  passed: Attempt;
  /** When it was issued, as an ISO date. */
  issued: string;
  /** Address of the site that issued it. */
  site: string;
}

/** A published certificate's file in the certificates repository: the certificate, to read, and as the site signed it. */
export interface CertificateFile {
  certificate: Certificate;
  /** The certificate, signed: a compact JWS (RFC 7515) with EdDSA (RFC 8037). Only this counts. */
  jws: string;
}

/** A public key the site signs certificates with, as a JSON Web Key; its id is its thumbprint (RFC 7638). */
export interface CertificateKey {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;
  kid: string;
  alg: 'EdDSA';
  use: 'sig';
}

/** A reader's certificate for an exam, as the API tells pages about it. */
export interface CertificateState {
  id: string;
  /** Whether it's in the public certificates repository, with a page of its own. */
  published: boolean;
}

/** POST /api/certificates: publishes the reader's certificate for the exam whose page sends its key. */
export interface PublishRequest {
  /** The sealed answer key from the exam's page, which says what the exam covers. */
  key: string;
}

/** DELETE /api/certificates: unpublishes the reader's certificate for a chapter. */
export interface UnpublishRequest {
  /** The chapter's language-neutral URL, like `/foundations/`. */
  chapter: string;
}

export interface CertificateResponse {
  certificate: CertificateState;
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

/**
 * The parts of a compact JWS: its header and payload, the text its signature signs and the
 * signature itself; undefined when it isn't one. It says nothing about whether the signature is
 * right. Works in browsers and on the server alike.
 */
export function readJws(jws: string): { header: Record<string, unknown>; payload: unknown; input: string; signature: Uint8Array<ArrayBuffer> } | undefined {
  const parts = jws.split('.');
  if (parts.length !== 3 || !parts.every((part) => /^[\w-]+$/.test(part))) return undefined;
  try {
    const decode = (part: string): unknown => JSON.parse(new TextDecoder().decode(fromBase64Url(part)));
    const header = decode(parts[0]);
    if (typeof header !== 'object' || header === null || Array.isArray(header)) return undefined;
    return { header: header as Record<string, unknown>, payload: decode(parts[1]), input: `${parts[0]}.${parts[1]}`, signature: fromBase64Url(parts[2]) };
  } catch {
    return undefined;
  }
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
