/**
 * The reader signed in with GitHub, if any, and the account button in the top bar. Signing in
 * happens in the API (src/server/api.ts), which leaves the reader's public profile in the
 * `mlw_user` cookie for pages to read.
 */

export interface Reader {
  login: string;
  avatar: string;
  name?: string;
}

/** Comments loaded from the API, kept for a minute (scripts/comments.ts). */
export const COMMENTS_KEY = 'ml-workout:comments';

export function readReader(): Reader | undefined {
  const match = /(?:^|;\s*)mlw_user=([^;]+)/.exec(document.cookie);
  if (!match) return undefined;
  try {
    const reader: Partial<Reader> | null = JSON.parse(decodeURIComponent(match[1]));
    if (typeof reader?.login === 'string' && typeof reader.avatar === 'string') return reader as Reader;
  } catch {
    // Not a cookie the API wrote.
  }
  return undefined;
}

/** Address that signs the reader in and brings them back to where they are on the page. */
export function signInUrl(): string {
  return `/api/auth/login?return=${encodeURIComponent(location.pathname + location.search + location.hash)}`;
}

/** The reader's avatar at `size` CSS pixels, sharp on high-density screens. */
export function avatarUrl(avatar: string, size: number): string {
  try {
    const url = new URL(avatar);
    if (url.protocol !== 'https:') return '';
    url.searchParams.set('s', String(size * 2));
    return url.href;
  } catch {
    return '';
  }
}

export function paintAccount() {
  const reader = readReader();
  document.documentElement.toggleAttribute('data-signed-in', Boolean(reader));
  for (const img of document.querySelectorAll<HTMLImageElement>('[data-account-avatar]')) {
    const src = reader ? avatarUrl(reader.avatar, img.width) : '';
    if (src) img.src = src;
    else img.removeAttribute('src');
  }
  for (const el of document.querySelectorAll('[data-account-login]')) el.textContent = reader ? `@${reader.login}` : '';
}

async function signOut() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Offline: the page forgets the reader anyway.
  }
  document.cookie = 'mlw_user=; Path=/; Max-Age=0';
  try {
    sessionStorage.removeItem(COMMENTS_KEY);
  } catch {
    // Nothing kept.
  }
  location.reload();
}

export function setUpAccount() {
  paintAccount();

  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    // Come back to this spot, even if the address changed since the page was built.
    const signIn = target.closest<HTMLAnchorElement>('a[data-sign-in]');
    if (signIn) signIn.href = signInUrl();
    if (target.closest('[data-sign-out]')) signOut();
  });

  // The back button can bring back a page as it was before signing in or out.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) paintAccount();
  });
}
