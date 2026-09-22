// @ts-check
import { fileURLToPath } from 'node:url';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { dropLeadingH1, githubAlerts, katexMath, noteLinks } from './src/lib/markdown.ts';
import { NOTES_DIR } from './src/lib/paths.ts';

export default defineConfig({
  markdown: {
    processor: satteri({
      features: { math: true },
      mdastPlugins: [katexMath],
      hastPlugins: [
        dropLeadingH1,
        githubAlerts,
        noteLinks(fileURLToPath(new URL(`./${NOTES_DIR}/`, import.meta.url))),
      ],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
