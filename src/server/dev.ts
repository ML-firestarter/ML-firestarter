/**
 * Runs the site's API (api.ts) inside `astro dev`, so signing in and comments work locally.
 * Its settings come from `.env`, as they come from Netlify's environment variables in production.
 */
import { Buffer } from 'node:buffer';
import { existsSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

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
