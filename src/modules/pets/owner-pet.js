// COMP-005 Pets — IF-015 first-pet command, called within COMP-004's transaction (US-001), and the
// owner's pet reads for booking (IF-009, IF-017; US-019).
import { Router } from 'express';

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

export function createPetsRouter({ db, guard }) {
  const router = Router();

  router.get('/owner/pets', guard({ role: 'owner' }), async (req, res) => {
    res.json({ pets: await listOwnPetsDetailed(db, req.session.accountId) });
  });

  return router;
}
