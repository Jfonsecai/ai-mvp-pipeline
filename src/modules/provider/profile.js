// COMP-006 Provider Profile — IF-016 sign-up command (US-002) and IF-004 own profile (US-008).
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';

const updateFields = new Set(['publicName', 'contactPhone', 'contactEmail', 'address']);
const characterLength = (value) => [...value].length;
const PHONE_PATTERN = /^[0-9 +]*[0-9][0-9 +]*$/; // API_SPEC Phone; P04-ASM-005

/** Called by COMP-004 with the caller's transaction so account, profile and session are atomic. */
export async function createProviderProfile(client, { providerId, name, email, providerType, address }) {
  await client.query(
    `INSERT INTO provider_profile
       (provider_id, provider_type, public_name, contact_email, address)
     VALUES ($1, $2, $3, $4, $5)`,
    [providerId, providerType, name, email, address ?? null],
  );
}

/**
 * Request validation for IF-004 `updateOwnProviderProfile` (CTR-004 ProviderProfileUpdate).
 * Shape and format only; the provider-type rule for the address (BR-026) needs the stored type and
 * is applied by `requireAddressForClinic`. A missing, null or blank address is returned as `null`.
 */
export function validateProviderProfileUpdate(input) {
  const fields = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  }
  for (const key of Object.keys(input)) {
    if (!updateFields.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });
  }

  const text = (key, { required }) => {
    const value = input[key];
    if (value === undefined || value === null) {
      if (required) fields.push({ field: key, reason: 'REQUIRED' });
      return null;
    }
    if (typeof value !== 'string') {
      fields.push({ field: key, reason: 'INVALID_FORMAT' });
      return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      if (required) fields.push({ field: key, reason: 'REQUIRED' });
      return null;
    }
    return trimmed;
  };

  const publicName = text('publicName', { required: true });
  if (publicName && characterLength(publicName) > 120) fields.push({ field: 'publicName', reason: 'TOO_LONG' });

  const contactPhone = text('contactPhone', { required: true });
  if (contactPhone) {
    if (characterLength(contactPhone) > 30) fields.push({ field: 'contactPhone', reason: 'TOO_LONG' });
    else if (!PHONE_PATTERN.test(contactPhone)) fields.push({ field: 'contactPhone', reason: 'INVALID_FORMAT' });
  }

  const contactEmail = text('contactEmail', { required: true });
  if (contactEmail) {
    if (characterLength(contactEmail) > 254) fields.push({ field: 'contactEmail', reason: 'TOO_LONG' });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) fields.push({ field: 'contactEmail', reason: 'INVALID_FORMAT' });
  }

  const address = text('address', { required: false });
  if (address && characterLength(address) > 300) fields.push({ field: 'address', reason: 'TOO_LONG' });

  if (fields.length) return { fields };
  return { value: { publicName, contactPhone, contactEmail, address } };
}

/** BR-026, AC-106, EDGE-027: a clinic's address can be replaced but never removed. */
export function requireAddressForClinic(providerType, address) {
  if (providerType === 'clinic' && !address) {
    throw new Outcome('VALIDATION_FAILED', { fields: [{ field: 'address', reason: 'REQUIRED' }] });
  }
}

/** CTR-004 OwnProviderProfile. `profileCompleted` is true once a phone has been saved (P04-PROP-006). */
function ownProfile(row) {
  return {
    providerType: row.provider_type,
    publicName: row.public_name,
    contactPhone: row.contact_phone ?? null,
    contactEmail: row.contact_email,
    address: row.address ?? null,
    profileCompleted: row.contact_phone !== null && row.contact_phone !== undefined,
  };
}

export function createProviderProfileRouter({ db, guard, clock }) {
  const router = Router();

  router.get('/provider/profile', guard({ role: 'provider' }), async (req, res) => {
    const result = await db.query(
      `SELECT provider_type, public_name, contact_phone, contact_email, address
         FROM provider_profile
        WHERE provider_id = $1`,
      [req.session.accountId],
    );
    if (!result.rows.length) throw new Outcome('NOT_FOUND');
    res.json(ownProfile(result.rows[0]));
  });

  router.put('/provider/profile', guard({ role: 'provider' }), async (req, res) => {
    const validation = validateProviderProfileUpdate(req.body);
    if (validation.fields) throw new Outcome('VALIDATION_FAILED', { fields: validation.fields });
    const { publicName, contactPhone, contactEmail, address } = validation.value;

    // The provider type is immutable (BR-002), so reading it before the update is race-free.
    const current = await db.query('SELECT provider_type FROM provider_profile WHERE provider_id = $1', [
      req.session.accountId,
    ]);
    if (!current.rows.length) throw new Outcome('NOT_FOUND');
    requireAddressForClinic(current.rows[0].provider_type, address);

    const saved = await db.query(
      `UPDATE provider_profile
          SET public_name = $2, contact_phone = $3, contact_email = $4, address = $5, updated_at = $6
        WHERE provider_id = $1
        RETURNING provider_type, public_name, contact_phone, contact_email, address`,
      [req.session.accountId, publicName, contactPhone, contactEmail, address, clock.now()],
    );
    if (!saved.rows.length) throw new Outcome('NOT_FOUND');
    res.json(ownProfile(saved.rows[0]));
  });

  return router;
}
