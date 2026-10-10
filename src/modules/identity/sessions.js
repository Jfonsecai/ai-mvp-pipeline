// COMP-004 Identity and Access - session resolution (IF-014, ADR-007, TB-3).
//
// FOUNDATION SCOPE: this file only *resolves* an existing session so every other component can
// learn "who is calling" in one way. Creating sessions (sign-up, sign-in), ending them (sign-out),
// password hashing and the session endpoints belong to US-001, US-002, US-003 and US-034.
//
// Token convention (P05-ASM-007): the cookie carries a random token of at least 32 bytes
// (base64url); the database stores only its SHA-256 hash, so reading the table does not reveal
// usable cookies. DATA_MODEL 5.2 holds the resolution rule implemented below.
import { createHash, randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'vetcare_session';

/** A new opaque session token for the cookie (used by the sign-up / sign-in stories). */
export function generateSessionToken() {
  return randomBytes(32).toString('base64url');
}

/** SHA-256 of the cookie value: the `session.token_hash` primary key (32 bytes). */
export function hashSessionToken(token) {
  return createHash('sha256').update(token, 'utf8').digest();
}

/** Reads one cookie from a Cookie header without a dependency. Returns undefined if absent. */
export function readCookie(header, name) {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      const value = part.slice(index + 1).trim();
      return value === '' ? undefined : value;
    }
  }
  return undefined;
}

/**
 * Resolves a cookie token to the session state (IF-014).
 *  - none:    no token, unknown token, or a session ended by sign-out  -> UNAUTHENTICATED
 *  - expired: not ended, but past its idle or absolute expiry          -> SESSION_EXPIRED
 *  - active:  valid; its last use is updated (NFR-005, one write per authenticated request)
 *
 * @param {{ query: (text: string, params?: unknown[]) => Promise<{ rows: any[] }> }} db
 * @param {string | undefined} token
 * @param {Date} now
 * @param {{ idleMinutes: number }} limits
 * @returns {Promise<{ state: 'none' } | { state: 'expired' } | { state: 'active', accountId: string, accountType: 'owner' | 'provider' }>}
 */
export async function resolveSession(db, token, now, { idleMinutes }) {
  if (!token) return { state: 'none' };

  const { rows } = await db.query(
    `SELECT s.account_id, a.account_type, s.last_seen_at, s.absolute_expires_at, s.ended_at
       FROM session s
       JOIN account a ON a.id = s.account_id
      WHERE s.token_hash = $1`,
    [hashSessionToken(token)],
  );
  const session = rows[0];
  if (!session || session.ended_at) return { state: 'none' };

  const idleDeadline = new Date(session.last_seen_at.getTime() + idleMinutes * 60_000);
  if (now >= session.absolute_expires_at || now >= idleDeadline) return { state: 'expired' };

  await db.query('UPDATE session SET last_seen_at = $2 WHERE token_hash = $1', [hashSessionToken(token), now]);
  return { state: 'active', accountId: session.account_id, accountType: session.account_type };
}
