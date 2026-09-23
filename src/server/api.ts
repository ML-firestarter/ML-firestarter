/**
 * The site's API: signing in with GitHub, and readers' comments on the notes (lib/comments.ts).
 * Runs as a Netlify function (netlify/functions/api.ts) and inside `astro dev` (server/dev.ts).
 *
 *   GET  /api/auth/login?return=/page/  sends the reader to GitHub to sign in
 *   GET  /api/auth/callback             where GitHub sends them back; signs them in
 *   POST /api/auth/logout               signs the reader out
 *   GET  /api/comments                  open comments, for signed-in readers
 *   POST /api/comments                  posts a comment as an issue, as the reader
 *
 * Needs the GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET of the site's GitHub App and a
 * SESSION_SECRET; see "Comments" in the README.
 */
import { Buffer } from 'node:buffer';
import { CONTEXT, LIMITS, commentFrom, hasComments, issueFor, type NewComment } from '../lib/comments.ts';
import { isLang } from '../lib/i18n.ts';
import { NOTES_DIR, noteUrl } from '../lib/paths.ts';
import { site } from '../site.config.ts';
import { GitHubError, createIssue, exchangeCode, getUser, listIssues, refreshTokens, revokeToken } from './github.ts';
import {
  LOGIN_COOKIE,
  SESSION_COOKIE,
  cookie,
  readCookie,
  seal,
  sessionCookies,
  signOutCookies,
  unseal,
  type Session,
} from './session.ts';

interface Config {
  clientId: string;
  clientSecret: string;
  /** Encrypts the session cookies. */
  secret: string;
  /** Repository that gets the comments, as `owner/name`. */
  repo: string;
}

interface Context {
  request: Request;
  url: URL;
  config: Config;
  /** Whether cookies are HTTPS-only: everywhere but on http://localhost. */
  secure: boolean;
}

/** The request alone, before the API's settings are known. */
type Asked = Pick<Context, 'request' | 'url'>;

/** A sign-in in progress, kept in the `mlw_login` cookie. */
interface Login {
  state: string;
  verifier: string;
  /** Page to come back to, as an absolute URL on this site. */
  returnTo: string;
  at: number;
}

const LOGIN_TIME = 10 * 60 * 1000;

/** Largest request body, in characters: a comment with all its fields full fits easily. */
const MAX_BODY = 20_000;

type Handler = (context: Context) => Promise<Response>;

const routes = new Map<string, Record<string, Handler>>([
  ['/api/auth/login', { GET: login }],
  ['/api/auth/callback', { GET: callback }],
  ['/api/auth/logout', { POST: logout }],
  ['/api/comments', { GET: listComments, POST: postComment }],
]);

export async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const route = site.comments.length > 0 ? routes.get(url.pathname) : undefined;
  if (!route) return json({ error: 'not-found', message: 'No such API.' }, 404);
  if (!Object.hasOwn(route, request.method)) {
    return json({ error: 'method-not-allowed', message: 'Method not allowed.' }, 405, [], { Allow: Object.keys(route).join(', ') });
  }

  const config = readConfig();
  if (Array.isArray(config)) {
    const message = `Signing in with GitHub isn't set up on this site yet: the server needs ${config.join(', ')}. See "Comments" in the README.`;
    return problem({ request, url }, 503, 'not-configured', message);
  }
  const context: Context = { request, url, config, secure: url.protocol === 'https:' };
  try {
    return await route[request.method](context);
  } catch (error) {
    return fromError(error, context);
  }
}

/** The API's settings, or the names of the ones that are missing. */
function readConfig(): Config | string[] {
  const { GITHUB_CLIENT_ID: clientId = '', GITHUB_CLIENT_SECRET: clientSecret = '', SESSION_SECRET: secret = '' } = process.env;
  const missing = [];
  if (!clientId) missing.push('GITHUB_CLIENT_ID');
  if (!clientSecret) missing.push('GITHUB_CLIENT_SECRET');
  if (secret.length < 32) missing.push('SESSION_SECRET (32 characters or more)');
  if (missing.length > 0) return missing;
  const repo = new URL(site.repo).pathname.replace(/^\/|\/$|\.git$/g, '');
  return { clientId, clientSecret, secret, repo };
}

async function login({ url, config, secure }: Context): Promise<Response> {
  const state = randomToken();
  const verifier = randomToken();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(url),
    state,
    code_challenge: Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))).toString('base64url'),
    code_challenge_method: 'S256',
  }).toString();
  const started: Login = { state, verifier, returnTo: returnUrl(url.searchParams.get('return'), url.origin), at: Date.now() };
  const sealed = await seal(started, LOGIN_COOKIE, config.secret);
  return redirect(authorize.href, [cookie(LOGIN_COOKIE, sealed, { path: '/api/auth/', maxAge: LOGIN_TIME / 1000, secure })]);
}

async function callback({ request, url, config, secure }: Context): Promise<Response> {
  const started = await unseal<Login>(readCookie(request, LOGIN_COOKIE), LOGIN_COOKIE, config.secret);
  const cookies = [cookie(LOGIN_COOKIE, '', { path: '/api/auth/', maxAge: 0, secure })];
  if (!started || Date.now() - started.at > LOGIN_TIME) {
    return page(400, 'Signing in took too long, or started in another browser. Please try again.', url.origin, cookies);
  }

  const error = url.searchParams.get('error');
  // The reader chose not to sign in.
  if (error === 'access_denied') return redirect(started.returnTo, cookies);
  if (error) return page(400, `GitHub couldn't sign you in: ${url.searchParams.get('error_description') ?? error}`, started.returnTo, cookies);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || !sameText(state, started.state)) {
    return page(400, "This sign-in link isn't valid. Please try again.", started.returnTo, cookies);
  }

  try {
    const tokens = await exchangeCode(config, code, callbackUrl(url), started.verifier);
    const session: Session = { user: await getUser(tokens.token), ...tokens };
    cookies.push(...(await sessionCookies(session, config.secret, secure)));
  } catch (error) {
    if (!(error instanceof GitHubError)) throw error;
    return page(502, `GitHub couldn't sign you in: ${error.message}`, started.returnTo, cookies);
  }
  return redirect(started.returnTo, cookies);
}

async function logout({ request, url, config, secure }: Context): Promise<Response> {
  if (request.headers.get('origin') !== url.origin) return json({ error: 'forbidden', message: 'Cross-site request.' }, 403);
  const session = await unseal<Session>(readCookie(request, SESSION_COOKIE), SESSION_COOKIE, config.secret);
  // Worth trying, but the reader is signed out either way.
  if (session) await revokeToken(config, session.token).catch(() => {});
  return json(null, 204, signOutCookies(secure));
}

async function listComments(context: Context): Promise<Response> {
  const auth = await signedIn(context);
  if (!auth) return signedOut(context);
  const issues = await listIssues(auth.session.token, context.config.repo);
  const comments = issues.map((issue) => commentFrom(issue)).filter((comment) => comment !== undefined);
  return json({ comments }, 200, auth.cookies);
}

async function postComment(context: Context): Promise<Response> {
  const { request, url, config } = context;
  if (request.headers.get('origin') !== url.origin) return json({ error: 'forbidden', message: 'Cross-site request.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return json({ error: 'invalid', message: 'Send the comment as JSON.' }, 415);
  }
  const auth = await signedIn(context);
  if (!auth) return signedOut(context);

  const body = await request.text();
  if (body.length > MAX_BODY) return json({ error: 'invalid', message: 'The comment is too long.' }, 413);
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return json({ error: 'invalid', message: 'Send the comment as JSON.' }, 400);
  }
  const comment = readComment(data);
  if (typeof comment === 'string') return json({ error: 'invalid', message: comment }, 400);

  const issue = await createIssue(auth.session.token, config.repo, issueFor(comment, url.origin));
  return json({ comment: commentFrom(issue) }, 201, auth.cookies);
}

/** The new comment in a request, or why it can't be posted. */
function readComment(data: unknown): NewComment | string {
  if (!isRecord(data) || !isRecord(data.quote)) return 'Send the comment as JSON.';
  const file = text(data.file, 300);
  const path = text(data.path, 300);
  const lang = text(data.lang, 10);
  const title = text(data.title, 200);
  const exact = text(data.quote.exact, LIMITS.quote);
  const prefix = text(data.quote.prefix, 2 * CONTEXT);
  const suffix = text(data.quote.suffix, 2 * CONTEXT);
  const comment = text(data.comment ?? '', LIMITS.comment);
  const suggestion = text(data.suggestion ?? '', LIMITS.suggestion);
  if (
    file === undefined ||
    path === undefined ||
    lang === undefined ||
    title === undefined ||
    exact === undefined ||
    prefix === undefined ||
    suffix === undefined ||
    comment === undefined ||
    suggestion === undefined
  ) {
    return 'A field is missing or too long.';
  }

  const parts = file.split('/');
  const isNote = parts[0] === NOTES_DIR && file.endsWith('.md') && !file.includes('\\') && !parts.some((part) => ['', '.', '..'].includes(part));
  if (!isNote || noteUrl(parts.slice(1).join('/')) !== path || !hasComments(path)) return "This page doesn't take comments.";
  if (!isLang(lang)) return 'Unknown language.';
  if (!exact.trim()) return 'Select a passage to comment on.';
  const change = suggestion.trim() && suggestion !== exact ? suggestion : undefined;
  if (!comment.trim() && !change) return 'Write a comment or suggest a change.';

  return { file, path, lang, title: title.trim() || path, quote: { exact, prefix, suffix }, comment: comment.trim(), suggestion: change };
}

/** The reader's session, with new tokens when the old ones ran out; undefined when they're signed out. */
async function signedIn({ request, config, secure }: Context): Promise<{ session: Session; cookies: string[] } | undefined> {
  const session = await unseal<Session>(readCookie(request, SESSION_COOKIE), SESSION_COOKIE, config.secret);
  if (!session) return undefined;
  const now = Date.now();
  if (session.expires === undefined || session.expires > now + 60_000) return { session, cookies: [] };
  if (!session.refresh || (session.refreshExpires ?? Infinity) <= now) return undefined;
  try {
    const renewed: Session = { user: session.user, ...(await refreshTokens(config, session.refresh)) };
    return { session: renewed, cookies: await sessionCookies(renewed, config.secret, secure) };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 401) return undefined;
    throw error;
  }
}

function signedOut({ secure }: Context): Response {
  return json({ error: 'signed-out', message: 'Sign in with GitHub first.' }, 401, signOutCookies(secure));
}

function fromError(error: unknown, context: Context): Response {
  if (!(error instanceof GitHubError)) {
    console.error(error);
    return problem(context, 500, 'server', 'Something went wrong on the site.');
  }
  if (error.status === 401 && !isPage(context)) return signedOut(context);
  if (error.rateLimited) return problem(context, 429, 'rate-limited', 'GitHub is limiting requests right now. Please try again in a few minutes.');
  return problem(context, 502, 'github', `GitHub answered: ${error.message}`);
}

/** Whether the reader opened the API in the browser, as with signing in, rather than a page script calling it. */
function isPage({ request, url }: Asked): boolean {
  return request.method === 'GET' && url.pathname.startsWith('/api/auth/');
}

/** An error, as a page or as JSON, depending on who asked. */
function problem(asked: Asked, status: number, error: string, message: string): Response {
  if (!isPage(asked)) return json({ error, message }, status);
  return page(status, message, returnUrl(asked.url.searchParams.get('return'), asked.url.origin));
}

function json(data: unknown, status = 200, cookies: string[] = [], extra: Record<string, string> = {}): Response {
  const headers = responseHeaders(cookies, { 'Content-Type': 'application/json; charset=utf-8', ...extra });
  return new Response(data === null ? null : JSON.stringify(data), { status, headers });
}

function redirect(location: string, cookies: string[]): Response {
  return new Response(null, { status: 303, headers: responseHeaders(cookies, { Location: location }) });
}

/** A plain page for when signing in fails, with a link back. */
function page(status: number, message: string, back: string, cookies: string[] = []): Response {
  const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Signing in didn't work · ${escapeHtml(site.title)}</title>
<body style="font: 1.0625rem/1.6 system-ui, sans-serif; max-width: 36rem; margin: 4rem auto; padding: 0 1rem">
<h1 style="font-size: 1.5rem">Signing in didn't work</h1>
<p>${escapeHtml(message)}</p>
<p><a href="${escapeHtml(back)}">Go back</a></p>
</body>
</html>
`;
  return new Response(html, { status, headers: responseHeaders(cookies, { 'Content-Type': 'text/html; charset=utf-8' }) });
}

function responseHeaders(cookies: string[], extra: Record<string, string>): Headers {
  const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  for (const value of cookies) headers.append('Set-Cookie', value);
  return headers;
}

/** Where GitHub sends the reader back to; each address the site runs at has to be listed in the GitHub App. */
function callbackUrl(url: URL): string {
  return new URL('/api/auth/callback', url.origin).href;
}

/** The page to come back to after signing in: an address on this site, or the home page. */
function returnUrl(value: string | null, origin: string): string {
  try {
    const target = new URL(value ?? '/', origin);
    if (target.origin === origin) return target.href;
  } catch {
    // Not an address.
  }
  return new URL('/', origin).href;
}

function randomToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
}

/** Compares secrets in the same time whatever they hold, so the time taken doesn't give them away. */
function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

function text(value: unknown, max: number): string | undefined {
  return typeof value === 'string' && value.length <= max ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
