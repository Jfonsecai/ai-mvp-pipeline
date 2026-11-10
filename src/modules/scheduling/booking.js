// COMP-009 Scheduling — IF-010 booking context and IF-011 booking (US-019, US-020).
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';
import { withTransaction } from '../../shared/transaction.js';
import { CHOSEN_MODALITIES } from '../../shared/enums.js';
import { isUuid } from '../../shared/ids.js';
import { addDays, bogotaInstant, bogotaParts, isLocalDate, isoWeekday, mondayOf, toBogotaIso } from '../../shared/clock.js';
import { getProviderFacts, lockProvider } from '../provider/profile.js';
import { listWorkingHours } from '../provider/working-hours.js';
import { getServiceFacts } from '../catalog/offerings.js';
import { getOwnerName } from '../identity/accounts.js';
import { getOwnerPet, listOwnerPets } from '../pets/owner-pet.js';
import { computeWeekSlots, isSlotOffered } from './slots.js';
import { cancelOwnerAppointment, cancelProviderAppointment } from './cancellation.js';

const BOOKING_FIELDS = new Set(['serviceId', 'petId', 'startsAt', 'modality', 'visitAddress']);
const RESCHEDULE_FIELDS = new Set(['startsAt']);
// ISO 8601 with an offset. Ranges are checked here and the date part with isLocalDate, because
// Date silently rolls 2026-02-30 over to 2 March.
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;
const HOUR_MS = 60 * 60 * 1000;

const validationFailed = (fields) => new Outcome('VALIDATION_FAILED', { fields });

/** weekStart: a real Bogota calendar date that is a Monday (IF-010); absent means the current week. */
export function validateWeekStart(input) {
  if (input === undefined) return { value: undefined };
  if (typeof input !== 'string' || !isLocalDate(input)) return { fields: [{ field: 'weekStart', reason: 'INVALID_FORMAT' }] };
  const year = Number(input.slice(0, 4));
  if (year < 1970 || year > 2999) return { fields: [{ field: 'weekStart', reason: 'OUT_OF_RANGE' }] };
  if (isoWeekday(input) !== 1) return { fields: [{ field: 'weekStart', reason: 'NOT_ALLOWED' }] };
  return { value: input };
}

/** Request shape of IF-011 (CTR-006 BookAppointmentRequest). Business rules are applied afterwards. */
export function validateBookingRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  }
  const fields = [];
  for (const key of Object.keys(input)) {
    if (!BOOKING_FIELDS.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });
  }

  for (const key of ['serviceId', 'petId']) {
    const value = input[key];
    if (value === undefined || value === null || value === '') fields.push({ field: key, reason: 'REQUIRED' });
    else if (!isUuid(value)) fields.push({ field: key, reason: 'INVALID_FORMAT' });
  }

  let startsAt;
  const rawStart = input.startsAt;
  if (rawStart === undefined || rawStart === null || rawStart === '') fields.push({ field: 'startsAt', reason: 'REQUIRED' });
  else if (
    typeof rawStart !== 'string' || !ISO_DATE_TIME.test(rawStart) || !isLocalDate(rawStart.slice(0, 10))
    || Number.isNaN(new Date(rawStart).getTime())
  ) {
    fields.push({ field: 'startsAt', reason: 'INVALID_FORMAT' });
  } else if (new Date(rawStart).getTime() % HOUR_MS !== 0) {
    fields.push({ field: 'startsAt', reason: 'NOT_ON_THE_HOUR' });
  } else startsAt = new Date(rawStart);

  let modality;
  if (input.modality !== undefined) {
    if (typeof input.modality !== 'string' || !CHOSEN_MODALITIES.includes(input.modality)) {
      fields.push({ field: 'modality', reason: 'NOT_ALLOWED' });
    } else modality = input.modality;
  }
  let visitAddress;
  if (input.visitAddress !== undefined) {
    if (typeof input.visitAddress !== 'string') {
      fields.push({ field: 'visitAddress', reason: 'INVALID_FORMAT' });
    } else {
      visitAddress = input.visitAddress.trim();
      if (!visitAddress) fields.push({ field: 'visitAddress', reason: 'REQUIRED' });
      else if ([...visitAddress].length > 300) fields.push({ field: 'visitAddress', reason: 'TOO_LONG' });
    }
  }

  if (fields.length) return { fields };
  return {
    value: {
      serviceId: input.serviceId.toLowerCase(),
      petId: input.petId.toLowerCase(),
      startsAt,
      modality,
      visitAddress,
    },
  };
}

/** Request shape of IF-040 (CTR-007 RescheduleRequest). */
export function validateRescheduleRequest(input) {
  const fields = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  }
  for (const key of Object.keys(input)) {
    if (!RESCHEDULE_FIELDS.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });
  }

  const rawStart = input.startsAt;
  let startsAt;
  if (rawStart === undefined || rawStart === null || rawStart === '') {
    fields.push({ field: 'startsAt', reason: 'REQUIRED' });
  } else if (
    typeof rawStart !== 'string' || !ISO_DATE_TIME.test(rawStart) || !isLocalDate(rawStart.slice(0, 10))
    || Number.isNaN(new Date(rawStart).getTime())
  ) {
    fields.push({ field: 'startsAt', reason: 'INVALID_FORMAT' });
  } else if (new Date(rawStart).getTime() % HOUR_MS !== 0) {
    fields.push({ field: 'startsAt', reason: 'NOT_ON_THE_HOUR' });
  } else startsAt = new Date(rawStart);

  if (fields.length) return { fields };
  return { value: { startsAt } };
}

/**
 * Resolves the selected appointment modality and enforces the service's offering rules (BR-007).
 */
export function resolveAppointmentModality(serviceModality, requested) {
  if (serviceModality === 'clinic') {
    if (requested === undefined || requested === 'clinic') return 'clinic';
  } else if (serviceModality === 'home') {
    if (requested === undefined || requested === 'home') return 'home';
  } else if (serviceModality === 'both') {
    if (requested === 'clinic') return 'clinic';
    if (requested === 'home') return 'home';
    if (requested === undefined) throw validationFailed([{ field: 'modality', reason: 'REQUIRED' }]);
  }
  throw validationFailed([{ field: 'modality', reason: 'NOT_ALLOWED' }]);
}

async function listScheduledStarts(db, providerId, from, to) {
  const result = await db.query(
    `SELECT starts_at
       FROM appointment
      WHERE provider_id = $1 AND status = 'scheduled' AND starts_at >= $2 AND starts_at < $3`,
    [providerId, from, to],
  );
  return new Set(result.rows.map((row) => new Date(row.starts_at).getTime()));
}

async function getReschedulableAppointment(db, { accountId, accountType, appointmentId, now }) {
  const accountColumn = accountType === 'provider' ? 'provider_id' : 'owner_id';
  const result = await db.query(
    `SELECT id, provider_id, service_id, starts_at, status
       FROM appointment
      WHERE id = $1 AND ${accountColumn} = $2`,
    [appointmentId, accountId],
  );
  const appointment = result.rows[0];
  if (!appointment) throw new Outcome('NOT_FOUND');
  if (appointment.status !== 'scheduled' || new Date(appointment.starts_at) <= now) {
    throw new Outcome('APPOINTMENT_NOT_CHANGEABLE');
  }
  return appointment;
}

/** IF-039: offered slots for an existing appointment, excluding its current slot. */
async function getRescheduleContext(db, { accountId, accountType, appointmentId, weekStart, now }) {
  const appointment = await getReschedulableAppointment(db, { accountId, accountType, appointmentId, now });
  const service = await getServiceFacts(db, appointment.service_id);
  if (!service) throw new Outcome('NOT_FOUND');

  const week = weekStart ?? mondayOf(bogotaParts(now).date);
  const hours = await listWorkingHours(db, service.providerId);
  const bookedStarts = service.providerType === 'independent'
    ? await listScheduledStarts(db, service.providerId, bogotaInstant(week, 0), bogotaInstant(addDays(week, 7), 0))
    : new Set();
  const currentStart = new Date(appointment.starts_at).getTime();
  bookedStarts.delete(currentStart);

  return {
    now: toBogotaIso(now),
    weekStart: week,
    appointmentId: appointment.id,
    currentStartsAt: toBogotaIso(new Date(appointment.starts_at)),
    providerHasHours: hours.length > 0,
    days: computeWeekSlots({
      weekStart: week,
      now,
      hours,
      providerType: service.providerType,
      bookedStarts,
    }).map((day) => ({
      ...day,
      slots: day.slots.filter((slot) => new Date(slot).getTime() !== currentStart),
    })),
  };
}

/** IF-039: offered slots for the owner's existing appointment. */
export function getOwnerRescheduleContext(db, { ownerId, appointmentId, weekStart, now }) {
  return getRescheduleContext(db, { accountId: ownerId, accountType: 'owner', appointmentId, weekStart, now });
}

/** IF-039: offered slots for the provider's existing appointment. */
export function getProviderRescheduleContext(db, { providerId, appointmentId, weekStart, now }) {
  return getRescheduleContext(db, { accountId: providerId, accountType: 'provider', appointmentId, weekStart, now });
}

/**
 * IF-040: move an appointment under the same provider lock and slot rules as booking.
 * The initial account-scoped read identifies the lock to acquire; mutable facts are re-read in
 * the transaction before the conditional update.
 */
async function rescheduleAppointment(pool, { accountId, accountType, appointmentId, startsAt, now }) {
  const accountColumn = accountType === 'provider' ? 'provider_id' : 'owner_id';
  const target = new Date(startsAt);
  const initial = await pool.query(
    `SELECT provider_id FROM appointment WHERE id = $1 AND ${accountColumn} = $2`,
    [appointmentId, accountId],
  );
  const providerId = initial.rows[0]?.provider_id;
  if (!providerId) throw new Outcome('NOT_FOUND');

  return withTransaction(pool, async (client) => {
    if (!(await lockProvider(client, providerId))) throw new Outcome('NOT_FOUND');
    const result = await client.query(
      `SELECT service_id, starts_at, status
         FROM appointment
        WHERE id = $1 AND ${accountColumn} = $2 AND provider_id = $3
        FOR UPDATE`,
      [appointmentId, accountId, providerId],
    );
    const appointment = result.rows[0];
    if (!appointment) throw new Outcome('NOT_FOUND');
    if (appointment.status !== 'scheduled' || new Date(appointment.starts_at) <= now) {
      throw new Outcome('APPOINTMENT_NOT_CHANGEABLE');
    }
    if (new Date(appointment.starts_at).getTime() === target.getTime()) {
      throw new Outcome('SLOT_UNAVAILABLE');
    }

    const service = await getServiceFacts(client, appointment.service_id);
    if (!service) throw new Outcome('NOT_FOUND');
    const hours = await listWorkingHours(client, providerId);
    const bookedStarts = service.providerType === 'independent'
      ? await listScheduledStarts(client, providerId, target, new Date(target.getTime() + HOUR_MS))
      : new Set();
    if (!isSlotOffered({ startsAt: target, now, hours, providerType: service.providerType, bookedStarts })) {
      throw new Outcome('SLOT_UNAVAILABLE');
    }

    try {
      const updated = await client.query(
        `UPDATE appointment
            SET starts_at = $4
          WHERE id = $1 AND ${accountColumn} = $2 AND provider_id = $3
            AND status = 'scheduled' AND starts_at > $5
          RETURNING id`,
        [appointmentId, accountId, providerId, target, now],
      );
      if (!updated.rowCount) throw new Outcome('APPOINTMENT_NOT_CHANGEABLE');
      return { id: updated.rows[0].id };
    } catch (error) {
      if (error?.code === '23505' && error?.constraint === 'appointment_independent_slot_uq') {
        throw new Outcome('SLOT_UNAVAILABLE');
      }
      throw error;
    }
  });
}

export function rescheduleOwnerAppointment(pool, { ownerId, appointmentId, startsAt, now }) {
  return rescheduleAppointment(pool, { accountId: ownerId, accountType: 'owner', appointmentId, startsAt, now });
}

export function rescheduleProviderAppointment(pool, { providerId, appointmentId, startsAt, now }) {
  return rescheduleAppointment(pool, { accountId: providerId, accountType: 'provider', appointmentId, startsAt, now });
}

/** IF-010: everything SCR-UX-006 needs for one service and one week. */
export async function getBookingContext(db, { ownerId, serviceId, weekStart, now }) {
  const service = await getServiceFacts(db, serviceId);
  if (!service) throw new Outcome('NOT_FOUND');
  const provider = await getProviderFacts(db, service.providerId);
  if (!provider) throw new Outcome('NOT_FOUND');

  const week = weekStart ?? mondayOf(bogotaParts(now).date);
  const [pets, hours] = await Promise.all([listOwnerPets(db, ownerId), listWorkingHours(db, provider.id)]);
  const bookedStarts = provider.type === 'independent'
    ? await listScheduledStarts(db, provider.id, bogotaInstant(week, 0), bogotaInstant(addDays(week, 7), 0))
    : new Set();

  return {
    now: toBogotaIso(now),
    weekStart: week,
    service: {
      id: service.id,
      name: service.name,
      species: service.species,
      priceCop: service.priceCop,
      modality: service.modality,
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        ...(provider.address ? { address: provider.address } : {}),
        ...(provider.contactPhone ? { contactPhone: provider.contactPhone } : {}),
      },
    },
    ownerHasPets: pets.length > 0,
    eligiblePetIds: pets.filter((pet) => pet.species === service.species).map((pet) => pet.id),
    providerHasHours: hours.length > 0,
    days: computeWeekSlots({ weekStart: week, now, hours, providerType: provider.type, bookedStarts }),
  };
}

/**
 * IF-011 core: re-checks the slot and inserts the appointment under the provider lock, in one
 * transaction (DATA_MODEL 7.1). Business checks on the pet, the species and the modality are the
 * caller's; this function owns the slot rule and its race (BR-011, BR-013, EDGE-007).
 *
 * @returns {Promise<{ id: string }>}
 * @throws {Outcome} NOT_FOUND (provider gone) or SLOT_UNAVAILABLE
 */
export async function bookSlot(pool, { ownerId, service, petId, startsAt, modality, visitAddress, now }) {
  return withTransaction(pool, async (client) => {
    if (!(await lockProvider(client, service.providerId))) throw new Outcome('NOT_FOUND');
    // Iteration 2 (CR-029): the service (removal takes the same provider lock) and the pet (removal
    // takes FOR UPDATE) must still be active when the appointment is inserted.
    const current = await getServiceFacts(client, service.id);
    if (!current) throw new Outcome('NOT_FOUND');
    // US-011: the provider may have edited the service (same lock) after the owner chose it. If the
    // species or the offered modality changed, the checks already made on the old facts no longer hold
    // (BR-024, BR-007); the owner reloads the booking screen and sees the current service.
    if (current.species !== service.species || current.modality !== service.modality) {
      throw new Outcome('SLOT_UNAVAILABLE');
    }
    if (!(await getOwnerPet(client, ownerId, petId, { lock: true }))) throw new Outcome('NOT_FOUND');
    const hours = await listWorkingHours(client, service.providerId);
    const bookedStarts = service.providerType === 'independent'
      ? await listScheduledStarts(client, service.providerId, startsAt, new Date(startsAt.getTime() + HOUR_MS))
      : new Set();
    if (!isSlotOffered({ startsAt, now, hours, providerType: service.providerType, bookedStarts })) {
      throw new Outcome('SLOT_UNAVAILABLE');
    }
    try {
      const result = await client.query(
        `INSERT INTO appointment
           (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [ownerId, petId, service.id, service.providerId, service.providerType, startsAt, modality, visitAddress ?? null],
      );
      return { id: result.rows[0].id };
    } catch (error) {
      // The partial unique index is the last line of defense for an independent veterinarian's slot.
      if (error?.code === '23505' && error?.constraint === 'appointment_independent_slot_uq') {
        throw new Outcome('SLOT_UNAVAILABLE');
      }
      throw error;
    }
  });
}

/** IF-012: the signed-in owner's current appointments, including cancelled ones (AC-055, AC-056, AC-087). */
export async function listOwnerAppointments(db, { ownerId, now }) {
  const result = await db.query(
    `SELECT id, pet_id, service_id, starts_at, status, modality, visit_address
       FROM appointment
      WHERE owner_id = $1`,
    [ownerId],
  );

  const appointments = await Promise.all(result.rows.map(async (row) => {
    const [service, pet] = await Promise.all([
      getServiceFacts(db, row.service_id, { includeRemoved: true }), // history (CR-029)
      getOwnerPet(db, ownerId, row.pet_id, { includeRemoved: true }),
    ]);
    if (!service || !pet) throw new Outcome('NOT_FOUND');
    const provider = await getProviderFacts(db, service.providerId);
    if (!provider) throw new Outcome('NOT_FOUND');

    const startsAt = new Date(row.starts_at);
    const address = row.modality === 'home' ? row.visit_address : provider.address;
    if (!address) throw new Error(`Appointment ${row.id} has no place address`);

    return {
      id: row.id,
      startsAt: toBogotaIso(startsAt),
      endsAt: toBogotaIso(new Date(startsAt.getTime() + HOUR_MS)),
      status: row.status,
      upcoming: startsAt.getTime() > now.getTime(),
      service: { id: service.id, name: service.name },
      modality: row.modality,
      pet: { id: pet.id, name: pet.name },
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        ...(provider.contactPhone ? { contactPhone: provider.contactPhone } : {}),
      },
      place: { kind: row.modality, address },
    };
  }));

  return appointments.sort((left, right) => {
    if (left.upcoming !== right.upcoming) return left.upcoming ? -1 : 1;
    const leftTime = new Date(left.startsAt).getTime();
    const rightTime = new Date(right.startsAt).getTime();
    return (left.upcoming ? leftTime - rightTime : rightTime - leftTime) || left.id.localeCompare(right.id);
  });
}

/** IF-013: the signed-in provider's appointments, including cancelled ones (AC-063, AC-064, AC-088). */
export async function listProviderAppointments(db, { providerId, now }) {
  const result = await db.query(
    `SELECT id, owner_id, pet_id, service_id, starts_at, status, modality, visit_address
       FROM appointment
      WHERE provider_id = $1`,
    [providerId],
  );

  const appointments = await Promise.all(result.rows.map(async (row) => {
    const [service, pet, ownerName] = await Promise.all([
      getServiceFacts(db, row.service_id, { includeRemoved: true }), // history (CR-029)
      getOwnerPet(db, row.owner_id, row.pet_id, { includeRemoved: true }),
      getOwnerName(db, row.owner_id),
    ]);
    if (!service || !pet || !ownerName) throw new Outcome('NOT_FOUND');
    if (row.modality === 'home' && !row.visit_address) {
      throw new Error(`Home appointment ${row.id} has no visit address`);
    }

    const startsAt = new Date(row.starts_at);
    return {
      id: row.id,
      startsAt: toBogotaIso(startsAt),
      endsAt: toBogotaIso(new Date(startsAt.getTime() + HOUR_MS)),
      status: row.status,
      upcoming: startsAt.getTime() > now.getTime(),
      service: { id: service.id, name: service.name },
      modality: row.modality,
      pet: { id: pet.id, name: pet.name },
      ownerName,
      ...(row.modality === 'home' ? { visitAddress: row.visit_address } : {}),
    };
  }));

  return appointments.sort((left, right) => {
    if (left.upcoming !== right.upcoming) return left.upcoming ? -1 : 1;
    const leftTime = new Date(left.startsAt).getTime();
    const rightTime = new Date(right.startsAt).getTime();
    return (left.upcoming ? leftTime - rightTime : rightTime - leftTime) || left.id.localeCompare(right.id);
  });
}

export function createBookingRouter({ db, guard, clock }) {
  const router = Router();

  router.get('/services/:serviceId/booking-context', guard({ role: 'owner' }), async (req, res) => {
    if (!isUuid(req.params.serviceId)) throw new Outcome('NOT_FOUND');
    const week = validateWeekStart(req.query.weekStart);
    if (week.fields) throw validationFailed(week.fields);
    res.json(await getBookingContext(db, {
      ownerId: req.session.accountId,
      serviceId: req.params.serviceId.toLowerCase(),
      weekStart: week.value,
      now: clock.now(),
    }));
  });

  router.get('/owner/appointments', guard({ role: 'owner' }), async (req, res) => {
    res.json({
      appointments: await listOwnerAppointments(db, {
        ownerId: req.session.accountId,
        now: clock.now(),
      }),
    });
  });

  router.post('/owner/appointments/:appointmentId/cancel', guard({ role: 'owner' }), async (req, res) => {
    if (!isUuid(req.params.appointmentId)) throw new Outcome('NOT_FOUND');
    const ownerId = req.session.accountId;
    const now = clock.now();
    const { id } = await cancelOwnerAppointment(db, {
      ownerId,
      appointmentId: req.params.appointmentId.toLowerCase(),
      now,
    });
    const appointment = (await listOwnerAppointments(db, { ownerId, now })).find((item) => item.id === id);
    if (!appointment) throw new Error(`Cancelled appointment ${id} is missing from the owner's appointment list`);
    res.json(appointment);
  });

  router.get('/owner/appointments/:appointmentId/reschedule-context', guard({ role: 'owner' }), async (req, res) => {
    if (!isUuid(req.params.appointmentId)) throw new Outcome('NOT_FOUND');
    const week = validateWeekStart(req.query.weekStart);
    if (week.fields) throw validationFailed(week.fields);
    res.json(await getOwnerRescheduleContext(db, {
      ownerId: req.session.accountId,
      appointmentId: req.params.appointmentId.toLowerCase(),
      weekStart: week.value,
      now: clock.now(),
    }));
  });

  router.post('/owner/appointments/:appointmentId/reschedule', guard({ role: 'owner' }), async (req, res) => {
    if (!isUuid(req.params.appointmentId)) throw new Outcome('NOT_FOUND');
    const validation = validateRescheduleRequest(req.body);
    if (validation.fields) throw validationFailed(validation.fields);
    const ownerId = req.session.accountId;
    const now = clock.now();
    const { id } = await rescheduleOwnerAppointment(db, {
      ownerId,
      appointmentId: req.params.appointmentId.toLowerCase(),
      startsAt: validation.value.startsAt,
      now,
    });
    const appointment = (await listOwnerAppointments(db, { ownerId, now })).find((item) => item.id === id);
    if (!appointment) throw new Error(`Rescheduled appointment ${id} is missing from the owner's appointment list`);
    res.json(appointment);
  });

  router.get('/provider/appointments/:appointmentId/reschedule-context', guard({ role: 'provider' }), async (req, res) => {
    if (!isUuid(req.params.appointmentId)) throw new Outcome('NOT_FOUND');
    const week = validateWeekStart(req.query.weekStart);
    if (week.fields) throw validationFailed(week.fields);
    res.json(await getProviderRescheduleContext(db, {
      providerId: req.session.accountId,
      appointmentId: req.params.appointmentId.toLowerCase(),
      weekStart: week.value,
      now: clock.now(),
    }));
  });

  router.post('/provider/appointments/:appointmentId/reschedule', guard({ role: 'provider' }), async (req, res) => {
    if (!isUuid(req.params.appointmentId)) throw new Outcome('NOT_FOUND');
    const validation = validateRescheduleRequest(req.body);
    if (validation.fields) throw validationFailed(validation.fields);
    const providerId = req.session.accountId;
    const now = clock.now();
    const { id } = await rescheduleProviderAppointment(db, {
      providerId,
      appointmentId: req.params.appointmentId.toLowerCase(),
      startsAt: validation.value.startsAt,
      now,
    });
    const appointment = (await listProviderAppointments(db, { providerId, now })).find((item) => item.id === id);
    if (!appointment) throw new Error(`Rescheduled appointment ${id} is missing from the provider's appointment list`);
    res.json(appointment);
  });

  router.get('/provider/appointments', guard({ role: 'provider' }), async (req, res) => {
    res.json({
      appointments: await listProviderAppointments(db, {
        providerId: req.session.accountId,
        now: clock.now(),
      }),
    });
  });

  router.post('/provider/appointments/:appointmentId/cancel', guard({ role: 'provider' }), async (req, res) => {
    if (!isUuid(req.params.appointmentId)) throw new Outcome('NOT_FOUND');
    const providerId = req.session.accountId;
    const now = clock.now();
    const { id } = await cancelProviderAppointment(db, {
      providerId,
      appointmentId: req.params.appointmentId.toLowerCase(),
      now,
    });
    const appointment = (await listProviderAppointments(db, { providerId, now })).find((item) => item.id === id);
    if (!appointment) throw new Error(`Cancelled appointment ${id} is missing from the provider's appointment list`);
    res.json(appointment);
  });

  router.post('/owner/appointments', guard({ role: 'owner' }), async (req, res) => {
    const validation = validateBookingRequest(req.body);
    if (validation.fields) throw validationFailed(validation.fields);
    const { serviceId, petId, startsAt, modality: requestedModality, visitAddress } = validation.value;
    const ownerId = req.session.accountId;
    const now = clock.now();

    const service = await getServiceFacts(db, serviceId);
    if (!service) throw new Outcome('NOT_FOUND');
    const modality = resolveAppointmentModality(service.modality, requestedModality);
    if (modality === 'home' && !visitAddress) {
      throw validationFailed([{ field: 'visitAddress', reason: 'REQUIRED' }]);
    }
    if (modality === 'clinic' && visitAddress !== undefined) {
      throw validationFailed([{ field: 'visitAddress', reason: 'NOT_ALLOWED' }]);
    }

    const pets = await listOwnerPets(db, ownerId);
    if (!pets.length) throw new Outcome('NO_PETS');
    const pet = await getOwnerPet(db, ownerId, petId);
    if (!pet) throw new Outcome('NOT_FOUND');
    if (pet.species !== service.species) throw new Outcome('PET_NOT_ELIGIBLE');

    const provider = await getProviderFacts(db, service.providerId);
    if (!provider) throw new Outcome('NOT_FOUND');
    const { id } = await bookSlot(db, {
      ownerId,
      service,
      petId: pet.id,
      startsAt,
      modality,
      visitAddress: modality === 'home' ? visitAddress : undefined,
      now,
    });

    res.status(201).json({
      id,
      startsAt: toBogotaIso(startsAt),
      endsAt: toBogotaIso(new Date(startsAt.getTime() + HOUR_MS)),
      status: 'scheduled',
      upcoming: startsAt.getTime() > now.getTime(),
      service: { id: service.id, name: service.name },
      modality,
      pet: { id: pet.id, name: pet.name },
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        ...(provider.contactPhone ? { contactPhone: provider.contactPhone } : {}),
      },
      place: { kind: modality, address: modality === 'home' ? visitAddress : provider.address },
    });
  });

  return router;
}
