// COMP-005 Pets — IF-015 first-pet command, called within COMP-004's transaction (US-001), and the
// owner's pet reads for booking (IF-009, IF-017; US-019).
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';
import { withTransaction } from '../../shared/transaction.js';
import { isUuid } from '../../shared/ids.js';

export async function createOwnerPet(client, { ownerId, name, species, breed, ageYears, weightKg, heightCm }) {
  await client.query(
    `INSERT INTO pet (owner_id, name, species, breed, age_years, weight_kg, height_cm)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [ownerId, name, species, breed, ageYears, weightKg ?? null, heightCm ?? null],
  );
}

const petSummary = (row) => ({ id: row.id, name: row.name, species: row.species, breed: row.breed });

/**
 * IF-009 / IF-017: the owner's active pets (id, name, species, breed), oldest first. Removed pets are
 * excluded (CR-029). `db` may be a transaction client.
 */
export async function listOwnerPets(db, ownerId) {
  const result = await db.query(
    `SELECT id, name, species, breed
       FROM pet
      WHERE owner_id = $1 AND removed_at IS NULL
      ORDER BY created_at, id`,
    [ownerId],
  );
  return result.rows.map(petSummary);
}

/**
 * IF-017: one active pet of this owner, or null when it does not exist, belongs to someone else or
 * was removed (CR-029). With `lock`, the row is read FOR SHARE inside the caller's transaction, so a
 * concurrent removal (FOR UPDATE) and a booking serialize (ARCHITECTURE_V4 §8.3).
 */
export async function getOwnerPet(db, ownerId, petId, { lock = false, includeRemoved = false } = {}) {
  // History views (appointments) keep showing removed pets (CR-029: history is not filtered).
  const result = await db.query(
    `SELECT id, name, species, breed FROM pet
      WHERE id = $1 AND owner_id = $2${includeRemoved ? '' : ' AND removed_at IS NULL'}${lock ? ' FOR SHARE' : ''}`,
    [petId, ownerId],
  );
  return result.rows[0] ? petSummary(result.rows[0]) : null;
}

const ownPet = (row) => ({
  id: row.id,
  name: row.name,
  species: row.species,
  breed: row.breed,
  ageYears: Number(row.age_years),
  // Optional fields are omitted when empty (CTR-003 convention).
  ...(row.weight_kg === null ? {} : { weightKg: Number(row.weight_kg) }),
  ...(row.height_cm === null ? {} : { heightCm: Number(row.height_cm) }),
});

const PET_FIELDS = new Set(['name', 'species', 'breed', 'ageYears', 'weightKg', 'heightCm']);
const characterLength = (value) => [...value].length;

export function validatePetInput(input) {
  const fields = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  for (const key of Object.keys(input)) if (!PET_FIELDS.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });

  const text = (key) => {
    const value = input[key];
    if (value === undefined || value === null || value === '') {
      fields.push({ field: key, reason: 'REQUIRED' });
      return '';
    }
    if (typeof value !== 'string') {
      fields.push({ field: key, reason: 'INVALID_FORMAT' });
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed) fields.push({ field: key, reason: 'REQUIRED' });
    else if (characterLength(trimmed) > 80) fields.push({ field: key, reason: 'TOO_LONG' });
    return trimmed;
  };

  const name = text('name');
  const breed = text('breed');
  const species = input.species;
  if (species === undefined || species === null || species === '') fields.push({ field: 'species', reason: 'REQUIRED' });
  else if (!['dog', 'cat'].includes(species)) fields.push({ field: 'species', reason: 'NOT_ALLOWED' });

  const ageYears = input.ageYears;
  if (ageYears === undefined || ageYears === null || ageYears === '') fields.push({ field: 'ageYears', reason: 'REQUIRED' });
  else if (!Number.isInteger(ageYears) || ageYears < 0 || ageYears > 32767) fields.push({ field: 'ageYears', reason: 'INVALID_FORMAT' });

  let weightKg;
  if (input.weightKg !== undefined && input.weightKg !== null && input.weightKg !== '') {
    if (typeof input.weightKg !== 'number' || !Number.isFinite(input.weightKg) || input.weightKg <= 0 || input.weightKg > 999.9) fields.push({ field: 'weightKg', reason: 'INVALID_FORMAT' });
    else if (Math.abs(input.weightKg * 10 - Math.round(input.weightKg * 10)) > 1e-8) fields.push({ field: 'weightKg', reason: 'INVALID_FORMAT' });
    else weightKg = input.weightKg;
  }

  let heightCm;
  if (input.heightCm !== undefined && input.heightCm !== null && input.heightCm !== '') {
    if (!Number.isInteger(input.heightCm) || input.heightCm < 1 || input.heightCm > 32767) fields.push({ field: 'heightCm', reason: 'INVALID_FORMAT' });
    else heightCm = input.heightCm;
  }

  return fields.length ? { fields } : { value: { name, species, breed, ageYears, weightKg, heightCm } };
}

async function findOwnPet(db, ownerId, petId, { lock = false } = {}) {
  const result = await db.query(
    `SELECT id, name, species, breed, age_years, weight_kg, height_cm
       FROM pet
      WHERE id = $1 AND owner_id = $2 AND removed_at IS NULL${lock ? ' FOR UPDATE' : ''}`,
    [petId, ownerId],
  );
  return result.rows[0] ? ownPet(result.rows[0]) : null;
}

export async function addOwnPet(db, ownerId, pet) {
  const result = await db.query(
    `INSERT INTO pet (owner_id, name, species, breed, age_years, weight_kg, height_cm)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, species, breed, age_years, weight_kg, height_cm`,
    [ownerId, pet.name, pet.species, pet.breed, pet.ageYears, pet.weightKg ?? null, pet.heightCm ?? null],
  );
  return ownPet(result.rows[0]);
}

export async function removeOwnPet(db, { ownerId, petId, now }) {
  return withTransaction(db, async (client) => {
    const pet = await findOwnPet(client, ownerId, petId, { lock: true });
    if (!pet) throw new Outcome('NOT_FOUND');
    const cancelled = await client.query(
      `UPDATE appointment
          SET status = 'cancelled', cancelled_at = $3
        WHERE owner_id = $1 AND pet_id = $2 AND status = 'scheduled' AND starts_at > $3`,
      [ownerId, petId, now],
    );
    await client.query(
      'UPDATE pet SET removed_at = $3 WHERE id = $1 AND owner_id = $2 AND removed_at IS NULL',
      [petId, ownerId, now],
    );
    return { removed: true, cancelledAppointments: cancelled.rowCount };
  });
}

/** IF-009 (API_SPEC_V2 `OwnPet`): the owner's active pets with every field, oldest first (US-005). */
export async function listOwnPetsDetailed(db, ownerId) {
  const result = await db.query(
    `SELECT id, name, species, breed, age_years, weight_kg, height_cm
       FROM pet
      WHERE owner_id = $1 AND removed_at IS NULL
      ORDER BY created_at, id`,
    [ownerId],
  );
  return result.rows.map(ownPet);
}

export function createPetsRouter({ db, guard, clock }) {
  const router = Router();

  router.get('/owner/pets', guard({ role: 'owner' }), async (req, res) => {
    res.json({ pets: await listOwnPetsDetailed(db, req.session.accountId) });
  });

  router.post('/owner/pets', guard({ role: 'owner' }), async (req, res) => {
    const validation = validatePetInput(req.body);
    if (validation.fields) throw new Outcome('VALIDATION_FAILED', { fields: validation.fields });
    res.status(201).json(await addOwnPet(db, req.session.accountId, validation.value));
  });

  router.put('/owner/pets/:petId', guard({ role: 'owner' }), async (req, res) => {
    if (!isUuid(req.params.petId)) throw new Outcome('NOT_FOUND');
    const validation = validatePetInput(req.body);
    if (validation.fields) throw new Outcome('VALIDATION_FAILED', { fields: validation.fields });
    const pet = await findOwnPet(db, req.session.accountId, req.params.petId.toLowerCase());
    if (!pet) throw new Outcome('NOT_FOUND');
    const { name, species, breed, ageYears, weightKg, heightCm } = validation.value;
    const saved = await db.query(
      `UPDATE pet SET name = $3, species = $4, breed = $5, age_years = $6, weight_kg = $7, height_cm = $8
        WHERE id = $1 AND owner_id = $2 AND removed_at IS NULL
        RETURNING id, name, species, breed, age_years, weight_kg, height_cm`,
      [req.params.petId.toLowerCase(), req.session.accountId, name, species, breed, ageYears, weightKg ?? null, heightCm ?? null],
    );
    if (!saved.rows.length) throw new Outcome('NOT_FOUND');
    res.json(ownPet(saved.rows[0]));
  });

  router.delete('/owner/pets/:petId', guard({ role: 'owner' }), async (req, res) => {
    if (!isUuid(req.params.petId)) throw new Outcome('NOT_FOUND');
    const result = await removeOwnPet(db, { ownerId: req.session.accountId, petId: req.params.petId.toLowerCase(), now: clock.now() });
    res.json(result);
  });

  return router;
}
