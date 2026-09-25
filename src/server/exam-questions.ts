/**
 * Brings the exam questions into production builds. They're kept in a private repository
 * (`exams.repo` in site.config.ts): on Netlify, the site's bot downloads them into exams/ before
 * Astro reads the content, and once the pages are built, they're deleted along with Astro's
 * content cache, which holds their text. The answers they mark never reach Netlify's build cache
 * or the published site, only the sealed answer keys on the exam pages (server/exams.ts).
 *
 * Other builds use exams/ as it is: a clone of that repository, or nothing, for a site without
 * exams. Every command reads .env, so that local builds and `astro dev` mix up the answers and
 * seal the answer keys with its EXAM_SECRET, as production does with Netlify's. When exams/ has
 * questions, Astro's content cache goes first there too: it keeps the questions as an earlier run
 * rendered them, with their answers in the order that run's EXAM_SECRET, or none, gave them.
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { EXAMS_DIR } from '../lib/paths.ts';
import { site } from '../site.config.ts';
import { readExamConfig, repoName } from './exams.ts';
import { botToken, listFiles, readBlob, type Bot } from './github.ts';

/** The settings exams need; with none of them, the site is built without exams. */
const SETTINGS = ['EXAM_SECRET', 'BOT_APP_ID', 'BOT_APP_PRIVATE_KEY'];

export function examQuestions(): AstroIntegration {
  /** What to delete once the pages are built: set when this build downloaded the questions. */
  let downloaded: string[] = [];
  const cleanUp = () => {
    for (const file of downloaded) rmSync(file, { recursive: true, force: true });
    downloaded = [];
  };

  return {
    name: 'ml-firestarter:exam-questions',
    hooks: {
      'astro:config:setup': async ({ config, command, logger }) => {
        const root = fileURLToPath(config.root);
        // Variables already set, as on Netlify, win over the file.
        if (existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));
        const dir = path.join(root, EXAMS_DIR);
        if (command !== 'build' || process.env.NETLIFY !== 'true') {
          // So that the questions are rendered with this run's secret, and their translations agree.
          if (existsSync(dir)) for (const file of contentCache(config.cacheDir)) rmSync(file, { recursive: true, force: true });
          return;
        }

        // Only ever left over from a build that was stopped: never built from, so it can't be out of date.
        rmSync(dir, { recursive: true, force: true });
        if (!SETTINGS.some((name) => process.env[name])) {
          logger.info(`Building without exams: ${SETTINGS.join(', ')} aren't set for this deploy.`);
          return;
        }
        const exams = readExamConfig();
        if (Array.isArray(exams)) {
          throw new Error(`Exams are only partly set up for this deploy: the build needs ${exams.join(', ')} too. See "Exams" in the README.`);
        }

        // Also when the build fails, as it does when the questions have mistakes. The content cache
        // goes before the build too, so the questions are read afresh with this deploy's secret.
        downloaded = [dir, ...contentCache(config.cacheDir)];
        process.once('exit', cleanUp);
        for (const file of downloaded) rmSync(file, { recursive: true, force: true });
        const repo = repoName(site.exams.repo);
        const count = await download(exams.bot, repo, dir);
        logger.info(`Downloaded ${count} files of exam questions from ${repo}.`);
      },
      'astro:build:done': cleanUp,
    },
  };
}

/** Astro's content cache in `cacheDir`, which holds the text of the notes, tests and exam questions as they were rendered. */
function contentCache(cacheDir: URL): string[] {
  return ['data-store.json', 'data-store/'].map((name) => fileURLToPath(new URL(name, cacheDir)));
}

/** Downloads the Markdown files of `repo` into `dir`, and says how many there were. */
async function download(bot: Bot, repo: string, dir: string): Promise<number> {
  const token = await botToken(bot, repo, 'read');
  const files = (await listFiles(token, repo)).filter((file) => isQuestionFile(file.path));
  // A few at a time: GitHub counts too many requests at once as abuse.
  for (let i = 0; i < files.length; i += 8) {
    await Promise.all(
      files.slice(i, i + 8).map(async (file) => {
        const target = path.join(dir, ...file.path.split('/'));
        mkdirSync(path.dirname(target), { recursive: true });
        writeFileSync(target, await readBlob(token, repo, file.sha));
      }),
    );
  }
  return files.length;
}

/** Markdown files outside folders like .github/, with nothing in their paths that could lead out of exams/. */
function isQuestionFile(file: string): boolean {
  return /\.md$/i.test(file) && !file.includes('\\') && file.split('/').every((part) => part !== '' && !part.startsWith('.'));
}
