/**
 * The public keys the site signs certificates with (server/certificates.ts), as a JSON Web Key
 * Set (RFC 7517), so that anyone can check a certificate's signature, as its page does. Empty
 * when the site is built without CERTIFICATE_KEY, as deploy previews are.
 */
import type { APIRoute } from 'astro';
import { publicKeys } from '../../server/certificates.ts';

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify({ keys: publicKeys() }, null, 2)}\n`, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
