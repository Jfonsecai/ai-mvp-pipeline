// COMP-004 Identity — owner identity read used by provider appointment summaries (IF-013).
export async function getOwnerName(db, ownerId) {
  const result = await db.query(
    `SELECT name
       FROM account
      WHERE id = $1 AND account_type = 'owner'`,
    [ownerId],
  );
  return result.rows[0]?.name ?? null;
}
