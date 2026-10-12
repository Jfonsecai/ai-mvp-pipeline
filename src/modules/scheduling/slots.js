// COMP-009 Scheduling — which one-hour slots are offered (FR-021, FR-024, FR-025). Pure functions.
//
// A slot starts on a whole Bogota hour, from the day's opening hour up to one hour before its
// closing hour, because an appointment lasts one hour and must fit within working hours
// (BR-010, BR-011). Start times that are not in the future are not offered (P02-ASM-006).
// A clinic offers every slot however many appointments it already has (BR-012); an independent
// veterinarian does not offer a slot that already has a scheduled appointment (BR-013).
import { addDays, bogotaInstant, bogotaParts, toBogotaIso } from '../../shared/clock.js';

/**
 * Whether a start instant is offered for one provider.
 *
 * @param {object} input
 * @param {Date} input.startsAt
 * @param {Date} input.now
 * @param {Array<{ weekday: number, startHour: number, endHour: number }>} input.hours the provider's weekly hours
 * @param {'clinic' | 'independent'} input.providerType
 * @param {Set<number>} input.bookedStarts epoch milliseconds of the provider's scheduled appointments
 */
export function isSlotOffered({ startsAt, now, hours, providerType, bookedStarts }) {
  if (!(startsAt.getTime() > now.getTime())) return false;
  const local = bogotaParts(startsAt);
  if (local.minute !== 0) return false;
  const day = hours.find((entry) => entry.weekday === local.weekday);
  if (!day || local.hour < day.startHour || local.hour + 1 > day.endHour) return false;
  if (providerType === 'independent' && bookedStarts.has(startsAt.getTime())) return false;
  return true;
}

/**
 * The offered slot starts of the seven days from `weekStart` (a Bogota Monday).
 *
 * @returns {Array<{ date: string, slots: string[] }>} slot starts as ISO 8601 with the Bogota offset
 */
export function computeWeekSlots({ weekStart, now, hours, providerType, bookedStarts }) {
  const days = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    const slots = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const startsAt = bogotaInstant(date, hour);
      if (isSlotOffered({ startsAt, now, hours, providerType, bookedStarts })) slots.push(toBogotaIso(startsAt));
    }
    days.push({ date, slots });
  }
  return days;
}
