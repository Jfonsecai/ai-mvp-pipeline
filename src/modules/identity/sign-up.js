// COMP-004 Identity — provider sign-up (IF-001, US-002).
import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { Outcome } from '../../shared/outcomes.js';
import { withTransaction } from '../../shared/transaction.js';
import { createProviderProfile } from '../provider/profile.js';
import { createOwnerPet } from '../pets/owner-pet.js';
import { generateSessionToken, hashSessionToken, readCookie, SESSION_COOKIE_NAME } from './sessions.js';

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

const ownerFields = new Set(['name', 'email', 'password', 'pet']);
const petFields = new Set(['name', 'species', 'breed', 'ageYears', 'weightKg', 'heightCm']);

const signInFields = new Set(['email', 'password', 'accountType']);
// A process-local dummy hash keeps missing-account failures on the same expensive verification
// path as an incorrect password, without embedding a credential or reusable token.
const dummyPasswordHash = await argon2.hash(randomBytes(32), { type: argon2.argon2id });

export function validateSignIn(input) {
  const fields = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  for (const key of Object.keys(input)) if (!signInFields.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  if (input.email !== undefined && typeof input.email !== 'string') fields.push({ field: 'email', reason: 'INVALID_FORMAT' });
  else if (!email) fields.push({ field: 'email', reason: 'REQUIRED' });
  else if (characterLength(email) > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.push({ field: 'email', reason: 'INVALID_FORMAT' });
  if (input.password !== undefined && typeof input.password !== 'string') fields.push({ field: 'password', reason: 'INVALID_FORMAT' });
  else if (!password) fields.push({ field: 'password', reason: 'REQUIRED' });
  else if (characterLength(password) > 128) fields.push({ field: 'password', reason: 'TOO_LONG' });
  if (input.accountType === undefined || input.accountType === '') fields.push({ field: 'accountType', reason: 'REQUIRED' });
  else if (!['owner', 'provider'].includes(input.accountType)) fields.push({ field: 'accountType', reason: 'NOT_ALLOWED' });
  return fields.length ? { fields } : { value: { email, password, accountType: input.accountType } };
}

export function validateOwnerSignUp(input) {
  const fields = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  }
  for (const key of Object.keys(input)) if (!ownerFields.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  if (input.name !== undefined && typeof input.name !== 'string') fields.push({ field: 'name', reason: 'INVALID_FORMAT' });
  else if (!name) fields.push({ field: 'name', reason: 'REQUIRED' });
  else if (characterLength(name) > 120) fields.push({ field: 'name', reason: 'TOO_LONG' });
  if (input.email !== undefined && typeof input.email !== 'string') fields.push({ field: 'email', reason: 'INVALID_FORMAT' });
  else if (!email) fields.push({ field: 'email', reason: 'REQUIRED' });
  else if (characterLength(email) > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.push({ field: 'email', reason: 'INVALID_FORMAT' });
  if (input.password !== undefined && typeof input.password !== 'string') fields.push({ field: 'password', reason: 'INVALID_FORMAT' });
  else if (!password) fields.push({ field: 'password', reason: 'REQUIRED' });
  else if (characterLength(password) < 8) fields.push({ field: 'password', reason: 'TOO_SHORT' });
  else if (characterLength(password) > 128) fields.push({ field: 'password', reason: 'TOO_LONG' });

  const rawPet = input.pet;
  if (rawPet === undefined || rawPet === null) fields.push({ field: 'pet', reason: 'REQUIRED' });
  else if (typeof rawPet !== 'object' || Array.isArray(rawPet)) fields.push({ field: 'pet', reason: 'INVALID_FORMAT' });
  else {
    for (const key of Object.keys(rawPet)) if (!petFields.has(key)) fields.push({ field: `pet.${key}`, reason: 'NOT_ALLOWED' });
    const pet = {};
    for (const key of ['name', 'breed']) {
      const value = rawPet[key];
      if (value !== undefined && typeof value !== 'string') fields.push({ field: `pet.${key}`, reason: 'INVALID_FORMAT' });
      else if (typeof value !== 'string' || !value.trim()) fields.push({ field: `pet.${key}`, reason: 'REQUIRED' });
      else if (characterLength(value.trim()) > 80) fields.push({ field: `pet.${key}`, reason: 'TOO_LONG' });
      else pet[key] = value.trim();
    }
    if (rawPet.species === undefined || rawPet.species === '') fields.push({ field: 'pet.species', reason: 'REQUIRED' });
    else if (!['dog', 'cat'].includes(rawPet.species)) fields.push({ field: 'pet.species', reason: 'NOT_ALLOWED' });
    else pet.species = rawPet.species;
    if (rawPet.ageYears === undefined) fields.push({ field: 'pet.ageYears', reason: 'REQUIRED' });
    else if (!Number.isInteger(rawPet.ageYears)) fields.push({ field: 'pet.ageYears', reason: 'INVALID_FORMAT' });
    else if (rawPet.ageYears < 0 || rawPet.ageYears > 32767) fields.push({ field: 'pet.ageYears', reason: 'OUT_OF_RANGE' });
    else pet.ageYears = rawPet.ageYears;
    if (rawPet.weightKg !== undefined) {
      if (typeof rawPet.weightKg !== 'number' || !Number.isFinite(rawPet.weightKg)) fields.push({ field: 'pet.weightKg', reason: 'INVALID_FORMAT' });
      else if (rawPet.weightKg <= 0 || rawPet.weightKg > 999.9) fields.push({ field: 'pet.weightKg', reason: 'OUT_OF_RANGE' });
      else if (Math.abs(rawPet.weightKg * 10 - Math.round(rawPet.weightKg * 10)) > 1e-8) fields.push({ field: 'pet.weightKg', reason: 'INVALID_FORMAT' });
      else pet.weightKg = rawPet.weightKg;
    }
    if (rawPet.heightCm !== undefined) {
      if (!Number.isInteger(rawPet.heightCm)) fields.push({ field: 'pet.heightCm', reason: 'INVALID_FORMAT' });
      else if (rawPet.heightCm < 1 || rawPet.heightCm > 32767) fields.push({ field: 'pet.heightCm', reason: 'OUT_OF_RANGE' });
      else pet.heightCm = rawPet.heightCm;
    }
    if (fields.length) return { fields };
    return { value: { name, email, password, pet } };
  }
  return fields.length ? { fields } : { value: { name, email, password } };
}

export function createIdentityRouter({ db, config, clock }) {
  const router = Router();

  router.post('/auth/sign-out', async (req, res) => {
    const token = readCookie(req.headers.cookie, SESSION_COOKIE_NAME);
    if (token) {
      await db.query(
        'UPDATE session SET ended_at = $2 WHERE token_hash = $1 AND ended_at IS NULL',
        [hashSessionToken(token), clock.now()],
      );
    }
    const clearCookie = `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
    res.set('Set-Cookie', clearCookie);
    res.status(204).end();
  });

  router.post('/auth/sign-in', async (req, res) => {
    const validated = validateSignIn(req.body);
    if (validated.fields) throw new Outcome('VALIDATION_FAILED', { fields: validated.fields });
    const { email, password, accountType } = validated.value;
    const { rows } = await db.query(
      'SELECT id, password_hash FROM account WHERE email = $1 AND account_type = $2',
      [email, accountType],
    );
    const account = rows[0];
    const passwordMatches = await argon2.verify(account?.password_hash ?? dummyPasswordHash, password);
    if (!account || !passwordMatches) {
      throw new Outcome('INVALID_CREDENTIALS');
    }

    const token = generateSessionToken();
    const now = clock.now();
    const expiresAt = new Date(now.getTime() + config.sessionAbsoluteHours * 60 * 60 * 1000);
    await db.query(
      `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at)
       VALUES ($1, $2, $3, $3, $4)`,
      [hashSessionToken(token), account.id, now, expiresAt],
    );
    const maxAge = config.sessionAbsoluteHours * 60 * 60;
    res.set('Set-Cookie', `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
    res.status(200).json({ accountType, features: config.features });
  });

  router.get('/session', (req, res) => {
    const session = req.session;
    res.status(200).json({
      state: session.state,
      ...(session.state === 'active' ? { accountType: session.accountType } : {}),
      features: config.features,
    });
  });

  router.post('/auth/sign-up/owner', async (req, res) => {
    const validated = validateOwnerSignUp(req.body);
    if (validated.fields) throw new Outcome('VALIDATION_FAILED', { fields: validated.fields });
    const { name, email, password, pet } = validated.value;
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const token = generateSessionToken();
    const now = clock.now();
    const expiresAt = new Date(now.getTime() + config.sessionAbsoluteHours * 60 * 60 * 1000);
    try {
      await withTransaction(db, async (client) => {
        const account = await client.query(
          `INSERT INTO account (account_type, name, email, password_hash)
           VALUES ('owner', $1, $2, $3) RETURNING id`,
          [name, email, passwordHash],
        );
        const accountId = account.rows[0].id;
        await createOwnerPet(client, { ownerId: accountId, ...pet });
        await client.query(
          `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at)
           VALUES ($1, $2, $3, $3, $4)`,
          [hashSessionToken(token), accountId, now, expiresAt],
        );
      });
    } catch (error) {
      if (error?.code === '23505' && error?.constraint === 'account_email_type_uq') {
        throw new Outcome('DUPLICATE_ACCOUNT_FOR_TYPE');
      }
      throw error;
    }
    const maxAge = config.sessionAbsoluteHours * 60 * 60;
    res.set('Set-Cookie', `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
    res.status(201).json({ accountType: 'owner', features: config.features });
  });

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
