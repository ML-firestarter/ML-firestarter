/**
 * Signed-in readers, remembered in cookies so the site needs no database.
 *
 * `mlw_session` holds the reader's GitHub tokens, encrypted with SESSION_SECRET (AES-256-GCM),
 * and is only sent to the API. `mlw_user` holds the reader's public profile, so pages can show
 * who is signed in. `mlw_login` remembers a sign-in in progress for ten minutes.
 */
import { Buffer } from 'node:buffer';

export const SESSION_COOKIE = 'mlw_session';
export const USER_COOKIE = 'mlw_user';
export const LOGIN_COOKIE = 'mlw_login';

/** Longest a reader stays signed in, in seconds. GitHub's refresh tokens last about six months. */
const MAX_SESSION = 180 * 24 * 60 * 60;

export interface User {
  id: number;
  login: string;
  avatar: string;
  name?: string;
}

export interface Session {
  user: User;
  /** GitHub user access token, and when it runs out (ms since 1970), if it does. */
  token: string;
  expires?: number;
  /** Token that gets a new access token once it runs out, and when it runs out itself. */
  refresh?: string;
  refreshExpires?: number;
}

const encoder = new TextEncoder();
const keys = new Map<string, Promise<CryptoKey>>();

/** The encryption key made from SESSION_SECRET, which is long and random. */
function key(secret: string): Promise<CryptoKey> {
  let promise = keys.get(secret);
  if (!promise) {
    promise = crypto.subtle
      .digest('SHA-256', encoder.encode(secret))
      .then((raw) => crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']));
    keys.set(secret, promise);
  }
  return promise;
}

/** `value` as encrypted JSON for the cookie `name`: it can't be read, changed or used as another cookie. */
export async function seal(value: unknown, name: string, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const params = { name: 'AES-GCM', iv, additionalData: encoder.encode(name) };
  const data = await crypto.subtle.encrypt(params, await key(secret), encoder.encode(JSON.stringify(value)));
  return Buffer.concat([iv, new Uint8Array(data)]).toString('base64url');
}

/** What `seal` encrypted, or undefined when the cookie is missing, changed or made with another secret. */
export async function unseal<T>(sealed: string | undefined, name: string, secret: string): Promise<T | undefined> {
  if (!sealed) return undefined;
  try {
    const bytes = new Uint8Array(Buffer.from(sealed, 'base64url'));
    const params = { name: 'AES-GCM', iv: bytes.slice(0, 12), additionalData: encoder.encode(name) };
    const data = await crypto.subtle.decrypt(params, await key(secret), bytes.slice(12));
    return JSON.parse(new TextDecoder().decode(data)) as T;
  } catch {
    return undefined;
  }
}

export function readCookie(request: Request, name: string): string | undefined {
  for (const pair of (request.headers.get('cookie') ?? '').split(';')) {
    const [key, ...value] = pair.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}

interface CookieOptions {
  path: string;
  /** Seconds; 0 deletes the cookie. */
  maxAge: number;
  /** Whether pages' scripts can't read it; true unless said otherwise. */
  httpOnly?: boolean;
  /** Whether it's only sent over HTTPS: everywhere but on http://localhost. */
  secure: boolean;
}

/** A `Set-Cookie` header. */
export function cookie(name: string, value: string, { path, maxAge, httpOnly = true, secure }: CookieOptions): string {
  const attributes = [`Path=${path}`, `Max-Age=${Math.max(0, Math.floor(maxAge))}`, 'SameSite=Lax'];
  if (httpOnly) attributes.push('HttpOnly');
  if (secure) attributes.push('Secure');
  return [`${name}=${value}`, ...attributes].join('; ');
}

/** Cookies that sign the reader in, or keep them signed in with new tokens. */
export async function sessionCookies(session: Session, secret: string, secure: boolean): Promise<string[]> {
  const until = session.refreshExpires ?? session.expires;
  const maxAge = until === undefined ? MAX_SESSION : Math.min((until - Date.now()) / 1000, MAX_SESSION);
  const { login, avatar, name } = session.user;
  return [
    cookie(SESSION_COOKIE, await seal(session, SESSION_COOKIE, secret), { path: '/api', maxAge, secure }),
    cookie(USER_COOKIE, encodeURIComponent(JSON.stringify({ login, avatar, name })), { path: '/', maxAge, httpOnly: false, secure }),
  ];
}

/** Cookies that sign the reader out. */
export function signOutCookies(secure: boolean): string[] {
  return [
    cookie(SESSION_COOKIE, '', { path: '/api', maxAge: 0, secure }),
    cookie(USER_COOKIE, '', { path: '/', maxAge: 0, httpOnly: false, secure }),
  ];
}
