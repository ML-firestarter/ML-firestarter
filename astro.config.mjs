// @ts-check
import { fileURLToPath } from 'node:url';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { dropLeadingH1, githubAlerts, katexMath, localizedFootnotes, noteLinks } from './src/lib/markdown.ts';
import { NOTES_DIR } from './src/lib/paths.ts';

export default defineConfig({
  // Netlify sets URL to the site's address during builds; pages use it to link their translations.
  site: process.env.URL || undefined,
  markdown: {
    processor: satteri({
      features: { math: true },
      mdastPlugins: [katexMath],
      hastPlugins: [
        dropLeadingH1,
        githubAlerts,
        localizedFootnotes,
        noteLinks(fileURLToPath(new URL(`./${NOTES_DIR}/`, import.meta.url))),
      ],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
