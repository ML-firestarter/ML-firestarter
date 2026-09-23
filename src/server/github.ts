/**
 * The GitHub APIs the site uses. Readers' requests are made with their own token, so GitHub
 * shows the issues as theirs and counts the requests against their own rate limit.
 */
import type { IssueData } from '../lib/comments.ts';
import type { User } from './session.ts';

const API = 'https://api.github.com';
const HEADERS = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'ml-workout' };

export class GitHubError extends Error {
  /** HTTP status GitHub answered with; 401 means the token is no good. */
  readonly status: number;
  /** Whether GitHub refused because of its rate limits. */
  readonly rateLimited: boolean;

  constructor(status: number, message: string, rateLimited = false) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
    this.rateLimited = rateLimited;
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

/** Open issues and pull requests of `repo` (`owner/name`), newest first; up to 500, plenty for a notes repository. */
export async function listIssues(token: string, repo: string): Promise<IssueData[]> {
  const issues: IssueData[] = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await api<IssueData[]>(token, `/repos/${repo}/issues?state=open&sort=created&direction=desc&per_page=100&page=${page}`);
    issues.push(...batch);
    if (batch.length < 100) break;
  }
  return issues;
}

export function createIssue(token: string, repo: string, issue: { title: string; body: string }): Promise<IssueData> {
  return api<IssueData>(token, `/repos/${repo}/issues`, { method: 'POST', body: JSON.stringify(issue) });
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

async function api<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await send(API + path, { ...init, headers: { ...HEADERS, Authorization: `Bearer ${token}` } });
  if (!response.ok) throw await failure(response);
  return (await response.json()) as T;
}

async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new GitHubError(502, "GitHub didn't answer");
  }
}

async function failure(response: Response): Promise<GitHubError> {
  const data: { message?: string } = await response.json().catch(() => ({}));
  const message = data.message ?? `status ${response.status}`;
  const rateLimited =
    response.status === 429 ||
    (response.status === 403 && (response.headers.get('x-ratelimit-remaining') === '0' || /rate limit/i.test(message)));
  return new GitHubError(response.status, message, rateLimited);
}
