// P07.1 — Unit tests of the pure scheduling, validation and calendar functions, written from the
// requirements (BR-010..BR-013, AC-046, AC-050, AC-051, AC-080, AC-107, AC-054) and not from the
// current code. They need no database and always run.
// Test ids: TEST-UT-nnn.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { computeWeekSlots, isSlotOffered } from '../../../../src/modules/scheduling/slots.js';
import { resolveAppointmentModality, validateBookingRequest, validateWeekStart } from '../../../../src/modules/scheduling/booking.js';
import { validateWeeklyHours } from '../../../../src/modules/provider/working-hours.js';
import { validatePublishProduct, validatePublishService } from '../../../../src/modules/catalog/offerings.js';
import { validateOwnerSignUp, validateProviderSignUp } from '../../../../src/modules/identity/sign-up.js';
import { validateSearchQuery, validateSpeciesFilter } from '../../../../src/modules/search/offerings.js';
import { addDays, bogotaInstant, bogotaParts, isLocalDate, isoWeekday, mondayOf, toBogotaIso } from '../../../../src/shared/clock.js';
import { Outcome, OUTCOME_HTTP_STATUS } from '../../../../src/shared/outcomes.js';
import { rejectNulCharacters } from '../../../../src/http/middleware.js';

const SERVICE = '11111111-1111-4111-8111-111111111111';
const PET = '22222222-2222-4222-8222-222222222222';
const reasons = (result) => (result.fields ?? []).map((f) => `${f.field}:${f.reason}`);

describe('BR-010 / BR-011 / BR-012 / BR-013 — which slots are offered', () => {
  const NOW = new Date('2026-10-12T15:00:00Z'); // Monday 10:00 Bogota
  const hours = [{ weekday: 2, startHour: 8, endHour: 12 }]; // Tuesday 08-12
  const offer = (startsAt, extra = {}) => isSlotOffered({
    startsAt: new Date(startsAt), now: NOW, hours, providerType: 'clinic', bookedStarts: new Set(), ...extra,
  });

  test('TEST-UT-001 BR-011: an hour-long appointment must fit entirely inside the working hours', () => {
    assert.equal(offer('2026-10-13T08:00:00-05:00'), true, 'first hour');
    assert.equal(offer('2026-10-13T11:00:00-05:00'), true, 'last hour ends exactly at closing');
    assert.equal(offer('2026-10-13T12:00:00-05:00'), false, 'starts at closing time');
    assert.equal(offer('2026-10-13T07:00:00-05:00'), false, 'before opening');
    assert.equal(offer('2026-10-14T09:00:00-05:00'), false, 'other weekday');
    assert.equal(offer('2026-10-13T09:30:00-05:00'), false, 'not on the hour');
  });

  test('TEST-UT-002 BR-010: the weekday and hour are those of Bogota, not of UTC', () => {
    const lateShift = [{ weekday: 4, startHour: 22, endHour: 24 }]; // Thursday 22-24 Bogota
    const args = { now: NOW, hours: lateShift, providerType: 'clinic', bookedStarts: new Set() };
    assert.equal(isSlotOffered({ ...args, startsAt: new Date('2026-10-16T03:00:00Z') }), true, '22:00 Thursday = 03:00Z Friday');
    assert.equal(isSlotOffered({ ...args, startsAt: new Date('2026-10-16T04:00:00Z') }), true, '23:00 Thursday = 04:00Z Friday');
    assert.equal(isSlotOffered({ ...args, startsAt: new Date('2026-10-16T05:00:00Z') }), false, '00:00 Friday is not Thursday');
    assert.equal(isSlotOffered({ ...args, startsAt: new Date('2026-10-15T22:00:00Z') }), false, '17:00 Thursday');
  });

  test('TEST-UT-003 AC-051: a start that is not strictly after now is not offered', () => {
    const today = [{ weekday: 1, startHour: 8, endHour: 17 }];
    const args = { hours: today, providerType: 'clinic', bookedStarts: new Set() };
    assert.equal(isSlotOffered({ ...args, now: new Date('2026-10-12T15:59:59.999Z'), startsAt: bogotaInstant('2026-10-12', 11) }), true);
    assert.equal(isSlotOffered({ ...args, now: new Date('2026-10-12T16:00:00.000Z'), startsAt: bogotaInstant('2026-10-12', 11) }), false);
    assert.equal(isSlotOffered({ ...args, now: new Date('2026-10-12T16:00:00.001Z'), startsAt: bogotaInstant('2026-10-12', 11) }), false);
  });

  test('TEST-UT-004 BR-012 / BR-013: clinics ignore existing appointments; independent veterinarians do not offer a taken slot', () => {
    const startsAt = '2026-10-13T09:00:00-05:00';
    const booked = new Set([new Date(startsAt).getTime()]);
    assert.equal(offer(startsAt, { providerType: 'clinic', bookedStarts: booked }), true);
    assert.equal(offer(startsAt, { providerType: 'independent', bookedStarts: booked }), false);
    assert.equal(offer('2026-10-13T10:00:00-05:00', { providerType: 'independent', bookedStarts: booked }), true, 'only the taken start is hidden');
  });

  test('TEST-UT-005 AC-026: no hours means no slots', () => {
    const days = computeWeekSlots({ weekStart: '2026-10-19', now: NOW, hours: [], providerType: 'clinic', bookedStarts: new Set() });
    assert.equal(days.length, 7);
    assert.ok(days.every((day) => day.slots.length === 0));
  });

  test('TEST-UT-006 AC-046: computeWeekSlots yields 7 consecutive dates and exactly the open one-hour starts, as Bogota ISO strings', () => {
    const days = computeWeekSlots({
      weekStart: '2026-10-19', now: NOW, providerType: 'clinic', bookedStarts: new Set(),
      hours: [{ weekday: 1, startHour: 8, endHour: 10 }, { weekday: 7, startHour: 0, endHour: 24 }],
    });
    assert.deepEqual(days.map((d) => d.date), ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
    assert.deepEqual(days[0].slots, ['2026-10-19T08:00:00-05:00', '2026-10-19T09:00:00-05:00']);
    assert.equal(days[6].slots.length, 24);
    assert.equal(days[6].slots[23], '2026-10-25T23:00:00-05:00');
    assert.ok(days.slice(1, 6).every((d) => d.slots.length === 0));
  });

  test('TEST-UT-007 BR-011: for every hour window, offered slots are exactly the starts that fit (exhaustive over 0-24)', () => {
    const farFuture = new Date('2026-01-01T00:00:00Z');
    for (let start = 0; start < 24; start += 1) {
      for (let end = start + 1; end <= 24; end += 1) {
        const days = computeWeekSlots({
          weekStart: '2026-10-19', now: farFuture, providerType: 'clinic', bookedStarts: new Set(),
          hours: [{ weekday: 3, startHour: start, endHour: end }],
        });
        const expected = Array.from({ length: end - start }, (_, i) => `2026-10-21T${String(start + i).padStart(2, '0')}:00:00-05:00`);
        assert.deepEqual(days[2].slots, expected, `${start}-${end}`);
      }
    }
  });
});

describe('calendar helpers (Bogota, UTC-5, no daylight saving)', () => {
  test('TEST-UT-010: toBogotaIso and bogotaInstant are inverse across month, year and leap boundaries', () => {
    for (const iso of ['2026-12-31T23:00:00-05:00', '2027-01-01T00:00:00-05:00', '2028-02-29T12:00:00-05:00', '2026-03-01T00:00:00-05:00']) {
      assert.equal(toBogotaIso(new Date(iso)), iso);
    }
    assert.equal(toBogotaIso(new Date('2026-10-13T04:00:00Z')), '2026-10-12T23:00:00-05:00');
    assert.equal(bogotaInstant('2026-12-31', 23).toISOString(), '2027-01-01T04:00:00.000Z');
  });

  test('TEST-UT-011: weekday, Monday-of-week and date arithmetic', () => {
    assert.equal(isoWeekday('2026-10-12'), 1);
    assert.equal(isoWeekday('2026-10-18'), 7);
    assert.equal(mondayOf('2026-10-18'), '2026-10-12');
    assert.equal(mondayOf('2026-10-12'), '2026-10-12');
    assert.equal(mondayOf('2027-01-01'), '2026-12-28', 'a week that spans the new year');
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28');
    assert.deepEqual(bogotaParts(new Date('2026-10-13T04:59:59Z')), { date: '2026-10-12', hour: 23, minute: 59, weekday: 1 });
    assert.deepEqual(bogotaParts(new Date('2026-10-13T05:00:00Z')), { date: '2026-10-13', hour: 0, minute: 0, weekday: 2 });
  });

  test('TEST-UT-012: isLocalDate accepts only real calendar dates', () => {
    for (const ok of ['2026-02-28', '2028-02-29', '2026-12-31']) assert.equal(isLocalDate(ok), true, ok);
    for (const bad of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-00-10', '2026-1-1', '20261012', '', null, undefined, 20261012]) {
      assert.equal(isLocalDate(bad), false, String(bad));
    }
  });
});

describe('AC-080 / AC-025 — working-hours validation', () => {
  const week = (override = {}) => ({
    days: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({ weekday, works: weekday === 1, ...(weekday === 1 ? { startHour: 8, endHour: 12 } : {}), ...(override[weekday] ?? {}) })),
  });

  test('TEST-UT-020: a valid week normalizes to seven days, non-working days carrying no hours', () => {
    const result = validateWeeklyHours(week());
    assert.equal(result.fields, undefined);
    assert.equal(result.value.days.length, 7);
    assert.deepEqual(result.value.days[1], { weekday: 2, works: false });
    assert.deepEqual(result.value.days[0], { weekday: 1, works: true, startHour: 8, endHour: 12 });
  });

  test('TEST-UT-021 AC-080: fractional hours are NOT_ON_THE_HOUR on both start and end', () => {
    assert.deepEqual(reasons(validateWeeklyHours(week({ 1: { startHour: 8.5 } }))), ['days.0.startHour:NOT_ON_THE_HOUR']);
    assert.deepEqual(reasons(validateWeeklyHours(week({ 1: { endHour: 11.75 } }))), ['days.0.endHour:NOT_ON_THE_HOUR']);
  });

  test('TEST-UT-022: ranges, duplicates and shape errors are reported, never thrown', () => {
    assert.ok(reasons(validateWeeklyHours(week({ 1: { startHour: 12, endHour: 12 } }))).includes('days.0.endHour:END_NOT_AFTER_START'));
    assert.ok(reasons(validateWeeklyHours(week({ 1: { endHour: 25 } }))).includes('days.0.endHour:OUT_OF_RANGE'));
    assert.ok(reasons(validateWeeklyHours(week({ 1: { startHour: -1 } }))).includes('days.0.startHour:OUT_OF_RANGE'));
    assert.ok(reasons(validateWeeklyHours(week({ 2: { weekday: 1 } }))).some((r) => r.includes('weekday')), 'duplicate weekday');
    assert.ok(reasons(validateWeeklyHours(week({ 1: { startHour: '8' } }))).length > 0, 'string hour');
    for (const junk of [undefined, null, 'x', 5, [], {}, { days: 'x' }, { days: [null] }, { days: [] }, { days: [[]] }]) {
      assert.doesNotThrow(() => validateWeeklyHours(junk), JSON.stringify(junk));
      assert.ok(validateWeeklyHours(junk).fields, JSON.stringify(junk));
    }
  });
});

describe('IF-011 request validation (AC-053, AC-054, AC-046)', () => {
  const valid = { serviceId: SERVICE, petId: PET, startsAt: '2026-10-13T09:00:00-05:00' };

  test('TEST-UT-030: a valid request is normalized (ids lower-cased, address trimmed, instant parsed)', () => {
    const result = validateBookingRequest({ ...valid, serviceId: SERVICE.toUpperCase(), modality: 'home', visitAddress: '  Calle 1  ' });
    assert.equal(result.fields, undefined);
    assert.equal(result.value.serviceId, SERVICE);
    assert.equal(result.value.visitAddress, 'Calle 1');
    assert.equal(result.value.startsAt.toISOString(), '2026-10-13T14:00:00.000Z');
  });

  test('TEST-UT-031: required, format, hour and modality errors carry the field and reason', () => {
    assert.deepEqual(reasons(validateBookingRequest({})), ['serviceId:REQUIRED', 'petId:REQUIRED', 'startsAt:REQUIRED']);
    assert.deepEqual(reasons(validateBookingRequest({ ...valid, serviceId: 'nope' })), ['serviceId:INVALID_FORMAT']);
    assert.deepEqual(reasons(validateBookingRequest({ ...valid, startsAt: '2026-10-13T09:30:00-05:00' })), ['startsAt:NOT_ON_THE_HOUR']);
    assert.deepEqual(reasons(validateBookingRequest({ ...valid, startsAt: '2026-02-30T09:00:00-05:00' })), ['startsAt:INVALID_FORMAT']);
    assert.deepEqual(reasons(validateBookingRequest({ ...valid, startsAt: '2026-10-13 09:00' })), ['startsAt:INVALID_FORMAT']);
    assert.deepEqual(reasons(validateBookingRequest({ ...valid, modality: 'both' })), ['modality:NOT_ALLOWED'], 'a visit is at the clinic or at home, never "both"');
    assert.deepEqual(reasons(validateBookingRequest({ ...valid, visitAddress: '   ' })), ['visitAddress:REQUIRED']);
    assert.deepEqual(reasons(validateBookingRequest({ ...valid, visitAddress: 'x'.repeat(301) })), ['visitAddress:TOO_LONG']);
    assert.equal(validateBookingRequest({ ...valid, visitAddress: 'x'.repeat(300) }).fields, undefined);
    assert.deepEqual(reasons(validateBookingRequest({ ...valid, status: 'cancelled' })), ['status:NOT_ALLOWED']);
  });

  test('TEST-UT-032: validators never throw on arbitrary JSON values', () => {
    const junk = [undefined, null, true, 0, 'x', [], [1], {}, { serviceId: {} }, { serviceId: [], petId: 5, startsAt: {}, modality: [], visitAddress: {} }];
    for (const value of junk) {
      for (const validate of [validateBookingRequest, validateWeeklyHours, validateOwnerSignUp, validateProviderSignUp, validateSearchQuery, validateSpeciesFilter, validateWeekStart, validatePublishProduct]) {
        assert.doesNotThrow(() => validate(value), `${validate.name}(${JSON.stringify(value)})`);
      }
      assert.doesNotThrow(() => validatePublishService(value, 'clinic'));
      assert.doesNotThrow(() => validatePublishService(value, 'independent'));
    }
  });

  test('TEST-UT-033 AC-054 BR-007: the appointment modality follows the offering rules', () => {
    const outcome = (fn) => { try { return fn(); } catch (error) { assert.ok(error instanceof Outcome); return error.fields[0].reason; } };
    assert.equal(outcome(() => resolveAppointmentModality('clinic', undefined)), 'clinic');
    assert.equal(outcome(() => resolveAppointmentModality('clinic', 'clinic')), 'clinic');
    assert.equal(outcome(() => resolveAppointmentModality('clinic', 'home')), 'NOT_ALLOWED');
    assert.equal(outcome(() => resolveAppointmentModality('home', undefined)), 'home');
    assert.equal(outcome(() => resolveAppointmentModality('home', 'clinic')), 'NOT_ALLOWED');
    assert.equal(outcome(() => resolveAppointmentModality('both', undefined)), 'REQUIRED');
    assert.equal(outcome(() => resolveAppointmentModality('both', 'clinic')), 'clinic');
    assert.equal(outcome(() => resolveAppointmentModality('both', 'home')), 'home');
  });

  test('TEST-UT-034 weekStart: absent is allowed; otherwise a real Monday between years 1970 and 2999', () => {
    assert.deepEqual(validateWeekStart(undefined), { value: undefined });
    assert.deepEqual(validateWeekStart('2026-10-12'), { value: '2026-10-12' });
    assert.deepEqual(reasons(validateWeekStart('2026-10-13')), ['weekStart:NOT_ALLOWED']);
    assert.deepEqual(reasons(validateWeekStart('2026-02-30')), ['weekStart:INVALID_FORMAT']);
    assert.deepEqual(reasons(validateWeekStart(['2026-10-12'])), ['weekStart:INVALID_FORMAT']);
    assert.deepEqual(reasons(validateWeekStart('1969-12-29')), ['weekStart:OUT_OF_RANGE']);
  });
});

describe('sign-up, publishing and search validation boundaries', () => {
  const owner = (over = {}, pet = {}) => ({
    name: 'Ana', email: 'ana@example.test', password: '12345678',
    pet: { name: 'Rex', species: 'dog', breed: 'Mix', ageYears: 0, ...pet }, ...over,
  });

  test('TEST-UT-040 AC-102: password boundary is 8 characters (code points), maximum 128', () => {
    assert.equal(validateOwnerSignUp(owner({ password: '1234567' })).fields[0].reason, 'TOO_SHORT');
    assert.equal(validateOwnerSignUp(owner({ password: '12345678' })).fields, undefined);
    assert.equal(validateOwnerSignUp(owner({ password: '😀'.repeat(8) })).fields, undefined, 'eight emoji are eight characters');
    assert.equal(validateOwnerSignUp(owner({ password: 'x'.repeat(128) })).fields, undefined);
    assert.equal(validateOwnerSignUp(owner({ password: 'x'.repeat(129) })).fields[0].reason, 'TOO_LONG');
  });

  test('TEST-UT-041 AC-001 AC-075: pet fields — age 0 is a valid age, species only dog or cat, optional measures are range-checked', () => {
    assert.equal(validateOwnerSignUp(owner({}, { ageYears: 0 })).fields, undefined);
    assert.deepEqual(reasons(validateOwnerSignUp(owner({}, { ageYears: -1 }))), ['pet.ageYears:OUT_OF_RANGE']);
    assert.deepEqual(reasons(validateOwnerSignUp(owner({}, { ageYears: 1.5 }))), ['pet.ageYears:INVALID_FORMAT']);
    assert.deepEqual(reasons(validateOwnerSignUp(owner({}, { species: 'hamster' }))), ['pet.species:NOT_ALLOWED']);
    assert.deepEqual(reasons(validateOwnerSignUp(owner({}, { weightKg: 0 }))), ['pet.weightKg:OUT_OF_RANGE']);
    assert.equal(validateOwnerSignUp(owner({}, { weightKg: 4.5, heightCm: 40 })).fields, undefined);
    assert.deepEqual(reasons(validateOwnerSignUp(owner({}, { name: '   ' }))), ['pet.name:REQUIRED']);
  });

  test('TEST-UT-042 AC-104 AC-105 BR-026: a clinic address is mandatory, an independent veterinarian\'s optional', () => {
    const base = { name: 'P', email: 'p@example.test', password: '12345678' };
    assert.deepEqual(reasons(validateProviderSignUp({ ...base, providerType: 'clinic' })), ['address:REQUIRED']);
    assert.deepEqual(reasons(validateProviderSignUp({ ...base, providerType: 'clinic', address: '  ' })), ['address:REQUIRED']);
    assert.equal(validateProviderSignUp({ ...base, providerType: 'clinic', address: 'Calle 1' }).fields, undefined);
    assert.equal(validateProviderSignUp({ ...base, providerType: 'independent' }).fields, undefined);
    assert.deepEqual(reasons(validateProviderSignUp({ ...base })), ['providerType:REQUIRED']);
  });

  test('TEST-UT-043 AC-107 AC-029 BR-007: modality rules by provider type', () => {
    const base = { name: 'S', priceCop: 1000, species: 'dog' };
    assert.deepEqual(validatePublishService(base, 'independent').value.modality, 'home');
    assert.deepEqual(reasons(validatePublishService({ ...base, modality: 'clinic' }, 'independent')), ['modality:NOT_ALLOWED']);
    assert.deepEqual(reasons(validatePublishService({ ...base, modality: 'both' }, 'independent')), ['modality:NOT_ALLOWED']);
    assert.deepEqual(reasons(validatePublishService(base, 'clinic')), ['modality:REQUIRED']);
    for (const modality of ['clinic', 'home', 'both']) assert.equal(validatePublishService({ ...base, modality }, 'clinic').value.modality, modality);
  });

  test('TEST-UT-044 AC-082 AC-084 BR-027: price must be a whole number of pesos between 1 and the 32-bit maximum', () => {
    const product = (priceCop) => validatePublishProduct({ name: 'P', species: 'cat', priceCop });
    assert.equal(product(1).fields, undefined);
    assert.equal(product(2_147_483_647).fields, undefined);
    assert.deepEqual(reasons(product(0)), ['priceCop:OUT_OF_RANGE']);
    assert.deepEqual(reasons(product(2_147_483_648)), ['priceCop:OUT_OF_RANGE']);
    assert.deepEqual(reasons(product(99.5)), ['priceCop:INVALID_FORMAT']);
    assert.deepEqual(reasons(product('1000')), ['priceCop:INVALID_FORMAT']);
    assert.deepEqual(reasons(product(undefined)), ['priceCop:REQUIRED']);
    assert.deepEqual(reasons(product(null)), ['priceCop:REQUIRED']);
  });

  test('TEST-UT-045 FR-017 AC-041: search text and species filter validation', () => {
    assert.deepEqual(validateSearchQuery('  vacuna  '), { value: 'vacuna' });
    assert.deepEqual(reasons(validateSearchQuery('   ')), ['q:REQUIRED']);
    assert.deepEqual(reasons(validateSearchQuery('a'.repeat(121))), ['q:TOO_LONG']);
    assert.equal(validateSearchQuery('😀'.repeat(120)).fields, undefined, 'length counts characters, not UTF-16 units');
    assert.deepEqual(validateSpeciesFilter(undefined), { value: 'all' });
    for (const species of ['all', 'dog', 'cat']) assert.deepEqual(validateSpeciesFilter(species), { value: species });
    assert.deepEqual(reasons(validateSpeciesFilter('DOG')), ['species:NOT_ALLOWED']);
    assert.deepEqual(reasons(validateSpeciesFilter(['dog', 'cat'])), ['species:INVALID_FORMAT']);
  });
});

describe('CTR-001 outcome catalogue', () => {
  test('TEST-UT-050: outcomes map to the documented HTTP status and only VALIDATION_FAILED carries fields', () => {
    const expected = { VALIDATION_FAILED: 422, INVALID_CREDENTIALS: 401, UNAUTHENTICATED: 401, SESSION_EXPIRED: 401, FORBIDDEN_ORIGIN: 403, NOT_FOUND: 404, SLOT_UNAVAILABLE: 409, PET_NOT_ELIGIBLE: 422, NO_PETS: 422, UNEXPECTED: 500 };
    for (const [code, status] of Object.entries(expected)) assert.equal(new Outcome(code).status, status, code);
    assert.deepEqual(new Outcome('NOT_FOUND', { fields: [{ field: 'x', reason: 'REQUIRED' }] }).toBody(), { code: 'NOT_FOUND' });
    assert.deepEqual(new Outcome('VALIDATION_FAILED', { fields: [{ field: 'x', reason: 'REQUIRED' }] }).toBody(), { code: 'VALIDATION_FAILED', fields: [{ field: 'x', reason: 'REQUIRED' }] });
    assert.throws(() => new Outcome('MADE_UP'), TypeError);
    assert.equal(Object.keys(OUTCOME_HTTP_STATUS).length >= Object.keys(expected).length, true);
  });
});

describe('DEF-001 — NUL characters are refused at the API boundary', () => {
  const run = (req) => {
    let called = false;
    try {
      rejectNulCharacters(req, {}, () => { called = true; });
    } catch (error) {
      assert.ok(error instanceof Outcome, 'only an Outcome is thrown');
      assert.equal(called, false);
      return error;
    }
    assert.equal(called, true, 'clean input continues to the next handler');
    return undefined;
  };

  test('TEST-UT-060 DEF-001: clean input passes and NUL anywhere in the body or query becomes VALIDATION_FAILED naming the field', () => {
    assert.equal(run({ body: { name: 'Ana', pet: { name: 'Rex' }, list: ['a', 'b'] }, query: { q: 'vacuna' } }), undefined);
    assert.equal(run({ body: undefined, query: {} }), undefined, 'no body');
    assert.equal(run({ body: [], query: {} }), undefined, 'empty array body');

    const body = run({ body: { name: 'a b', pet: { breed: 'x ' }, days: [{ note: 'ok' }, { note: ' ' }] }, query: {} });
    assert.equal(body.code, 'VALIDATION_FAILED');
    assert.equal(body.status, 422);
    assert.deepEqual(body.toBody().fields, [
      { field: 'name', reason: 'INVALID_FORMAT' }, { field: 'pet.breed', reason: 'INVALID_FORMAT' }, { field: 'days.1.note', reason: 'INVALID_FORMAT' },
    ]);
    const query = run({ body: undefined, query: { q: 'a ', species: ['dog', 'c t'] } });
    assert.deepEqual(query.toBody().fields, [{ field: 'q', reason: 'INVALID_FORMAT' }, { field: 'species.1', reason: 'INVALID_FORMAT' }]);
  });

  test('TEST-UT-061 DEF-001: the password field is not inspected (it is only hashed), so its handling is unchanged', () => {
    assert.equal(run({ body: { email: 'a@b.co', password: 'abc defgh' }, query: {} }), undefined);
    assert.equal(run({ body: { password: 'ok', nested: { password: 'x ' } }, query: {} }).code, 'VALIDATION_FAILED', 'only the top-level password field is exempt');
  });
});
