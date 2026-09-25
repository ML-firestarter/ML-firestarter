/**
 * Every top-level chapter's badge in each language, for readers with its certificate to show on
 * their GitHub profile (lib/badge.ts): `/certificates/badges/foundations.svg`, and
 * `/pl/certificates/badges/foundations.svg` in Polish.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { badge } from '../lib/badge.ts';
import { getCourse } from '../lib/course.ts';
import { LANGS, localizeUrl } from '../lib/i18n.ts';
import { badgeUrl } from '../lib/paths.ts';
import { site } from '../site.config.ts';

export const getStaticPaths = (async () => {
  const courses = await Promise.all(LANGS.map((lang) => getCourse(lang)));
  return courses.flatMap((course) =>
    course.root.children.flatMap((node) =>
      node.kind === 'chapter'
        ? [{ params: { badge: localizeUrl(badgeUrl(node.path), course.lang).slice(1, -'.svg'.length) }, props: { title: node.title } }]
        : [],
    ),
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(badge(site.title, props.title), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
