// COMP-006 Provider Profile — IF-016 sign-up command (US-002).
// Called by COMP-004 with the caller's transaction so account, profile and session are atomic.
export async function createProviderProfile(client, { providerId, name, email, providerType, address }) {
  await client.query(
    `INSERT INTO provider_profile
       (provider_id, provider_type, public_name, contact_email, address)
     VALUES ($1, $2, $3, $4, $5)`,
    [providerId, providerType, name, email, address ?? null],
  );
}
