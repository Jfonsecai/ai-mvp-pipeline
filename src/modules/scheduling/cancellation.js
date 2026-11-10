// COMP-009 Scheduling — IF-044 cancellation command for COMP-007 (service removal, US-012).
// Runs inside the caller's transaction and under the provider lock (ARCHITECTURE_V4 §8.3), so a
// booking cannot be inserted between the removal and this update.

/**
 * Cancels the upcoming scheduled appointments of one service (BR-034, EDGE-012). Only `scheduled`
 * appointments that start after `now` change; started or already cancelled ones keep their data and
 * the rows are never deleted (BR-035: cancelled appointments stay visible).
 *
 * @param {import('pg').PoolClient} client the caller's transaction
 * @returns {Promise<number>} how many appointments were cancelled
 */
export async function cancelUpcomingServiceAppointments(client, { serviceId, now }) {
  const result = await client.query(
    `UPDATE appointment
        SET status = 'cancelled', cancelled_at = $2
      WHERE service_id = $1 AND status = 'scheduled' AND starts_at > $2`,
    [serviceId, now],
  );
  return result.rowCount;
}
