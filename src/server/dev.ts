/**
 * Runs the site's API (api.ts) inside `astro dev`, so signing in and comments work locally.
 * Its settings come from `.env`, as they come from Netlify's environment variables in production.
 * It also shows the certificate page at each certificate's address, as netlify.toml has Netlify do.
 */
import { Buffer } from 'node:buffer';
import { existsSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { DEFAULT_LANG, LANGS } from '../lib/i18n.ts';
import { CERTIFICATES_PATH } from '../lib/paths.ts';

/**
 * A certificate's address in any language, like `/certificates/3f9a1c0e7b2d4a55/` or
 * `/pl/certificates/3f9a1c0e7b2d4a55/`. Names with a dot are files, like the public keys, which
 * are served as they are, as on Netlify.
 */
const CERTIFICATE = new RegExp(`^(/(?:${LANGS.filter((lang) => lang !== DEFAULT_LANG).join('|')}))?${CERTIFICATES_PATH}[^/?#.]+/?(?:\\?.*)?$`);

export function devApi(): AstroIntegration {
  let env = '.env';
  return {
    name: 'ml-firestarter:dev-api',
    hooks: {
      'astro:config:done': ({ config }) => {
        env = fileURLToPath(new URL('.env', config.root));
      },
      'astro:server:setup': ({ server }) => {
        // Variables already set in the shell win over the file.
        if (existsSync(env)) process.loadEnvFile(env);
        server.middlewares.use((req, _res, next) => {
          const certificate = CERTIFICATE.exec(req.url ?? '');
          if (certificate) req.url = `${certificate[1] ?? ''}${CERTIFICATES_PATH}`;
          next();
        });
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next();
          // Loaded on every request, so changes to the API apply without restarting.
          const handle = async (request: Request): Promise<Response> => (await server.ssrLoadModule('/src/server/api.ts')).handle(request);
          serve(req, res, handle).catch(next);
        });
      },
    },
  };
}

/** Answers a Node.js request with a handler that takes and returns web requests, like Netlify functions. */
async function serve(req: IncomingMessage, res: ServerResponse, handle: (request: Request) => Promise<Response>) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined || name.startsWith(':')) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item);
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const response = await handle(new Request(url, { method: req.method, headers, body: hasBody ? Buffer.concat(chunks).toString() : undefined }));

  res.statusCode = response.status;
  response.headers.forEach((value, name) => {
    if (name !== 'set-cookie') res.setHeader(name, value);
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) res.setHeader('Set-Cookie', cookies);
  res.end(Buffer.from(await response.arrayBuffer()));
}
