/**
 * Certificates on the server (lib/certificates.ts). When a reader passes an exam, the API signs
 * a certificate for it with the site's Ed25519 key, CERTIFICATE_KEY, as a JWS, and keeps it in
 * their results. Publishing it is up to them: the site's bot then writes it to the public
 * certificates repository, and unpublishing deletes it from there, though not from the
 * repository's history. The site publishes the key's public half (pages/certificates/keys.json.ts),
 * so that the certificate page, and anyone else, can check the signatures.
 */
import { createHash, createHmac, createPrivateKey, createPublicKey, sign, type KeyObject } from 'node:crypto';
import { certificateFile, readJws, type Certificate, type CertificateFile, type CertificateKey, type Covered } from '../lib/certificates.ts';
import type { Attempt } from '../lib/exams.ts';
import { DEFAULT_LANG } from '../lib/i18n.ts';
import type { ExamConfig, KeptCertificate } from './exams.ts';
import { botToken, deleteFile, isConflict, readFile, writeFile } from './github.ts';
import type { User } from './session.ts';

/** The exams' settings with the key that signs certificates, which they need. */
export type SigningConfig = ExamConfig & { certificateKey: KeyObject };

/** Id of a reader's certificate for a chapter: the same every time, so asking twice at once still makes one certificate. */
export function certificateId(reader: number, chapter: string, secret: string): string {
  return createHmac('sha256', secret).update(`certificate\n${reader}\n${chapter}`).digest('hex').slice(0, 16);
}

/**
 * The key that signs the certificates, from CERTIFICATE_KEY: an Ed25519 private key in PEM, as
 * `openssl genpkey -algorithm ed25519` makes it, with `\n` for its line breaks if need be.
 * Undefined when it isn't set, and the site gives no certificates; throws when it's set to
 * something else.
 */
export function certificateKey(env: Record<string, string | undefined> = process.env): KeyObject | undefined {
  const pem = (env.CERTIFICATE_KEY ?? '').replace(/\\n/g, '\n').trim();
  if (!pem) return undefined;
  let key: KeyObject | undefined;
  try {
    key = createPrivateKey(pem);
  } catch {
    // Said below.
  }
  if (key?.asymmetricKeyType !== 'ed25519') {
    throw new Error(
      "CERTIFICATE_KEY isn't an Ed25519 private key in PEM. Make one with `openssl genpkey -algorithm ed25519`; see \"Certificates\" in the README.",
    );
  }
  return key;
}

/** The public half of the key, as a JSON Web Key named by its thumbprint (RFC 7638), which each signature names too. */
export function publicKey(key: KeyObject): CertificateKey {
  const x = String(createPublicKey(key).export({ format: 'jwk' }).x);
  // The thumbprint hashes the key's required members, in this order.
  const kid = createHash('sha256').update(JSON.stringify({ crv: 'Ed25519', kty: 'OKP', x })).digest('base64url');
  return { kty: 'OKP', crv: 'Ed25519', x, kid, alg: 'EdDSA', use: 'sig' };
}

/** The keys certificates are checked with, as the site publishes them: none when CERTIFICATE_KEY isn't set. */
export function publicKeys(env: Record<string, string | undefined> = process.env): CertificateKey[] {
  const key = certificateKey(env);
  return key ? [publicKey(key)] : [];
}

/** The certificate, signed with the key: a compact JWS (RFC 7515) with EdDSA (RFC 8037). */
export function signCertificate(certificate: Certificate, key: KeyObject): string {
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const input = `${part({ alg: 'EdDSA', kid: publicKey(key).kid })}.${part(certificate)}`;
  return `${input}.${sign(null, Buffer.from(input), key).toString('base64url')}`;
}

/** A new certificate for the attempt that passed a chapter's exam, signed, and not published yet. */
export function issueCertificate(config: SigningConfig, reader: User, chapter: string, covers: Covered, passed: Attempt, site: string): KeptCertificate {
  const certificate: Certificate = {
    id: certificateId(reader.id, chapter, config.secret),
    reader: { id: reader.id, login: reader.login, ...(reader.name && { name: reader.name }) },
    chapter,
    title: covers.title,
    lessons: covers.lessons,
    passed,
    issued: new Date().toISOString(),
    site,
  };
  return { id: certificate.id, jws: signCertificate(certificate, config.certificateKey), published: false };
}

/** Publishes a certificate: the site's bot writes it to the public certificates repository, as `certificates/<id>.json`. */
export async function publishCertificate(config: ExamConfig, kept: KeptCertificate, reader: User): Promise<void> {
  const certificate = readJws(kept.jws)?.payload as Certificate | undefined;
  if (!certificate) throw new Error(`The certificate ${kept.id} in the results of @${reader.login} isn't a JWS`);
  const file: CertificateFile = { certificate, jws: kept.jws };
  const token = await botToken(config.bot, config.certificates, 'write');
  const message = `${certificate.title[DEFAULT_LANG] ?? certificate.chapter}: certificate for @${reader.login}`;
  try {
    await writeFile(token, config.certificates, certificateFile(config.certificates, kept.id).path, `${JSON.stringify(file, null, 2)}\n`, message);
  } catch (error) {
    // Published already, as from another tab, or by a request that didn't get to note it in the results.
    if (!isConflict(error)) throw error;
  }
}

/** Unpublishes a certificate: the site's bot deletes its file, which the repository's history still has. */
export async function unpublishCertificate(config: ExamConfig, kept: KeptCertificate, reader: User): Promise<void> {
  const token = await botToken(config.bot, config.certificates, 'write');
  const { path } = certificateFile(config.certificates, kept.id);
  const file = await readFile(token, config.certificates, path);
  // Gone already.
  if (!file) return;
  await deleteFile(token, config.certificates, path, `Unpublish the certificate of @${reader.login}`, file.sha);
}
