// COMP-010 Shared Kernel - clock and the Bogota time zone (ADR-008, CR-007).
// The database session time zone is never changed (CR-024); calendar logic happens here.

export const BOGOTA_TIME_ZONE = 'America/Bogota';

// Colombia has no daylight saving time; the offset is fixed (API_SPEC emits "-05:00").
const BOGOTA_OFFSET = '-05:00';
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

const WEEKDAY_ISO = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BOGOTA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  weekday: 'short',
  hourCycle: 'h23',
});

/**
 * Calendar parts of an instant in Bogota time.
 * @param {Date} date
 * @returns {{ date: string, hour: number, minute: number, weekday: number }} weekday is ISO 8601 (1 = Monday)
 */
export function bogotaParts(date) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: WEEKDAY_ISO[parts.weekday],
  };
}

/** ISO 8601 with the Bogota offset, for example 2026-10-12T08:00:00-05:00 (CTR-003). */
export function toBogotaIso(date) {
  const shifted = new Date(date.getTime() + BOGOTA_OFFSET_MS);
  return `${shifted.toISOString().slice(0, 19)}${BOGOTA_OFFSET}`;
}

/** The instant of a Bogota wall-clock hour: bogotaInstant('2026-10-12', 8) is 08:00 on 12 October in Bogota. */
export function bogotaInstant(date, hour) {
  return new Date(`${date}T${String(hour).padStart(2, '0')}:00:00${BOGOTA_OFFSET}`);
}

// Calendar arithmetic on YYYY-MM-DD dates; no time zone is involved, so there are no DST pitfalls.
export function addDays(date, days) {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}

/** ISO 8601 weekday of a YYYY-MM-DD date (1 = Monday ... 7 = Sunday). */
export function isoWeekday(date) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/** The Monday of the week that contains the date. */
export function mondayOf(date) {
  return addDays(date, 1 - isoWeekday(date));
}

/** True for a real calendar date written YYYY-MM-DD (rejects 2026-02-30 and the like). */
export function isLocalDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * The clock injected into modules so tests control "now" (COMP-010).
 * @param {() => Date} [source]
 */
export function createClock(source = () => new Date()) {
  return Object.freeze({ now: () => source() });
}
