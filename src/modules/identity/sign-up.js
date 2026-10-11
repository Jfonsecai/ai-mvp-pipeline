// COMP-004 Identity — provider sign-up (IF-001, US-002).
import { Router } from 'express';
import argon2 from 'argon2';
import { Outcome } from '../../shared/outcomes.js';
import { withTransaction } from '../../shared/transaction.js';
import { createProviderProfile } from '../provider/profile.js';
import { generateSessionToken, hashSessionToken, SESSION_COOKIE_NAME } from './sessions.js';

const allowedFields = new Set(['name', 'email', 'password', 'providerType', 'address']);
const characterLength = (value) => [...value].length;

/** Per-module request validation convention (foundation warning W-2): fail closed, trim text,
 * and return CTR-001 field errors using the shared Outcome shape. Keep product rules in the module.
 */
export function validateProviderSignUp(input) {
  const fields = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  }

  for (const key of Object.keys(input)) {
    if (!allowedFields.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });
  }

  const nameTypeOk = input.name === undefined || typeof input.name === 'string';
  const emailTypeOk = input.email === undefined || typeof input.email === 'string';
  const passwordTypeOk = input.password === undefined || typeof input.password === 'string';
  const addressTypeOk = input.address === undefined || typeof input.address === 'string';
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const emailInput = typeof input.email === 'string' ? input.email.trim() : '';
  const email = emailInput.toLowerCase();
  const password = typeof input.password === 'string' ? input.password : '';
  const providerType = input.providerType;
  const addressInput = typeof input.address === 'string' ? input.address.trim() : '';
  const address = addressInput || undefined;

  if (!nameTypeOk) fields.push({ field: 'name', reason: 'INVALID_FORMAT' });
  else if (!name) fields.push({ field: 'name', reason: 'REQUIRED' });
  else if (characterLength(name) > 120) fields.push({ field: 'name', reason: 'TOO_LONG' });

  if (!emailTypeOk) fields.push({ field: 'email', reason: 'INVALID_FORMAT' });
  else if (!email) fields.push({ field: 'email', reason: 'REQUIRED' });
  else if (characterLength(email) > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.push({ field: 'email', reason: 'INVALID_FORMAT' });
  }

  if (!passwordTypeOk) fields.push({ field: 'password', reason: 'INVALID_FORMAT' });
  else if (!password) fields.push({ field: 'password', reason: 'REQUIRED' });
  else if (characterLength(password) < 8) fields.push({ field: 'password', reason: 'TOO_SHORT' });
  else if (characterLength(password) > 128) fields.push({ field: 'password', reason: 'TOO_LONG' });

  if (providerType === undefined || providerType === null || providerType === '') {
    fields.push({ field: 'providerType', reason: 'REQUIRED' });
  } else if (!['clinic', 'independent'].includes(providerType)) {
    fields.push({ field: 'providerType', reason: 'NOT_ALLOWED' });
  }

  if (!addressTypeOk) fields.push({ field: 'address', reason: 'INVALID_FORMAT' });
  else if (providerType === 'clinic' && !address) fields.push({ field: 'address', reason: 'REQUIRED' });
  else if (address && characterLength(address) > 300) fields.push({ field: 'address', reason: 'TOO_LONG' });

  if (fields.length) return { fields };
  return { value: { name, email, password, providerType, address } };
}

export function createIdentityRouter({ db, config, clock }) {
  const router = Router();

  router.post('/auth/sign-up/provider', async (req, res) => {
    const validated = validateProviderSignUp(req.body);
    if (validated.fields) throw new Outcome('VALIDATION_FAILED', { fields: validated.fields });
    const { name, email, password, providerType, address } = validated.value;

    // Argon2id is selected by ADR-006. Hashing happens before acquiring a database connection.
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const token = generateSessionToken();
    const now = clock.now();
    const expiresAt = new Date(now.getTime() + config.sessionAbsoluteHours * 60 * 60 * 1000);

    let accountId;
    try {
      accountId = await withTransaction(db, async (client) => {
        const account = await client.query(
          `INSERT INTO account (account_type, name, email, password_hash)
           VALUES ('provider', $1, $2, $3) RETURNING id`,
          [name, email, passwordHash],
        );
        const id = account.rows[0].id;

        // IF-016: create the COMP-006-owned profile in this same transaction.
        await createProviderProfile(client, {
          providerId: id,
          name,
          email,
          providerType,
          address,
        });
        await client.query(
          `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at)
           VALUES ($1, $2, $3, $3, $4)`,
          [hashSessionToken(token), id, now, expiresAt],
        );
        return id;
      });
    } catch (error) {
      if (error?.code === '23505' && error?.constraint === 'account_email_type_uq') {
        throw new Outcome('DUPLICATE_ACCOUNT_FOR_TYPE');
      }
      throw error;
    }

    const maxAge = config.sessionAbsoluteHours * 60 * 60;
    res.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`,
    );
    res.status(201).json({ accountType: 'provider', features: config.features });
  });

  return router;
}
