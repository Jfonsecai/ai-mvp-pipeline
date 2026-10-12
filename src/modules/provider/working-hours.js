// COMP-006 Provider Profile and Working Hours — IF-005, US-009.
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';
import { withTransaction } from '../../shared/transaction.js';
import { cancelAppointmentsOutsideHours } from '../scheduling/hours.js';

const WEEKDAYS = Object.freeze([1, 2, 3, 4, 5, 6, 7]);
const dayFields = new Set(['weekday', 'works', 'startHour', 'endHour']);

function validationError(fields) {
  return new Outcome('VALIDATION_FAILED', { fields });
}

export function validateWeeklyHours(input) {
  const fields = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  }
  for (const key of Object.keys(input)) {
    if (key !== 'days') fields.push({ field: key, reason: 'NOT_ALLOWED' });
  }
  if (!Array.isArray(input.days)) {
    fields.push({ field: 'days', reason: input.days === undefined ? 'REQUIRED' : 'INVALID_FORMAT' });
    return { fields };
  }
  if (input.days.length !== 7) fields.push({ field: 'days', reason: 'OUT_OF_RANGE' });

  const seen = new Set();
  const normalizedDays = [];
  input.days.forEach((day, index) => {
    const prefix = `days.${index}`;
    if (!day || typeof day !== 'object' || Array.isArray(day)) {
      fields.push({ field: prefix, reason: 'INVALID_FORMAT' });
      return;
    }
    for (const key of Object.keys(day)) {
      if (!dayFields.has(key)) fields.push({ field: `${prefix}.${key}`, reason: 'NOT_ALLOWED' });
    }

    const weekday = day.weekday;
    const weekdayValid = Number.isInteger(weekday) && weekday >= 1 && weekday <= 7;
    if (!weekdayValid) fields.push({ field: `${prefix}.weekday`, reason: Number.isInteger(weekday) ? 'OUT_OF_RANGE' : 'INVALID_FORMAT' });
    else if (seen.has(weekday)) fields.push({ field: `${prefix}.weekday`, reason: 'NOT_ALLOWED' });
    else seen.add(weekday);

    if (typeof day.works !== 'boolean') {
      fields.push({ field: `${prefix}.works`, reason: day.works === undefined ? 'REQUIRED' : 'INVALID_FORMAT' });
      return;
    }
    if (!weekdayValid) return;
    if (!day.works) {
      let startValid = day.startHour === undefined;
      let endValid = day.endHour === undefined;
      for (const [key, minimum, maximum, setValid] of [
        ['startHour', 0, 23, (valid) => { startValid = valid; }],
        ['endHour', 1, 24, (valid) => { endValid = valid; }],
      ]) {
        const value = day[key];
        if (value === undefined) continue;
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          fields.push({ field: `${prefix}.${key}`, reason: 'INVALID_FORMAT' });
          setValid(false);
        } else if (!Number.isInteger(value)) {
          fields.push({ field: `${prefix}.${key}`, reason: 'NOT_ON_THE_HOUR' });
          setValid(false);
        } else if (value < minimum || value > maximum) {
          fields.push({ field: `${prefix}.${key}`, reason: 'OUT_OF_RANGE' });
          setValid(false);
        } else {
          setValid(true);
        }
      }
      if (startValid && endValid && day.startHour !== undefined && day.endHour !== undefined && day.endHour <= day.startHour) {
        fields.push({ field: `${prefix}.endHour`, reason: 'END_NOT_AFTER_START' });
      }
      normalizedDays.push({ weekday, works: false });
      return;
    }

    let valid = true;
    for (const key of ['startHour', 'endHour']) {
      const value = day[key];
      if (value === undefined) {
        fields.push({ field: `${prefix}.${key}`, reason: 'REQUIRED' });
        valid = false;
      } else if (typeof value !== 'number' || !Number.isFinite(value)) {
        fields.push({ field: `${prefix}.${key}`, reason: 'INVALID_FORMAT' });
        valid = false;
      } else if (!Number.isInteger(value)) {
        fields.push({ field: `${prefix}.${key}`, reason: 'NOT_ON_THE_HOUR' });
        valid = false;
      } else if ((key === 'startHour' && (value < 0 || value > 23)) || (key === 'endHour' && (value < 1 || value > 24))) {
        fields.push({ field: `${prefix}.${key}`, reason: 'OUT_OF_RANGE' });
        valid = false;
      }
    }
    if (valid && day.endHour <= day.startHour) {
      fields.push({ field: `${prefix}.endHour`, reason: 'END_NOT_AFTER_START' });
      valid = false;
    }
    if (valid) normalizedDays.push({ weekday, works: true, startHour: day.startHour, endHour: day.endHour });
  });

  for (const weekday of WEEKDAYS) {
    if (!seen.has(weekday)) fields.push({ field: 'days', reason: 'REQUIRED' });
  }
  if (fields.length) return { fields };

  normalizedDays.sort((left, right) => left.weekday - right.weekday);
  return { value: { days: normalizedDays } };
}

function weeklyHours(rows) {
  const byWeekday = new Map(rows.map((row) => [Number(row.weekday), row]));
  return {
    days: WEEKDAYS.map((weekday) => {
      const row = byWeekday.get(weekday);
      return row
        ? { weekday, works: true, startHour: Number(row.start_hour), endHour: Number(row.end_hour) }
        : { weekday, works: false };
    }),
  };
}

export function createProviderWorkingHoursRouter({ db, guard, clock }) {
  const router = Router();

  router.get('/provider/working-hours', guard({ role: 'provider' }), async (req, res) => {
    const result = await db.query(
      `SELECT weekday, start_hour, end_hour
         FROM working_hours
        WHERE provider_id = $1
        ORDER BY weekday`,
      [req.session.accountId],
    );
    res.json(weeklyHours(result.rows));
  });

  router.put('/provider/working-hours', guard({ role: 'provider' }), async (req, res) => {
    const validation = validateWeeklyHours(req.body);
    if (validation.fields) throw validationError(validation.fields);

    const { days } = validation.value;
    const now = clock.now();
    await withTransaction(db, async (client) => {
      const provider = await client.query(
        'SELECT provider_id FROM provider_profile WHERE provider_id = $1 FOR UPDATE',
        [req.session.accountId],
      );
      if (!provider.rows.length) throw new Outcome('NOT_FOUND');

      await client.query('DELETE FROM working_hours WHERE provider_id = $1', [req.session.accountId]);
      for (const day of days) {
        if (!day.works) continue;
        await client.query(
          `INSERT INTO working_hours (provider_id, weekday, start_hour, end_hour)
           VALUES ($1, $2, $3, $4)`,
          [req.session.accountId, day.weekday, day.startHour, day.endHour],
        );
      }
      await cancelAppointmentsOutsideHours(client, { providerId: req.session.accountId, days, now });
    });

    res.json({ days });
  });

  return router;
}
