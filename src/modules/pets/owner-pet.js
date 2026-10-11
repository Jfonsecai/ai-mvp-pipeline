// COMP-005 Pets — IF-015 first-pet command, called within COMP-004's transaction (US-001).
export async function createOwnerPet(client, { ownerId, name, species, breed, ageYears, weightKg, heightCm }) {
  await client.query(
    `INSERT INTO pet (owner_id, name, species, breed, age_years, weight_kg, height_cm)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [ownerId, name, species, breed, ageYears, weightKg ?? null, heightCm ?? null],
  );
}
