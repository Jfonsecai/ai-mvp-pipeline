// P07.1 — Booking and appointments (US-019, US-020, US-021, US-024) plus the schedule-change rules
// of US-009 (AC-025, AC-026, AC-081), black-box over HTTP with the real application and PostgreSQL.
// Expected behavior comes from REQUIREMENTS_V3.md (AC-046..AC-056, AC-063/064, AC-081, AC-087/088,
// AC-108/109) and the business rules BR-010..BR-015, BR-024, BR-033..BR-035.
//
// Fixed clock: Monday 2026-10-12 10:00 Bogota (15:00Z). Office hours are Monday-Friday 08-17.
// Test ids: TEST-BK-nnn.
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, DEFAULT_NOW, OFFICE_HOURS, SKIP, weekOf } from '../support/harness.js';

let h;
// Long session lifetimes: these tests move the clock by hours, and session expiry has its own tests (AC-114).
before(async () => {
  if (!SKIP) h = await createHarness({ config: { SESSION_IDLE_MINUTES: '100000', SESSION_ABSOLUTE_HOURS: '100000' } });
});
after(async () => { if (h) await h.close(); });
beforeEach(() => { if (h) h.clock.set(DEFAULT_NOW); });

const hasField = (response, field, reason) =>
  (response.body.fields ?? []).some((entry) => entry.field === field && (reason === undefined || entry.reason === reason));
const BOGOTA = (date, hour) => `${date}T${String(hour).padStart(2, '0')}:00:00-05:00`;
const slotsOn = (ctx, date) => ctx.body.days.find((day) => day.date === date).slots;

/** A clinic or independent vet with office hours, one dog service and an owner with a dog. */
async function scenario(providerType = 'clinic', { serviceOverrides = {}, hours } = {}) {
  const provider = await h.setupProvider(providerType, hours === undefined ? {} : { hours });
  const service = await h.publishService(provider, serviceOverrides);
  const owner = await h.signUpOwner();
  return { provider, service, owner };
}

describe('US-019 slots offered (AC-046, AC-051, AC-026, AC-025)', { skip: SKIP }, () => {
  test('TEST-BK-001 AC-046 AC-025: slots are one-hour starts only inside the working days and hours, for the whole week', async () => {
    const { service, owner } = await scenario();
    const ctx = await h.context(owner, service.id);
    assert.equal(ctx.status, 200);
    assert.equal(ctx.body.weekStart, '2026-10-12');
    assert.equal(ctx.body.days.length, 7);
    // Tuesday: 08:00..16:00 are valid starts (an appointment lasts one hour and must end by 17:00).
    assert.deepEqual(slotsOn(ctx, '2026-10-13'), [8, 9, 10, 11, 12, 13, 14, 15, 16].map((hour) => BOGOTA('2026-10-13', hour)));
    assert.deepEqual(slotsOn(ctx, '2026-10-17'), [], 'Saturday is not a working day');
    assert.deepEqual(slotsOn(ctx, '2026-10-18'), [], 'Sunday is not a working day');
  });

  test('TEST-BK-002 AC-051: slots whose start time is not in the future are not offered', async () => {
    const { service, owner } = await scenario();
    // Now is Monday 10:00: 08:00, 09:00 and 10:00 (starting right now) are gone; 11:00 is offered.
    const ctx = await h.context(owner, service.id);
    assert.deepEqual(slotsOn(ctx, '2026-10-12'), [11, 12, 13, 14, 15, 16].map((hour) => BOGOTA('2026-10-12', hour)));

    h.clock.set('2026-10-12T21:59:59Z'); // 16:59:59 Bogota
    assert.deepEqual(slotsOn(await h.context(owner, service.id), '2026-10-12'), [], 'all of Monday has started');
    h.clock.set('2026-10-12T15:59:59Z'); // 10:59:59 -> 11:00 is still one second away
    assert.deepEqual(slotsOn(await h.context(owner, service.id), '2026-10-12')[0], BOGOTA('2026-10-12', 11));
    h.clock.set('2026-10-12T16:00:00Z'); // exactly 11:00 -> no longer in the future
    assert.deepEqual(slotsOn(await h.context(owner, service.id), '2026-10-12')[0], BOGOTA('2026-10-12', 12));
  });

  test('TEST-BK-003 AC-026: a provider with no working hours offers no slots in any week', async () => {
    const { service, owner } = await scenario('clinic', { hours: null });
    for (const week of ['2026-10-12', '2026-10-19', '2026-11-02']) {
      const ctx = await h.context(owner, service.id, week);
      assert.equal(ctx.status, 200);
      assert.equal(ctx.body.providerHasHours, false);
      assert.deepEqual(h.allSlots(ctx), [], week);
    }
    const attempt = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9) });
    assert.equal(attempt.status, 409);
    assert.equal(attempt.body.code, 'SLOT_UNAVAILABLE');
  });

  test('TEST-BK-004 AC-025: different hours per day are respected, including a late shift ending at midnight (Bogota day, not UTC day)', async () => {
    const hours = weekOf({ 2: [9, 11], 4: [22, 24] });
    const { service, owner } = await scenario('clinic', { hours });
    const ctx = await h.context(owner, service.id);
    assert.deepEqual(slotsOn(ctx, '2026-10-13'), [BOGOTA('2026-10-13', 9), BOGOTA('2026-10-13', 10)]);
    assert.deepEqual(slotsOn(ctx, '2026-10-15'), [BOGOTA('2026-10-15', 22), BOGOTA('2026-10-15', 23)]);
    assert.deepEqual(slotsOn(ctx, '2026-10-14'), []);
    // 23:00 Bogota Thursday is 04:00Z Friday: booking by its UTC form must work and be Thursday's slot.
    const booked = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: '2026-10-16T04:00:00Z' });
    assert.equal(booked.status, 201, booked.text);
    assert.equal(booked.body.startsAt, BOGOTA('2026-10-15', 23));
    assert.equal(booked.body.endsAt, '2026-10-16T00:00:00-05:00');
  });

  test('TEST-BK-005 AC-046: the owner can look at other weeks; weekStart must be a real Monday', async () => {
    const { service, owner } = await scenario();
    const next = await h.context(owner, service.id, '2026-10-19');
    assert.equal(next.status, 200);
    assert.equal(next.body.weekStart, '2026-10-19');
    assert.equal(slotsOn(next, '2026-10-19').length, 9, 'a future Monday offers every hour 08-16');

    for (const weekStart of ['2026-10-13', '2026-02-30', 'tomorrow', '2026-10-12T00:00:00']) {
      const response = await h.context(owner, service.id, weekStart);
      assert.equal(response.status, 422, weekStart);
      assert.ok(hasField(response, 'weekStart'), weekStart);
    }
    const unknownService = await h.context(owner, '00000000-0000-4000-8000-000000000000');
    assert.equal(unknownService.status, 404);
  });
});

describe('US-019 booking (AC-047..AC-050, AC-108, AC-109, AC-048)', { skip: SKIP }, () => {
  test('TEST-BK-010 AC-047: booking schedules immediately and appears at once in the owner\'s and the provider\'s appointments', async () => {
    const { provider, service, owner } = await scenario();
    const startsAt = BOGOTA('2026-10-13', 9);
    const booked = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt });
    assert.equal(booked.status, 201, booked.text);
    assert.equal(booked.body.status, 'scheduled', 'no provider confirmation step');
    assert.equal(booked.body.startsAt, startsAt);
    assert.equal(booked.body.endsAt, BOGOTA('2026-10-13', 10), 'one-hour appointment');

    const ownerList = await h.request('GET', '/api/owner/appointments', { session: owner });
    assert.deepEqual(ownerList.body.appointments.map((a) => a.id), [booked.body.id]);
    const providerList = await h.request('GET', '/api/provider/appointments', { session: provider });
    assert.deepEqual(providerList.body.appointments.map((a) => a.id), [booked.body.id]);
  });

  test('TEST-BK-011 AC-049 BR-012: a clinic keeps offering a slot that already has appointments and accepts several owners', async () => {
    const { service, owner } = await scenario('clinic');
    const second = await h.signUpOwner();
    const third = await h.signUpOwner();
    const startsAt = BOGOTA('2026-10-13', 10);
    for (const who of [owner, second, third]) {
      const response = await h.book(who, { serviceId: service.id, petId: who.petId, startsAt });
      assert.equal(response.status, 201, response.text);
    }
    assert.ok(slotsOn(await h.context(second, service.id), '2026-10-13').includes(startsAt), 'still offered');
  });

  test('TEST-BK-012 AC-050 BR-013: an independent veterinarian\'s booked slot is no longer offered and cannot be booked again, across services', async () => {
    const { provider, service, owner } = await scenario('independent');
    const otherService = await h.publishService(provider, { name: 'Segundo servicio', priceCop: 40000 });
    const second = await h.signUpOwner();
    const startsAt = BOGOTA('2026-10-13', 10);

    assert.equal((await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt, visitAddress: 'Calle 5 # 5-5' })).status, 201);
    for (const id of [service.id, otherService.id]) {
      assert.ok(!slotsOn(await h.context(second, id), '2026-10-13').includes(startsAt), 'slot hidden for every service of the provider');
    }
    const again = await h.book(second, { serviceId: otherService.id, petId: second.petId, startsAt, visitAddress: 'Calle 9 # 9-9' });
    assert.equal(again.status, 409);
    assert.deepEqual(again.body, { code: 'SLOT_UNAVAILABLE' });
    // neighbours are untouched
    assert.ok(slotsOn(await h.context(second, service.id), '2026-10-13').includes(BOGOTA('2026-10-13', 11)));
  });

  test('TEST-BK-013 BR-013: eight simultaneous bookings of one independent slot produce exactly one appointment', async () => {
    const { provider, service } = await scenario('independent');
    const owners = await Promise.all(Array.from({ length: 8 }, () => h.signUpOwner()));
    const startsAt = BOGOTA('2026-10-14', 14);
    const results = await Promise.all(owners.map((who) => h.book(who, {
      serviceId: service.id, petId: who.petId, startsAt, visitAddress: 'Carrera 1 # 1-1',
    })));
    assert.equal(results.filter((r) => r.status === 201).length, 1, results.map((r) => r.status).join());
    assert.ok(results.filter((r) => r.status !== 201).every((r) => r.status === 409 && r.body.code === 'SLOT_UNAVAILABLE'));
    const rows = await h.admin.query(`SELECT count(*)::int AS n FROM appointment WHERE provider_id = $1 AND status = 'scheduled'`, [provider.id]);
    assert.equal(rows.rows[0].n, 1);
  });

  test('TEST-BK-014 BR-012: eight simultaneous bookings of one clinic slot all succeed', async () => {
    const { provider, service } = await scenario('clinic');
    const owners = await Promise.all(Array.from({ length: 8 }, () => h.signUpOwner()));
    const startsAt = BOGOTA('2026-10-14', 14);
    const results = await Promise.all(owners.map((who) => h.book(who, { serviceId: service.id, petId: who.petId, startsAt })));
    assert.deepEqual(results.map((r) => r.status), Array(8).fill(201));
    const rows = await h.admin.query('SELECT count(*)::int AS n FROM appointment WHERE provider_id = $1', [provider.id]);
    assert.equal(rows.rows[0].n, 8);
  });

  test('TEST-BK-015 AC-108 AC-109: only pets of the service\'s species can be chosen, and an owner without one is told it is not allowed', async () => {
    const { service, owner } = await scenario('clinic', { serviceOverrides: { species: 'cat' } });
    const ctx = await h.context(owner, service.id);
    assert.equal(ctx.body.ownerHasPets, true);
    assert.deepEqual(ctx.body.eligiblePetIds, [], 'AC-109: pets exist but none of the cat species');
    const refused = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9) });
    assert.equal(refused.status, 422);
    assert.deepEqual(refused.body, { code: 'PET_NOT_ELIGIBLE' });

    const catId = await h.addPetDirectly(owner.id, { species: 'cat' });
    const after = await h.context(owner, service.id);
    assert.deepEqual(after.body.eligiblePetIds, [catId], 'AC-108: only the cat is selectable');
    assert.equal((await h.book(owner, { serviceId: service.id, petId: catId, startsAt: BOGOTA('2026-10-13', 9) })).status, 201);
  });

  test('TEST-BK-016 AC-048 BR-005: an owner with no registered pet cannot book and is told to register one', async () => {
    const { service, owner } = await scenario('clinic');
    const petless = await h.signUpOwner();
    await h.admin.query('DELETE FROM pet WHERE owner_id = $1', [petless.id]); // US-007 (remove pet) is not implemented
    const ctx = await h.context(petless, service.id);
    assert.equal(ctx.body.ownerHasPets, false);
    assert.deepEqual(ctx.body.eligiblePetIds, []);
    const refused = await h.book(petless, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9) });
    assert.equal(refused.status, 422);
    assert.deepEqual(refused.body, { code: 'NO_PETS' });
    assert.equal((await h.admin.query('SELECT 1 FROM appointment WHERE owner_id = $1', [petless.id])).rowCount, 0);
  });

  test('TEST-BK-017 BR-005: the pet must belong to the signed-in owner (another owner\'s pet is NOT_FOUND)', async () => {
    const { service, owner } = await scenario('clinic');
    const stranger = await h.signUpOwner();
    const response = await h.book(owner, { serviceId: service.id, petId: stranger.petId, startsAt: BOGOTA('2026-10-13', 9) });
    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { code: 'NOT_FOUND' });
    assert.equal((await h.admin.query('SELECT 1 FROM appointment')).rowCount >= 0, true);
    assert.equal((await h.admin.query('SELECT 1 FROM appointment WHERE pet_id = $1', [stranger.petId])).rowCount, 0);
  });

  test('TEST-BK-018 AC-046 AC-051: the server rechecks the slot: outside hours, past, off-the-hour and non-existent services are refused', async () => {
    const { service, owner } = await scenario('clinic');
    const base = { serviceId: service.id, petId: owner.petId };
    const cases = [
      ['before opening', { startsAt: BOGOTA('2026-10-13', 7) }, 409, 'SLOT_UNAVAILABLE'],
      ['at closing time (would end after hours)', { startsAt: BOGOTA('2026-10-13', 17) }, 409, 'SLOT_UNAVAILABLE'],
      ['a non-working day', { startsAt: BOGOTA('2026-10-17', 9) }, 409, 'SLOT_UNAVAILABLE'],
      ['already started today', { startsAt: BOGOTA('2026-10-12', 10) }, 409, 'SLOT_UNAVAILABLE'],
      ['in the past', { startsAt: BOGOTA('2026-10-05', 10) }, 409, 'SLOT_UNAVAILABLE'],
    ];
    for (const [label, extra, status, code] of cases) {
      const response = await h.book(owner, { ...base, ...extra });
      assert.equal(response.status, status, label);
      assert.equal(response.body.code, code, label);
    }
    const offHour = await h.book(owner, { ...base, startsAt: '2026-10-13T09:30:00-05:00' });
    assert.equal(offHour.status, 422);
    assert.ok(hasField(offHour, 'startsAt', 'NOT_ON_THE_HOUR'));
    const noZone = await h.book(owner, { ...base, startsAt: '2026-10-13T09:00:00' });
    assert.equal(noZone.status, 422);
    assert.ok(hasField(noZone, 'startsAt', 'INVALID_FORMAT'));
    const missing = await h.book(owner, { petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9) });
    assert.ok(hasField(missing, 'serviceId', 'REQUIRED'));
    const ghost = await h.book(owner, { ...base, serviceId: '00000000-0000-4000-8000-000000000000', startsAt: BOGOTA('2026-10-13', 9) });
    assert.equal(ghost.status, 404);
    assert.equal((await h.admin.query('SELECT 1 FROM appointment WHERE owner_id = $1', [owner.id])).rowCount, 0, 'nothing was booked');
  });

  test('TEST-BK-019 AC-050: a slot freed by the provider\'s schedule change can be offered and booked again (cancelled appointments do not block)', async () => {
    const { provider, service, owner } = await scenario('independent');
    const second = await h.signUpOwner();
    const startsAt = BOGOTA('2026-10-14', 10);
    const first = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt, visitAddress: 'Calle 1' });
    assert.equal(first.status, 201);

    // The provider stops working on Wednesdays: the appointment is cancelled automatically.
    await h.request('PUT', '/api/provider/working-hours', { session: provider, body: weekOf({ 1: [8, 17], 2: [8, 17], 4: [8, 17], 5: [8, 17] }) });
    // ...and starts working Wednesdays again.
    await h.request('PUT', '/api/provider/working-hours', { session: provider, body: weekOf(OFFICE_HOURS) });
    assert.ok(slotsOn(await h.context(second, service.id), '2026-10-14').includes(startsAt), 'slot offered again');
    const rebook = await h.book(second, { serviceId: service.id, petId: second.petId, startsAt, visitAddress: 'Calle 2' });
    assert.equal(rebook.status, 201, rebook.text);
  });
});

describe('US-020 home visits (AC-052..AC-054)', { skip: SKIP }, () => {
  test('TEST-BK-030 AC-052: a home appointment is booked with the visit address and the provider can see it', async () => {
    const { provider, service, owner } = await scenario('independent');
    const booked = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9), visitAddress: '  Carrera 15 # 80-10, Apto 302  ' });
    assert.equal(booked.status, 201, booked.text);
    assert.equal(booked.body.modality, 'home');
    assert.deepEqual(booked.body.place, { kind: 'home', address: 'Carrera 15 # 80-10, Apto 302' });

    const providerView = await h.request('GET', '/api/provider/appointments', { session: provider });
    assert.equal(providerView.body.appointments[0].visitAddress, 'Carrera 15 # 80-10, Apto 302');
    const ownerView = await h.request('GET', '/api/owner/appointments', { session: owner });
    assert.deepEqual(ownerView.body.appointments[0].place, { kind: 'home', address: 'Carrera 15 # 80-10, Apto 302' });
  });

  test('TEST-BK-031 AC-053: a home service booked without an address (absent, empty or blank) is not booked and the address is indicated', async () => {
    const { service, owner } = await scenario('independent');
    for (const visitAddress of [undefined, '', '   ']) {
      const body = { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9) };
      if (visitAddress !== undefined) body.visitAddress = visitAddress;
      const response = await h.book(owner, body);
      assert.equal(response.status, 422, JSON.stringify(visitAddress));
      assert.ok(hasField(response, 'visitAddress', 'REQUIRED'));
    }
    assert.equal((await h.admin.query('SELECT 1 FROM appointment WHERE owner_id = $1', [owner.id])).rowCount, 0);
    assert.ok(slotsOn(await h.context(owner, service.id), '2026-10-13').includes(BOGOTA('2026-10-13', 9)), 'the slot stayed free');
  });

  test('TEST-BK-032 AC-054: a clinic service offered both ways needs a chosen modality, and an address only for home', async () => {
    const { service, owner } = await scenario('clinic', { serviceOverrides: { modality: 'both' } });
    const startsAt = BOGOTA('2026-10-13', 9);
    const none = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt });
    assert.equal(none.status, 422);
    assert.ok(hasField(none, 'modality', 'REQUIRED'));

    const homeNoAddress = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt, modality: 'home' });
    assert.equal(homeNoAddress.status, 422);
    assert.ok(hasField(homeNoAddress, 'visitAddress', 'REQUIRED'));

    const clinic = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt, modality: 'clinic' });
    assert.equal(clinic.status, 201, clinic.text);
    assert.equal(clinic.body.modality, 'clinic');
    assert.equal(clinic.body.place.address, 'Calle 10 # 5-20, Cali', 'in-clinic visits show the clinic address');

    const home = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 10), modality: 'home', visitAddress: 'Calle 99 # 1-1' });
    assert.equal(home.status, 201, home.text);
    assert.equal(home.body.place.address, 'Calle 99 # 1-1');
  });

  test('TEST-BK-033 BR-007: the chosen modality must be one the service offers', async () => {
    const clinicOnly = await scenario('clinic', { serviceOverrides: { modality: 'clinic' } });
    const homeOnly = await scenario('clinic', { serviceOverrides: { modality: 'home' } });
    const startsAt = BOGOTA('2026-10-13', 9);
    const wrongHome = await h.book(clinicOnly.owner, { serviceId: clinicOnly.service.id, petId: clinicOnly.owner.petId, startsAt, modality: 'home', visitAddress: 'Calle 1' });
    assert.equal(wrongHome.status, 422);
    assert.ok(hasField(wrongHome, 'modality', 'NOT_ALLOWED'));
    const wrongClinic = await h.book(homeOnly.owner, { serviceId: homeOnly.service.id, petId: homeOnly.owner.petId, startsAt, modality: 'clinic' });
    assert.equal(wrongClinic.status, 422);
    assert.ok(hasField(wrongClinic, 'modality', 'NOT_ALLOWED'));
    const implicitHome = await h.book(homeOnly.owner, { serviceId: homeOnly.service.id, petId: homeOnly.owner.petId, startsAt, visitAddress: 'Calle 1' });
    assert.equal(implicitHome.status, 201, 'a home-only service needs no explicit modality');
  });
});

describe('AC-081 consistency under concurrency (CR-009)', { skip: SKIP }, () => {
  test('TEST-BK-050 AC-081 BR-011: bookings racing with a working-hours change never leave a scheduled appointment outside the final hours', async () => {
    for (let round = 0; round < 3; round += 1) {
      const { provider, service } = await scenario('clinic');
      const owners = await Promise.all(Array.from({ length: 6 }, () => h.signUpOwner()));
      // Wednesday 14:00-15:00 is inside the initial hours (08-17) and outside the new ones (08-12).
      const startsAt = BOGOTA('2026-10-14', 14);
      const changeHours = h.request('PUT', '/api/provider/working-hours', {
        session: provider, body: weekOf({ 1: [8, 12], 2: [8, 12], 3: [8, 12], 4: [8, 12], 5: [8, 12] }),
      });
      const bookings = owners.map((who) => h.book(who, { serviceId: service.id, petId: who.petId, startsAt }));
      const [change, ...results] = await Promise.all([changeHours, ...bookings]);
      assert.equal(change.status, 200);
      assert.ok(results.every((r) => [201, 409].includes(r.status)), results.map((r) => r.status).join());
      const stray = await h.admin.query(
        `SELECT id FROM appointment WHERE provider_id = $1 AND status = 'scheduled' AND starts_at = $2`,
        [provider.id, new Date(Date.parse('2026-10-14T19:00:00Z'))],
      );
      assert.equal(stray.rowCount, 0, `round ${round}: a scheduled appointment survived outside the new hours`);
      const created = results.filter((r) => r.status === 201).length;
      const cancelled = await h.admin.query(`SELECT count(*)::int AS n FROM appointment WHERE provider_id = $1 AND status = 'cancelled'`, [provider.id]);
      assert.equal(cancelled.rows[0].n, created, 'every appointment that did get booked was cancelled by the change');
    }
  });
});

describe('US-021 / US-024 appointment lists (AC-055, AC-056, AC-063, AC-064, AC-087, AC-088)', { skip: SKIP }, () => {
  test('TEST-BK-040 AC-055 AC-063: each appointment shows service, provider/owner, pet, date and time, modality, status (and the address for home visits)', async () => {
    const { provider, service, owner } = await scenario('clinic', { serviceOverrides: { modality: 'both', name: 'Control completo' } });
    await h.request('PUT', '/api/provider/profile', { session: provider, body: { publicName: 'Clínica Vista', contactPhone: '3001112233', contactEmail: 'vista@clinica.test', address: 'Calle 10 # 5-20, Cali' } });
    await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9), modality: 'clinic' });
    await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-14', 15), modality: 'home', visitAddress: 'Diagonal 4 # 4-4' });

    const mine = (await h.request('GET', '/api/owner/appointments', { session: owner })).body.appointments;
    assert.equal(mine.length, 2);
    assert.deepEqual(mine.map((a) => a.startsAt), [BOGOTA('2026-10-13', 9), BOGOTA('2026-10-14', 15)], 'soonest upcoming first');
    const [clinicVisit, homeVisit] = mine;
    assert.equal(clinicVisit.service.name, 'Control completo');
    assert.equal(clinicVisit.provider.name, 'Clínica Vista');
    assert.equal(clinicVisit.pet.name, 'Firulais');
    assert.equal(clinicVisit.status, 'scheduled');
    assert.equal(clinicVisit.modality, 'clinic');
    assert.deepEqual(clinicVisit.place, { kind: 'clinic', address: 'Calle 10 # 5-20, Cali' });
    assert.equal(homeVisit.modality, 'home');
    assert.deepEqual(homeVisit.place, { kind: 'home', address: 'Diagonal 4 # 4-4' });
    assert.ok(mine.every((a) => a.upcoming === true));

    const theirs = (await h.request('GET', '/api/provider/appointments', { session: provider })).body.appointments;
    assert.equal(theirs.length, 2);
    assert.equal(theirs[0].ownerName, 'Ana Dueña');
    assert.equal(theirs[0].pet.name, 'Firulais');
    assert.equal(theirs[0].service.name, 'Control completo');
    assert.equal('visitAddress' in theirs[0], false, 'clinic visits carry no visit address');
    assert.equal(theirs[1].visitAddress, 'Diagonal 4 # 4-4');
    assert.ok(theirs.every((a) => !('ownerEmail' in a) && !JSON.stringify(a).includes('@example.test')), 'no owner e-mail leaks to the provider');
  });

  test('TEST-BK-041 AC-064 AC-055: lists contain only the signed-in party\'s appointments', async () => {
    const a = await scenario('clinic');
    const b = await scenario('clinic');
    const aOwner2 = await h.signUpOwner();
    await h.book(a.owner, { serviceId: a.service.id, petId: a.owner.petId, startsAt: BOGOTA('2026-10-13', 9) });
    await h.book(aOwner2, { serviceId: a.service.id, petId: aOwner2.petId, startsAt: BOGOTA('2026-10-13', 10) });
    await h.book(b.owner, { serviceId: b.service.id, petId: b.owner.petId, startsAt: BOGOTA('2026-10-13', 9) });

    const providerA = (await h.request('GET', '/api/provider/appointments', { session: a.provider })).body.appointments;
    assert.equal(providerA.length, 2);
    const providerB = (await h.request('GET', '/api/provider/appointments', { session: b.provider })).body.appointments;
    assert.equal(providerB.length, 1);
    assert.equal(providerB[0].ownerName, 'Ana Dueña');
    assert.equal((await h.request('GET', '/api/owner/appointments', { session: a.owner })).body.appointments.length, 1);
    assert.equal((await h.request('GET', '/api/owner/appointments', { session: aOwner2 })).body.appointments.length, 1);
    const empty = await h.signUpOwner();
    assert.deepEqual((await h.request('GET', '/api/owner/appointments', { session: empty })).body, { appointments: [] });
  });

  test('TEST-BK-042 AC-081 AC-087 AC-088: changing hours cancels exactly the upcoming appointments outside them, shown as cancelled to both parties', async () => {
    const { provider, service, owner } = await scenario('clinic');
    const other = await h.signUpOwner();
    const keep = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9) });          // Tue 09 stays inside
    const lateTue = await h.book(other, { serviceId: service.id, petId: other.petId, startsAt: BOGOTA('2026-10-13', 15) });       // Tue 15 falls outside
    const wed = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-14', 10) });           // Wed not a working day
    const edge = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-15', 11) });          // Thu 11-12 ends exactly at the new end
    const overEdge = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-16', 12) });      // Fri 12-13 ends after the new end
    for (const response of [keep, lateTue, wed, edge, overEdge]) assert.equal(response.status, 201, response.text);

    const newHours = weekOf({ 2: [8, 12], 4: [8, 12], 5: [8, 12] });
    assert.equal((await h.request('PUT', '/api/provider/working-hours', { session: provider, body: newHours })).status, 200);

    const status = async (id) => (await h.admin.query('SELECT status, cancelled_at FROM appointment WHERE id = $1', [id])).rows[0];
    assert.equal((await status(keep.body.id)).status, 'scheduled');
    assert.equal((await status(edge.body.id)).status, 'scheduled', 'ends exactly at the new closing hour: still inside');
    for (const cancelled of [lateTue, wed, overEdge]) {
      const row = await status(cancelled.body.id);
      assert.equal(row.status, 'cancelled', cancelled.body.startsAt);
      assert.ok(row.cancelled_at, 'cancellation time recorded');
    }

    const providerView = (await h.request('GET', '/api/provider/appointments', { session: provider })).body.appointments;
    assert.equal(providerView.length, 5, 'cancelled appointments stay visible');
    const byId = new Map(providerView.map((a) => [a.id, a.status]));
    assert.equal(byId.get(lateTue.body.id), 'cancelled');
    assert.equal(byId.get(keep.body.id), 'scheduled');
    const ownerView = (await h.request('GET', '/api/owner/appointments', { session: other })).body.appointments;
    assert.deepEqual(ownerView.map((a) => a.status), ['cancelled'], 'the other owner sees it as cancelled');
    const first = (await h.request('GET', '/api/owner/appointments', { session: owner })).body.appointments;
    assert.equal(first.filter((a) => a.status === 'cancelled').length, 2);
  });

  test('TEST-BK-043 AC-081: appointments that already took place are left alone when hours change', async () => {
    const { provider, service, owner } = await scenario('clinic');
    const booked = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9) });
    h.clock.set('2026-10-13T20:00:00Z'); // Tuesday afternoon: the 09:00 appointment is in the past
    await h.request('PUT', '/api/provider/working-hours', { session: provider, body: weekOf({ 5: [8, 12] }) });
    const row = (await h.admin.query('SELECT status FROM appointment WHERE id = $1', [booked.body.id])).rows[0];
    assert.equal(row.status, 'scheduled', 'history is not rewritten');
    const view = (await h.request('GET', '/api/owner/appointments', { session: owner })).body.appointments;
    assert.equal(view[0].upcoming, false);
  });

  test('TEST-BK-044 AC-055: upcoming appointments come first (soonest first), then past ones (most recent first)', async () => {
    const { service, owner, provider } = await scenario('clinic');
    const early = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-13', 9) });
    const late = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-16', 9) });
    const middle = await h.book(owner, { serviceId: service.id, petId: owner.petId, startsAt: BOGOTA('2026-10-14', 9) });
    h.clock.set('2026-10-14T16:00:00Z'); // Wed 11:00: Tuesday 09:00 and Wednesday 09:00 are past
    const list = (await h.request('GET', '/api/owner/appointments', { session: owner })).body.appointments;
    assert.deepEqual(list.map((a) => a.id), [late.body.id, middle.body.id, early.body.id]);
    assert.deepEqual(list.map((a) => a.upcoming), [true, false, false]);
    const providerList = (await h.request('GET', '/api/provider/appointments', { session: provider })).body.appointments;
    assert.deepEqual(providerList.map((a) => a.id), [late.body.id, middle.body.id, early.body.id]);
  });
});
