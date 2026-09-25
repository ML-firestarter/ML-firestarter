/**
 * Issuing certificates (lib/certificates.ts). The site's bot writes a reader's certificate to the
 * public certificates repository, then notes its id in their results, so each reader gets one
 * certificate for each exam they pass, however often they ask for it.
 */
import { createHmac } from 'node:crypto';
import { certificateFile, type Certificate, type Covered } from '../lib/certificates.ts';
import type { Attempt } from '../lib/exams.ts';
import { DEFAULT_LANG } from '../lib/i18n.ts';
import { recordCertificate, type ExamConfig } from './exams.ts';
import { botToken, isConflict, writeFile } from './github.ts';
import type { User } from './session.ts';

/** Id of a reader's certificate for a chapter: the same every time, so asking twice at once still makes one certificate. */
export function certificateId(reader: number, chapter: string, secret: string): string {
  return createHmac('sha256', secret).update(`certificate\n${reader}\n${chapter}`).digest('hex').slice(0, 16);
}

/**
 * Issues the reader's certificate for a chapter whose exam they passed with `passed`, and gives
 * its id. The file comes first: when noting it in the results fails, asking again finds the file
 * already written and notes it then.
 */
export async function issueCertificate(
  config: ExamConfig,
  reader: User,
  chapter: string,
  covers: Covered,
  passed: Attempt,
  /** Address of the site issuing it. */
  site: string,
): Promise<string> {
  const id = certificateId(reader.id, chapter, config.secret);
  const certificate: Certificate = {
    id,
    reader: { id: reader.id, login: reader.login, ...(reader.name && { name: reader.name }) },
    chapter,
    title: covers.title,
    lessons: covers.lessons,
    passed,
    issued: new Date().toISOString(),
    site,
  };
  const token = await botToken(config.bot, config.certificates, 'write');
  const message = `${covers.title[DEFAULT_LANG] ?? chapter}: certificate for @${reader.login}`;
  try {
    await writeFile(token, config.certificates, certificateFile(config.certificates, id).path, `${JSON.stringify(certificate, null, 2)}\n`, message);
  } catch (error) {
    // Written already, by a request that didn't get to note it in the results.
    if (!isConflict(error)) throw error;
  }
  return recordCertificate(config, reader, chapter, id);
}
