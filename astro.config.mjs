// @ts-check
import { fileURLToPath } from 'node:url';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { dropLeadingH1, githubAlerts, katexMath, localizedFootnotes, noteLinks, quizzes, runnableCode } from './src/lib/markdown.ts';
import { EXAMS_DIR, EXERCISES_DIR, NOTES_DIR, TESTS_DIR } from './src/lib/paths.ts';
import { devApi } from './src/server/dev.ts';
import { examQuestions } from './src/server/exam-questions.ts';

/** Absolute path of a folder in the project. */
const folder = (/** @type {string} */ dir) => fileURLToPath(new URL(`./${dir}/`, import.meta.url));

export default defineConfig({
  // Netlify sets URL to the site's address during builds; pages use it to link their translations.
  site: process.env.URL || undefined,
  integrations: [
    // The API for signing in, comments and exams; Netlify runs it as a function (netlify/functions/api.ts).
    devApi(),
    // Brings the exam questions, kept in a private repository, into production builds.
    examQuestions(),
  ],
  markdown: {
    processor: satteri({
      features: { math: true },
      mdastPlugins: [katexMath],
      hastPlugins: [
        dropLeadingH1,
        githubAlerts,
        localizedFootnotes,
        noteLinks({ notes: folder(NOTES_DIR), tests: folder(TESTS_DIR), exercises: folder(EXERCISES_DIR) }),
        // Turns tests/ and exams/ into forms; runs last so answers and explanations get the plugins above.
        quizzes({ tests: folder(TESTS_DIR), exams: folder(EXAMS_DIR) }),
      ],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [runnableCode],
    },
  },
  vite: {
    // The Python worker (src/scripts/python.worker.ts) imports Pyodide, which needs a module worker.
    worker: { format: 'es' },
  },
});
