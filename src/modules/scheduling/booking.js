// COMP-009 Scheduling — IF-010 booking context and IF-011 booking (US-019).
//
// Scope of US-019: slots and in-clinic booking. A visit at the owner's home needs the visit address
// and the modality choice of US-020 (AC-052 to AC-054), so a request that would create a home
// appointment is refused here with NOT_ALLOWED until that story lands. `bookSlot` itself is
// modality-agnostic (it takes the modality and the address as data), so US-020 reuses the same
// locked, atomic booking transaction.
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';
import { withTransaction } from '../../shared/transaction.js';
import { CHOSEN_MODALITIES } from '../../shared/enums.js';
import { isUuid } from '../../shared/ids.js';
import { addDays, bogotaInstant, bogotaParts, isLocalDate, isoWeekday, mondayOf, toBogotaIso } from '../../shared/clock.js';
import { getProviderFacts, lockProvider } from '../provider/profile.js';
import { listWorkingHours } from '../provider/working-hours.js';
import { getServiceFacts } from '../catalog/offerings.js';
import { getOwnerPet, listOwnerPets } from '../pets/owner-pet.js';
import { computeWeekSlots, isSlotOffered } from './slots.js';

const BOOKING_FIELDS = new Set(['serviceId', 'petId', 'startsAt', 'modality', 'visitAddress']);
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
  // The visit address belongs to home visits (US-020); it is not accepted by this increment.
  if (input.visitAddress !== undefined && !fields.some((f) => f.field === 'visitAddress')) {
    fields.push({ field: 'visitAddress', reason: 'NOT_ALLOWED' });
  }

  if (fields.length) return { fields };
  return { value: { serviceId: input.serviceId.toLowerCase(), petId: input.petId.toLowerCase(), startsAt, modality } };
}

/**
 * The modality of an appointment that this increment can create: at the clinic only (BR-007).
 * A service offered at home, or a home choice, needs US-020.
 */
export function resolveClinicModality(serviceModality, requested) {
  if (serviceModality === 'clinic') {
    if (requested === undefined || requested === 'clinic') return 'clinic';
  } else if (serviceModality === 'both') {
    if (requested === 'clinic') return 'clinic';
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

  router.post('/owner/appointments', guard({ role: 'owner' }), async (req, res) => {
    const validation = validateBookingRequest(req.body);
    if (validation.fields) throw validationFailed(validation.fields);
    const { serviceId, petId, startsAt, modality: requestedModality } = validation.value;
    const ownerId = req.session.accountId;
    const now = clock.now();

    const service = await getServiceFacts(db, serviceId);
    if (!service) throw new Outcome('NOT_FOUND');
    const modality = resolveClinicModality(service.modality, requestedModality);

    const pets = await listOwnerPets(db, ownerId);
    if (!pets.length) throw new Outcome('NO_PETS');
    const pet = await getOwnerPet(db, ownerId, petId);
    if (!pet) throw new Outcome('NOT_FOUND');
    if (pet.species !== service.species) throw new Outcome('PET_NOT_ELIGIBLE');

    const provider = await getProviderFacts(db, service.providerId);
    if (!provider) throw new Outcome('NOT_FOUND');
    const { id } = await bookSlot(db, { ownerId, service, petId: pet.id, startsAt, modality, now });

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
      place: { kind: modality, address: provider.address },
    });
  });

  return router;
}
