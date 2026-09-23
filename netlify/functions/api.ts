/**
 * The site's API (src/server/api.ts) as a Netlify function. Netlify serves it at /api/*
 * next to the static pages; see "Comments" in the README for its settings.
 */
import { handle } from '../../src/server/api.ts';

export default handle;

export const config = { path: '/api/*' };
