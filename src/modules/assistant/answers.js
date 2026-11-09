// COMP-013 Assistant — answer composition with the UX_SPEC_V3 v3.1 SCR-UX-018 templates (ADR-019).
// The Spanish wording lives only here; error responses stay code-only (CR-030).
import { bogotaParts } from '../../shared/clock.js';

const MAX_ITEMS = 5; // BR-047
const priceFormat = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export const price = (cop) => priceFormat.format(cop).replace(/\s/g, ' ');

const WEEKDAYS = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function hour12(hour) {
  const h = hour % 24;
  const suffix = h < 12 ? 'a. m.' : 'p. m.';
  return `${h % 12 === 0 ? 12 : h % 12}:00 ${suffix}`;
}

function dateText(iso) {
  const parts = bogotaParts(new Date(iso));
  const [, month, day] = parts.date.split('-').map(Number);
  return { date: `${WEEKDAYS[parts.weekday]} ${day} de ${MONTHS[month - 1]}`, time: hour12(parts.hour) };
}

const typeLabel = (type) => (type === 'clinic' ? 'Clínica' : 'Veterinario independiente');
const providerItem = (provider) => ({ label: `${provider.name} — ${typeLabel(provider.type)}`, target: { screen: 'provider_profile', providerId: provider.id } });
const byName = (a, b) => a.name.localeCompare(b.name, 'es');
// Ends a sentence with one period ("p. m." already ends with one).
const sentence = (text) => (text.endsWith('.') ? text : `${text}.`);
const answer = (intent, text, { items = [], total = items.length, ...rest } = {}) => ({ intent, text, items, total, ...rest });

export const HELP_TEXT = 'Puedes preguntarme: veterinarias disponibles («¿Qué veterinarias hay?», «¿Qué veterinarios a domicilio hay?»); quién ofrece algo («¿Quién ofrece vacunación para gatos?»); precios («¿Cuánto cuesta una consulta?»); horario y contacto («¿Cuál es el horario de [veterinaria]?», «¿Dónde queda [veterinaria]?»); y tus citas («¿Cuándo es mi próxima cita?»).';
export const FALLBACK_TEXT = 'No entendí tu pregunta. Prueba con: «¿Qué veterinarias hay?» o «¿Cuánto cuesta un baño para perro?». Si tu mascota necesita atención, busca un servicio y agenda una cita con un veterinario.';

export const help = () => answer('help', HELP_TEXT);
export const fallback = () => answer('fallback', FALLBACK_TEXT, { linkTo: 'search' });

export function actionRequest(linkTo) {
  const text = linkTo === 'search'
    ? 'Solo puedo darte información. Para agendar una cita, ve a Buscar.'
    : 'Solo puedo darte información. Para cancelar o reprogramar, ve a Mis citas.';
  return answer('action_request', text, { linkTo });
}

const PROVIDER_PHRASES = {
  all: (n) => (n === 1 ? 'Hay 1 veterinaria o veterinario en VetCare.' : `Hay ${n} veterinarias y veterinarios en VetCare.`),
  clinic: (n) => (n === 1 ? 'Hay 1 clínica en VetCare.' : `Hay ${n} clínicas en VetCare.`),
  independent: (n) => (n === 1 ? 'Hay 1 veterinario independiente en VetCare.' : `Hay ${n} veterinarios independientes en VetCare.`),
  home: (n) => (n === 1 ? 'Hay 1 proveedor con servicios a domicilio.' : `Hay ${n} proveedores con servicios a domicilio.`),
};

/** INT-01 (AC-130, AC-131, AC-160). `providers` is already filtered. */
export function providersList(filter, providers) {
  const sorted = [...providers].sort(byName);
  if (!sorted.length) return answer('no_match', 'No encontré veterinarias con esas características.', { linkTo: 'search' });
  const shown = sorted.slice(0, MAX_ITEMS);
  return answer('providers', `${PROVIDER_PHRASES[filter](sorted.length)} Te muestro ${shown.length}:`, {
    items: shown.map(providerItem),
    total: sorted.length,
  });
}

/** INT-04 hours (AC-132, EDGE-045). `hours`: [{ weekday, startHour, endHour }]. */
export function providerHours(provider, hours) {
  const item = providerItem(provider);
  if (!hours.length) return answer('provider_hours', `${provider.name} aún no ha definido su horario de atención.`, { items: [item] });
  const days = [...hours].sort((a, b) => a.weekday - b.weekday)
    .map((h) => `${WEEKDAYS[h.weekday]} de ${hour12(h.startHour)} a ${hour12(h.endHour)}`);
  return answer('provider_hours', sentence(`${provider.name} atiende: ${days.join('; ')}`), { items: [item] });
}

/** INT-04 contact (AC-133): address omitted when none. */
export function providerContact(provider) {
  const parts = [];
  if (provider.address) parts.push(`dirección ${provider.address}`);
  if (provider.contactPhone) parts.push(`teléfono ${provider.contactPhone}`);
  parts.push(`correo ${provider.contactEmail}`);
  return answer('provider_contact', sentence(`${provider.name}: ${parts.join('; ')}`), { items: [providerItem(provider)] });
}

export function severalMatches(providers) {
  const sorted = [...providers].sort(byName);
  return answer('several_matches', 'Encontré varias veterinarias con ese nombre. ¿Cuál de estas?', {
    items: sorted.slice(0, MAX_ITEMS).map(providerItem),
    total: sorted.length,
  });
}

export const noProvider = () => answer('no_match', 'No encontré esa veterinaria.', { linkTo: 'search' });

const SPECIES_SUFFIX = { dog: ' para perros', cat: ' para gatos', all: '' };
const SPECIES_LABEL = { dog: 'Perro', cat: 'Gato' };

/** INT-02 / INT-03 (AC-136 to AC-140). `search` is the voice-search result (query, species, results). */
export function offerings({ query, species, results }) {
  if (!results.length) return answer('no_match', `No encontré servicios ni productos para «${query}».`, { linkTo: 'search' });
  const sorted = [...results].sort((a, b) => a.priceCop - b.priceCop || a.name.localeCompare(b.name, 'es'));
  const shown = sorted.slice(0, MAX_ITEMS);
  const count = sorted.length === 1 ? '1 resultado' : `${sorted.length} resultados`;
  return answer('offerings', `Encontré ${count} para «${query}»${SPECIES_SUFFIX[species]}. Te muestro ${shown.length}:`, {
    items: shown.map((r) => ({
      label: `${r.name} — ${SPECIES_LABEL[r.species]} — ${price(r.priceCop)} — ${r.provider.name}`,
      target: { screen: 'provider_profile', providerId: r.provider.id },
    })),
    total: sorted.length,
    ...(sorted.length > MAX_ITEMS ? { searchLink: { q: query, species } } : {}),
  });
}

/** INT-05 (AC-141 to AC-144). `appointments`: the owner's upcoming scheduled ones, nearest first. */
export function myAppointments(appointments) {
  if (!appointments.length) return answer('my_appointments', 'No tienes citas próximas.', { linkTo: 'search' });
  const rows = appointments.slice(0, MAX_ITEMS).map((a) => {
    const { date, time } = dateText(a.startsAt);
    return { a, date, time };
  });
  const items = rows.map(({ a, date, time }) => ({
    label: `${date} ${time} — ${a.service.name} con ${a.provider.name} — ${a.pet.name}`,
    target: { screen: 'owner_appointments' },
  }));
  if (appointments.length === 1) {
    const { a, date, time } = rows[0];
    return answer('my_appointments', `Tu próxima cita es el ${date} a las ${time}: ${a.service.name} con ${a.provider.name} para ${a.pet.name}.`, { items });
  }
  return answer('my_appointments', `Tienes ${appointments.length} citas próximas:`, { items, total: appointments.length });
}
