import { existsSync } from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { EXAMS_DIR, EXERCISES_DIR, NOTES_DIR, TESTS_DIR } from './lib/paths.ts';

/** Every Markdown file in notes/ is a lesson; front matter is optional. */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: `./${NOTES_DIR}` }),
  schema: z.object({
    title: z.coerce.string().optional(),
    description: z.coerce.string().optional(),
    draft: z.boolean().optional(),
  }),
});

/** Every Markdown file in tests/ is the test for the lesson at the same path in notes/. */
const tests = defineCollection({
  loader: glob({ pattern: '**/*.md', base: `./${TESTS_DIR}` }),
  schema: z.object({
    description: z.coerce.string().optional(),
    draft: z.boolean().optional(),
  }),
});

/**
 * Every Markdown file in exams/ holds exam questions on the lesson at the same path in notes/.
 * The folder is a copy of a private repository and is often missing; the site then has no exams.
 */
const exams = defineCollection({
  loader: existsSync(`./${EXAMS_DIR}`) ? glob({ pattern: '**/*.md', base: `./${EXAMS_DIR}` }) : () => [],
  schema: z.object({
    draft: z.boolean().optional(),
  }),
});

/**
 * Every folder in exercises/ with a task.md is an exercise on the lesson whose path its parent
 * folder has: task.md says what to do, next to the code (starter.py, solution.py, checks.py).
 */
const exercises = defineCollection({
  loader: glob({ pattern: '**/task*.md', base: `./${EXERCISES_DIR}` }),
  schema: z.object({
    title: z.coerce.string().optional(),
    description: z.coerce.string().optional(),
    /** What the input box holds at first, for exercises whose code reads input(). */
    input: z.coerce.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { notes, tests, exams, exercises };
