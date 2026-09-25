/**
 * The GitHub APIs the site uses. Readers' requests are made with their own token, so GitHub
 * shows the issues as theirs and counts the requests against their own rate limit.
 *
 * The site's bot, a GitHub App of its own installed on the private repositories, reads the
 * exam questions and keeps readers' exam results, which readers' tokens can't reach.
 */
import { Buffer } from 'node:buffer';
import { createPrivateKey, sign } from 'node:crypto';
import type { PullData } from '../lib/comments.ts';
import type { User } from './session.ts';

const API = 'https://api.github.com';
const HEADERS = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'ml-firestarter' };

export class GitHubError extends Error {
  /** HTTP status GitHub answered with; 401 means the token is no good. */
  readonly status: number;
  /** Whether GitHub refused because of its rate limits. */
  readonly rateLimited: boolean;
  /** Whether GitHub refused the bot rather than the reader, so a 401 doesn't mean the reader is signed out. */
  readonly bot: boolean;

  constructor(status: number, message: string, rateLimited = false, bot = false) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
    this.rateLimited = rateLimited;
    this.bot = bot;
  }
}

export interface Tokens {
  token: string;
  /** When the tokens run out, in ms since 1970; GitHub Apps can turn this off. */
  expires?: number;
  refresh?: string;
  refreshExpires?: number;
}

interface App {
  clientId: string;
  clientSecret: string;
}

/** Trades the code GitHub sends back after signing in for the reader's tokens. */
export function exchangeCode(app: App, code: string, redirectUri: string, verifier: string): Promise<Tokens> {
  return requestTokens({ client_id: app.clientId, client_secret: app.clientSecret, code, redirect_uri: redirectUri, code_verifier: verifier });
}

/** New tokens for ones that ran out. A refresh token works only once. */
export function refreshTokens(app: App, refresh: string): Promise<Tokens> {
  return requestTokens({ client_id: app.clientId, client_secret: app.clientSecret, grant_type: 'refresh_token', refresh_token: refresh });
}

async function requestTokens(params: Record<string, string>): Promise<Tokens> {
  const response = await send('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'User-Agent': HEADERS['User-Agent'] },
    body: new URLSearchParams(params),
  });
  const data: Record<string, unknown> = await response.json().catch(() => ({}));
  // Refused codes and tokens come back as 200 OK with an `error`.
  if (typeof data.access_token !== 'string') {
    const message = data.error_description ?? data.error ?? `status ${response.status}`;
    throw new GitHubError(response.ok ? 401 : response.status, String(message));
  }
  const now = Date.now();
  const time = (seconds: unknown) => (typeof seconds === 'number' ? now + seconds * 1000 : undefined);
  return {
    token: data.access_token,
    expires: time(data.expires_in),
    refresh: typeof data.refresh_token === 'string' ? data.refresh_token : undefined,
    refreshExpires: time(data.refresh_token_expires_in),
  };
}

export async function getUser(token: string): Promise<User> {
  const user = await api<{ id: number; login: string; avatar_url: string; name?: string | null }>(token, '/user');
  return { id: user.id, login: user.login, avatar: user.avatar_url, name: user.name || undefined };
}

/**
 * Open pull requests of `repo` (`owner/name`), newest first; up to 300, plenty for a notes
 * repository. In a public repository, reading them needs no permission of the GitHub App.
 */
export async function listPulls(token: string, repo: string): Promise<PullData[]> {
  const pulls: PullData[] = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await api<PullData[]>(token, `/repos/${repo}/pulls?state=open&sort=created&direction=desc&per_page=100&page=${page}`);
    pulls.push(...batch);
    if (batch.length < 100) break;
  }
  return pulls;
}

export function createIssue(token: string, repo: string, issue: { title: string; body: string }): Promise<{ number: number; html_url: string }> {
  return api(token, `/repos/${repo}/issues`, { method: 'POST', body: JSON.stringify(issue) });
}

/** Revokes a reader's token, so a copied session cookie is useless once they sign out. */
export async function revokeToken(app: App, token: string): Promise<void> {
  const response = await send(`${API}/applications/${app.clientId}/token`, {
    method: 'DELETE',
    headers: { ...HEADERS, Authorization: `Basic ${btoa(`${app.clientId}:${app.clientSecret}`)}` },
    body: JSON.stringify({ access_token: token }),
  });
  if (!response.ok && response.status !== 404) throw await failure(response);
}

/** The site's bot: its GitHub App's ID and private key. */
export interface Bot {
  appId: string;
  /** In PEM, as GitHub gives it; `\n` for line breaks works too, for settings that take one line. */
  privateKey: string;
}

/** The bot's tokens, by app, repository and access, kept until they're about to run out. */
const botTokens = new Map<string, { token: string; expires: number }>();

/**
 * A token for the contents of one repository (`owner/name`) the bot is installed on. It lasts
 * an hour, and is used again until five minutes before it runs out.
 */
export async function botToken(bot: Bot, repo: string, access: 'read' | 'write'): Promise<string> {
  const id = `${bot.appId}:${repo}:${access}`;
  const kept = botTokens.get(id);
  if (kept && kept.expires - Date.now() > 5 * 60_000) return kept.token;

  const jwt = appToken(bot);
  const installation = await api<{ id: number }>(jwt, `/repos/${repo}/installation`, {}, true).catch((error: unknown) => {
    if (error instanceof GitHubError && error.status === 404) throw new GitHubError(404, `The site's bot isn't installed on ${repo}`, false, true);
    throw error;
  });
  const created = await api<{ token: string; expires_at: string }>(
    jwt,
    `/app/installations/${installation.id}/access_tokens`,
    { method: 'POST', body: JSON.stringify({ repositories: [repo.slice(repo.indexOf('/') + 1)], permissions: { contents: access } }) },
    true,
  );
  botTokens.set(id, { token: created.token, expires: Date.parse(created.expires_at) });
  return created.token;
}

/** A JSON Web Token that signs in as the GitHub App itself, for ten minutes at most. */
function appToken(bot: Bot): string {
  const now = Math.floor(Date.now() / 1000);
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  // A minute early, in case GitHub's clock is behind.
  const data = `${part({ alg: 'RS256', typ: 'JWT' })}.${part({ iat: now - 60, exp: now + 9 * 60, iss: bot.appId })}`;
  let key;
  try {
    key = createPrivateKey(bot.privateKey.replace(/\\n/g, '\n'));
  } catch {
    throw new GitHubError(401, "The bot's private key (BOT_APP_PRIVATE_KEY) isn't a key in PEM", false, true);
  }
  return `${data}.${sign('sha256', Buffer.from(data), key).toString('base64url')}`;
}

/** A text file of a repository, and its blob's SHA for replacing it; undefined when there's none. */
export async function readFile(token: string, repo: string, path: string): Promise<{ text: string; sha: string } | undefined> {
  try {
    const file = await api<{ content?: string; encoding?: string; sha: string }>(token, `/repos/${repo}/contents/${encodePath(path)}`, {}, true);
    if (file.encoding !== 'base64' || file.content === undefined) throw new GitHubError(502, `${path} is too large to read`, false, true);
    return { text: Buffer.from(file.content, 'base64').toString('utf8'), sha: file.sha };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return undefined;
    throw error;
  }
}

/**
 * Commits a text file to a repository's default branch. `sha` is the blob it replaces, or
 * undefined for a new file; GitHub refuses with 409 or 422 when the file is no longer that.
 */
export async function writeFile(token: string, repo: string, path: string, text: string, message: string, sha?: string): Promise<void> {
  const body = { message, content: Buffer.from(text).toString('base64'), sha };
  await api(token, `/repos/${repo}/contents/${encodePath(path)}`, { method: 'PUT', body: JSON.stringify(body) }, true);
}

/** Deletes a file from a repository's default branch; `sha` is the blob it deletes. */
export async function deleteFile(token: string, repo: string, path: string, message: string, sha: string): Promise<void> {
  await api(token, `/repos/${repo}/contents/${encodePath(path)}`, { method: 'DELETE', body: JSON.stringify({ message, sha }) }, true);
}

/** Whether a write failed because the file changed in the meantime, so it's worth reading it again. */
export function isConflict(error: unknown): boolean {
  return error instanceof GitHubError && (error.status === 409 || error.status === 422);
}

/** Every file on a repository's default branch: its path and blob SHA. */
export async function listFiles(token: string, repo: string): Promise<{ path: string; sha: string }[]> {
  const { default_branch: branch } = await api<{ default_branch: string }>(token, `/repos/${repo}`, {}, true);
  const tree = await api<{ tree: { path: string; type: string; sha: string }[]; truncated: boolean }>(
    token,
    `/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    {},
    true,
  );
  if (tree.truncated) throw new GitHubError(502, `${repo} has too many files to list at once`, false, true);
  return tree.tree.filter((entry) => entry.type === 'blob').map(({ path, sha }) => ({ path, sha }));
}

/** A file's contents, by its blob SHA. */
export async function readBlob(token: string, repo: string, sha: string): Promise<Buffer> {
  const blob = await api<{ content: string; encoding: string }>(token, `/repos/${repo}/git/blobs/${sha}`, {}, true);
  return Buffer.from(blob.content, blob.encoding === 'base64' ? 'base64' : 'utf8');
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function api<T>(token: string, path: string, init: RequestInit = {}, bot = false): Promise<T> {
  const response = await send(API + path, { ...init, headers: { ...HEADERS, Authorization: `Bearer ${token}` } }, bot);
  if (!response.ok) throw await failure(response, bot);
  return (await response.json()) as T;
}

async function send(url: string, init: RequestInit, bot = false): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new GitHubError(502, "GitHub didn't answer", false, bot);
  }
}

async function failure(response: Response, bot = false): Promise<GitHubError> {
  const data: { message?: string } = await response.json().catch(() => ({}));
  const message = data.message ?? `status ${response.status}`;
  const rateLimited =
    response.status === 429 ||
    (response.status === 403 && (response.headers.get('x-ratelimit-remaining') === '0' || /rate limit/i.test(message)));
  return new GitHubError(response.status, message, rateLimited, bot);
}
