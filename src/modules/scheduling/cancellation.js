import { Outcome } from '../../shared/outcomes.js';
import { withTransaction } from '../../shared/transaction.js';

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

/** IF-038: cancels one of the owner's upcoming appointments without deleting its history. */
export async function cancelOwnerAppointment(db, { ownerId, appointmentId, now }) {
  return withTransaction(db, async (client) => {
    const appointment = await client.query(
      `SELECT status, starts_at
         FROM appointment
        WHERE id = $1 AND owner_id = $2
        FOR UPDATE`,
      [appointmentId, ownerId],
    );
    if (!appointment.rowCount) throw new Outcome('NOT_FOUND');

    const current = appointment.rows[0];
    if (current.status !== 'scheduled' || new Date(current.starts_at) <= now) {
      throw new Outcome('APPOINTMENT_NOT_CHANGEABLE');
    }

    const updated = await client.query(
      `UPDATE appointment
          SET status = 'cancelled', cancelled_at = $3
        WHERE id = $1 AND owner_id = $2 AND status = 'scheduled' AND starts_at > $3
        RETURNING id`,
      [appointmentId, ownerId, now],
    );
    if (!updated.rowCount) throw new Outcome('APPOINTMENT_NOT_CHANGEABLE');
    return { id: updated.rows[0].id };
  });
}
