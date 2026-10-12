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

/** IF-009 / IF-017: the owner's pets (id, name, species, breed), oldest first. `db` may be a transaction client. */
export async function listOwnerPets(db, ownerId) {
  const result = await db.query(
    `SELECT id, name, species, breed
       FROM pet
      WHERE owner_id = $1
      ORDER BY created_at, id`,
    [ownerId],
  );
  return result.rows.map(petSummary);
}

/** IF-017: one pet of this owner, or null when it does not exist or belongs to someone else. */
export async function getOwnerPet(db, ownerId, petId) {
  const result = await db.query(
    'SELECT id, name, species, breed FROM pet WHERE id = $1 AND owner_id = $2',
    [petId, ownerId],
  );
  return result.rows[0] ? petSummary(result.rows[0]) : null;
}

export function createPetsRouter({ db, guard }) {
  const router = Router();

  router.get('/owner/pets', guard({ role: 'owner' }), async (req, res) => {
    res.json({ pets: await listOwnerPets(db, req.session.accountId) });
  });

  return router;
}
