// COMP-009 Scheduling — IF-018 cancellation command for COMP-006.
export async function cancelAppointmentsOutsideHours(client, { providerId, days, now }) {
  const workingDays = days
    .filter((day) => day.works)
    .map(({ weekday, startHour, endHour }) => ({
      weekday,
      start_hour: startHour,
      end_hour: endHour,
    }));

  const result = await client.query(
    `UPDATE appointment AS a
        SET status = 'cancelled', cancelled_at = $3
      WHERE a.provider_id = $1
        AND a.status = 'scheduled'
        AND a.starts_at > $3
        AND NOT EXISTS (
          SELECT 1
            FROM jsonb_to_recordset($2::jsonb) AS hours(weekday smallint, start_hour smallint, end_hour smallint)
           WHERE hours.weekday = EXTRACT(ISODOW FROM a.starts_at AT TIME ZONE 'America/Bogota')::smallint
             AND EXTRACT(HOUR FROM a.starts_at AT TIME ZONE 'America/Bogota') >= hours.start_hour
             AND EXTRACT(HOUR FROM a.starts_at AT TIME ZONE 'America/Bogota') + 1 <= hours.end_hour
        )`,
    [providerId, JSON.stringify(workingDays), now],
  );

  return result.rowCount;
}
