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

/**
 * The clock injected into modules so tests control "now" (COMP-010).
 * @param {() => Date} [source]
 */
export function createClock(source = () => new Date()) {
  return Object.freeze({ now: () => source() });
}
