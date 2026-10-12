// US-019 pure rules: Bogota calendar helpers and the offered-slot computation
// (BR-010 to BR-013, AC-046, AC-049 to AC-051, EDGE-005, EDGE-006, EDGE-009).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, bogotaInstant, isLocalDate, isoWeekday, mondayOf, toBogotaIso } from '../src/shared/clock.js';
import { isUuid } from '../src/shared/ids.js';
import { computeWeekSlots, isSlotOffered } from '../src/modules/scheduling/slots.js';
import { resolveAppointmentModality, validateBookingRequest, validateWeekStart } from '../src/modules/scheduling/booking.js';

const MONDAY = '2026-10-12';
const none = new Set();
const week = (overrides) => computeWeekSlots({
  weekStart: MONDAY,
  now: new Date('2026-10-12T05:00:00Z'), // Monday 00:00 in Bogota
  hours: [],
  providerType: 'clinic',
  bookedStarts: none,
  ...overrides,
});
const slotsOf = (days, date) => days.find((day) => day.date === date).slots;

test('calendar helpers: weekdays, Mondays, day arithmetic across months and years, real dates only', () => {
  assert.equal(isoWeekday('2026-10-12'), 1);
  assert.equal(isoWeekday('2026-10-18'), 7);
  assert.equal(mondayOf('2026-10-18'), '2026-10-12');
  assert.equal(mondayOf('2026-10-12'), '2026-10-12');
  assert.equal(mondayOf('2027-01-01'), '2026-12-28');
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  for (const bad of ['2026-02-30', '2026-13-01', '2026-1-1', '26-01-01', '', ' 2026-10-12', '2026-10-12T00:00:00Z', null, undefined, 20261012]) {
    assert.equal(isLocalDate(bad), false, String(bad));
  }
  assert.equal(isLocalDate('2028-02-29'), true);
  assert.equal(isLocalDate('2026-02-29'), false);
});

test('Bogota instants: whole-hour wall-clock times map to the right UTC instants, round-trip with the offset', () => {
  assert.equal(bogotaInstant('2026-10-12', 8).toISOString(), '2026-10-12T13:00:00.000Z');
  assert.equal(bogotaInstant('2026-10-12', 0).toISOString(), '2026-10-12T05:00:00.000Z');
  assert.equal(bogotaInstant('2026-10-12', 23).toISOString(), '2026-10-13T04:00:00.000Z'); // crosses UTC midnight
  assert.equal(toBogotaIso(bogotaInstant('2026-10-12', 23)), '2026-10-12T23:00:00-05:00');
  assert.equal(toBogotaIso(bogotaInstant('2026-12-31', 23)), '2026-12-31T23:00:00-05:00');
});

test('AC-046 / BR-011: slots start on whole hours from opening up to one hour before closing', () => {
  const days = week({ hours: [{ weekday: 1, startHour: 8, endHour: 12 }] });
  assert.deepEqual(slotsOf(days, MONDAY), [8, 9, 10, 11].map((h) => `2026-10-12T${String(h).padStart(2, '0')}:00:00-05:00`));
  assert.equal(days.length, 7);
  assert.deepEqual(days.map((d) => d.date), ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']);
  for (const date of days.map((d) => d.date).slice(1)) assert.deepEqual(slotsOf(days, date), [], date);
});

test('EDGE-005: only the provider\'s own working days offer slots; each weekday uses its own range', () => {
  const days = week({ hours: [{ weekday: 2, startHour: 9, endHour: 11 }, { weekday: 7, startHour: 13, endHour: 15 }] });
  assert.deepEqual(slotsOf(days, '2026-10-12'), []);
  assert.deepEqual(slotsOf(days, '2026-10-13'), ['2026-10-13T09:00:00-05:00', '2026-10-13T10:00:00-05:00']);
  assert.deepEqual(slotsOf(days, '2026-10-18'), ['2026-10-18T13:00:00-05:00', '2026-10-18T14:00:00-05:00']);
});

test('boundaries: closing hour 24 offers 23:00; opening hour 0 offers 00:00; a one-hour day offers exactly one slot', () => {
  const late = week({ hours: [{ weekday: 1, startHour: 22, endHour: 24 }] });
  assert.deepEqual(slotsOf(late, MONDAY), ['2026-10-12T22:00:00-05:00', '2026-10-12T23:00:00-05:00']);
  assert.deepEqual(slotsOf(late, '2026-10-13'), [], 'a 23:00 slot belongs to Monday even though it is Tuesday in UTC');
  const early = week({ hours: [{ weekday: 1, startHour: 0, endHour: 2 }], now: new Date('2026-10-11T05:00:00Z') });
  assert.deepEqual(slotsOf(early, MONDAY), ['2026-10-12T00:00:00-05:00', '2026-10-12T01:00:00-05:00']);
  assert.deepEqual(slotsOf(week({ hours: [{ weekday: 1, startHour: 8, endHour: 9 }] }), MONDAY), ['2026-10-12T08:00:00-05:00']);
});

test('AC-051 / EDGE-009: a slot whose start is not after now is not offered; one millisecond earlier it still is', () => {
  const hours = [{ weekday: 1, startHour: 8, endHour: 12 }];
  const at = (iso) => slotsOf(week({ hours, now: new Date(iso) }), MONDAY);
  assert.deepEqual(at('2026-10-12T13:00:00Z').map((s) => s.slice(11, 13)), ['09', '10', '11'], 'now = 08:00 exactly: 08:00 is not offered');
  assert.deepEqual(at('2026-10-12T12:59:59.999Z').map((s) => s.slice(11, 13)), ['08', '09', '10', '11']);
  assert.deepEqual(at('2026-10-12T14:30:00Z').map((s) => s.slice(11, 13)), ['10', '11'], 'now = 09:30: 09:00 has started');
  assert.deepEqual(at('2026-10-12T16:00:00Z'), [], 'now = 11:00: nothing left that day');
  assert.deepEqual(slotsOf(week({ hours, now: new Date('2026-10-20T00:00:00Z') }), MONDAY), [], 'a past week offers nothing');
});

test('AC-049 / BR-012: a clinic keeps offering a slot however many appointments it has', () => {
  const hours = [{ weekday: 1, startHour: 8, endHour: 10 }];
  const booked = new Set([bogotaInstant(MONDAY, 8).getTime()]);
  assert.deepEqual(slotsOf(week({ hours, providerType: 'clinic', bookedStarts: booked }), MONDAY).length, 2);
});

test('AC-050 / EDGE-006 / BR-013: an independent veterinarian does not offer a booked slot, only that one', () => {
  const hours = [{ weekday: 1, startHour: 8, endHour: 12 }];
  const booked = new Set([bogotaInstant(MONDAY, 9).getTime(), bogotaInstant(MONDAY, 11).getTime()]);
  assert.deepEqual(slotsOf(week({ hours, providerType: 'independent', bookedStarts: booked }), MONDAY).map((s) => s.slice(11, 13)), ['08', '10']);
});

test('isSlotOffered: not on the hour, wrong weekday and outside hours are refused', () => {
  const base = { now: new Date('2026-10-12T05:00:00Z'), hours: [{ weekday: 1, startHour: 8, endHour: 12 }], providerType: 'clinic', bookedStarts: none };
  assert.equal(isSlotOffered({ ...base, startsAt: bogotaInstant(MONDAY, 8) }), true);
  assert.equal(isSlotOffered({ ...base, startsAt: new Date(bogotaInstant(MONDAY, 8).getTime() + 30 * 60_000) }), false);
  assert.equal(isSlotOffered({ ...base, startsAt: bogotaInstant(MONDAY, 12) }), false, 'the slot at closing time does not fit');
  assert.equal(isSlotOffered({ ...base, startsAt: bogotaInstant(MONDAY, 7) }), false);
  assert.equal(isSlotOffered({ ...base, startsAt: bogotaInstant('2026-10-13', 9) }), false, 'Tuesday is not a working day');
  assert.equal(isSlotOffered({ ...base, hours: [] , startsAt: bogotaInstant(MONDAY, 9) }), false, 'no hours: nothing is offered (AC-026)');
});

test('weekStart validation: absent is allowed; only real Mondays in a sane range', () => {
  assert.deepEqual(validateWeekStart(undefined), { value: undefined });
  assert.deepEqual(validateWeekStart('2026-10-12'), { value: '2026-10-12' });
  assert.deepEqual(validateWeekStart('2026-10-13'), { fields: [{ field: 'weekStart', reason: 'NOT_ALLOWED' }] });
  for (const bad of ['x', '2026-02-30', '', ['2026-10-12'], '2026-10-12T00:00:00Z']) {
    assert.deepEqual(validateWeekStart(bad), { fields: [{ field: 'weekStart', reason: 'INVALID_FORMAT' }] }, JSON.stringify(bad));
  }
  assert.deepEqual(validateWeekStart('1969-12-29'), { fields: [{ field: 'weekStart', reason: 'OUT_OF_RANGE' }] });
  assert.deepEqual(validateWeekStart('3000-01-06'), { fields: [{ field: 'weekStart', reason: 'OUT_OF_RANGE' }] });
});

test('booking request validation: shape, ids, whole-hour instants with any offset and unknown fields', () => {
  const ok = { serviceId: 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA', petId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', startsAt: '2026-10-12T10:00:00-05:00' };
  const valid = validateBookingRequest(ok);
  assert.equal(valid.value.serviceId, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'ids are lower-cased');
  assert.equal(valid.value.startsAt.toISOString(), '2026-10-12T15:00:00.000Z');
  assert.equal(validateBookingRequest({ ...ok, startsAt: '2026-10-12T15:00:00Z' }).value.startsAt.toISOString(), '2026-10-12T15:00:00.000Z');
  assert.equal(validateBookingRequest({ ...ok, startsAt: '2026-10-12T10:00-05:00' }).value.startsAt.toISOString(), '2026-10-12T15:00:00.000Z');
  const reasons = (input) => validateBookingRequest(input).fields.map(({ field, reason }) => `${field}:${reason}`);
  assert.deepEqual(reasons({}), ['serviceId:REQUIRED', 'petId:REQUIRED', 'startsAt:REQUIRED']);
  assert.deepEqual(reasons({ ...ok, serviceId: 'nope', petId: 5 }), ['serviceId:INVALID_FORMAT', 'petId:INVALID_FORMAT']);
  assert.deepEqual(reasons({ ...ok, startsAt: '2026-10-12T10:30:00-05:00' }), ['startsAt:NOT_ON_THE_HOUR']);
  assert.deepEqual(reasons({ ...ok, startsAt: '2026-10-12T10:00:00.5-05:00' }), ['startsAt:NOT_ON_THE_HOUR']);
  for (const startsAt of ['tomorrow', '2026-10-12', '2026-10-12T10:00:00', '2026-02-30T10:00:00-05:00', '2026-10-12T24:00:00-05:00',
    '2026-10-12T10:60:00-05:00', '2026-10-12T10:00:00-25:00', 1760000000, ['2026-10-12T10:00:00-05:00']]) {
    assert.deepEqual(reasons({ ...ok, startsAt }), ['startsAt:INVALID_FORMAT'], JSON.stringify(startsAt));
  }
  assert.deepEqual(reasons({ ...ok, modality: 'remote' }), ['modality:NOT_ALLOWED']);
  assert.deepEqual(reasons({ ...ok, ownerId: 'x', status: 'cancelled' }), ['ownerId:NOT_ALLOWED', 'status:NOT_ALLOWED']);
  assert.deepEqual(reasons([]), ['form:REQUIRED']);
  assert.deepEqual(reasons(null), ['form:REQUIRED']);
});

test('service modality determines the allowed appointment modality (BR-007)', () => {
  assert.equal(resolveAppointmentModality('clinic', undefined), 'clinic');
  assert.equal(resolveAppointmentModality('clinic', 'clinic'), 'clinic');
  assert.equal(resolveAppointmentModality('both', 'clinic'), 'clinic');
  assert.equal(resolveAppointmentModality('both', 'home'), 'home');
  assert.equal(resolveAppointmentModality('home', undefined), 'home');
  assert.equal(resolveAppointmentModality('home', 'home'), 'home');
  const refused = (service, requested) => { try { resolveAppointmentModality(service, requested); return 'allowed'; } catch (e) { return e.fields[0].reason; } };
  assert.equal(refused('both', undefined), 'REQUIRED');
  assert.equal(refused('clinic', 'home'), 'NOT_ALLOWED');
  assert.equal(refused('home', 'clinic'), 'NOT_ALLOWED');
  assert.equal(refused('invalid', undefined), 'NOT_ALLOWED');
});

test('identifiers: only canonical UUIDs', () => {
  assert.equal(isUuid('11111111-1111-4111-8111-111111111111'), true);
  assert.equal(isUuid('ABCDEF12-3456-4789-8ABC-DEF012345678'), true);
  for (const bad of ['', 'abc', '11111111111141118111111111111111', '{11111111-1111-4111-8111-111111111111}', null, undefined, 5, ['11111111-1111-4111-8111-111111111111']]) {
    assert.equal(isUuid(bad), false, String(bad));
  }
});
