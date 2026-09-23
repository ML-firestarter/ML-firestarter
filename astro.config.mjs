// @ts-check
import { fileURLToPath } from 'node:url';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { dropLeadingH1, githubAlerts, katexMath, localizedFootnotes, noteLinks, quizzes } from './src/lib/markdown.ts';
import { NOTES_DIR, TESTS_DIR } from './src/lib/paths.ts';
import { devApi } from './src/server/dev.ts';

/** Absolute path of a folder in the project. */
const folder = (/** @type {string} */ dir) => fileURLToPath(new URL(`./${dir}/`, import.meta.url));

export default defineConfig({
  // Netlify sets URL to the site's address during builds; pages use it to link their translations.
  site: process.env.URL || undefined,
  // The API for signing in and comments; Netlify runs it as a function (netlify/functions/api.ts).
  integrations: [devApi()],
  markdown: {
    processor: satteri({
      features: { math: true },
      mdastPlugins: [katexMath],
      hastPlugins: [
        dropLeadingH1,
        githubAlerts,
        localizedFootnotes,
        noteLinks({ notes: folder(NOTES_DIR), tests: folder(TESTS_DIR) }),
        // Turns tests/ into forms; runs last so answers and explanations get the plugins above.
        quizzes(folder(TESTS_DIR)),
      ],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
