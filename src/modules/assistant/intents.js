// COMP-013 Assistant — question classification (ARCHITECTURE_V4 §6.2, rules in order; P05-ASM-022).
// Pure functions on text: no database, so every rule is unit-tested (P05-RISK-025).
import { fold } from '../search/voice-phrase.js';

/** Lowercase, accents folded, punctuation removed, single spaces. */
export function normalize(text) {
  return fold(text).replace(/[¿?¡!.,;:"«»()]/g, ' ').replace(/\s+/g, ' ').trim();
}

const has = (text, pattern) => pattern.test(text);

// Rule 1 — action requests (BR-045, AC-129): appointment verbs with "cita"/"turno", or a leading imperative.
const ACTION_VERB = /\b(agend\w*|reserv\w*|cancel\w*|reprogram\w*|cambi\w*|mover|muev\w*)\b/;
const APPOINTMENT_WORD = /\b(cita|citas|turno|turnos)\b/;
const LEADING_IMPERATIVE = /^(agenda|agendame|reserva|reservame|cancela|cancelame|reprograma|reprogramame)\b/;
const BOOKING_VERB = /\b(agend\w*|reserv\w*)\b/;

// Rule 2 — help (AC-145).
const HELP = /\b(ayuda|ayudame)\b|que (puedo|debo) (preguntar|hacer|decir)|que (sabes|puedes) hacer|como funciona(s)?\b|que puedes responder/;

// Rule 3 — my appointments (AC-141 to AC-144).
const MY_APPOINTMENTS = /\b(mi|mis) (proxima |proximas |siguiente )?(cita|citas)\b|\bproxima cita\b|\bcuando es mi\b|\btengo (una |alguna )?citas?\b/;

// Rule 4 — provider detail words (INT-04).
const HOURS_WORD = /\b(horario|horarios|hora|horas|abre|abren|atiende|atienden|cierra|cierran)\b/;
const CONTACT_WORD = /\b(direccion|donde queda|queda|quedan|ubicad\w*|ubicacion|telefono|contacto|correo|email|llamar)\b/;
const GENERIC_NAME_TOKENS = new Set(['clinica', 'veterinaria', 'veterinario', 'vet', 'centro', 'la', 'el', 'de', 'del', 'los', 'las', 'y']);

// Rule 5 — providers list (INT-01, BR-054).
const PROVIDER_WORD = /\b(veterinari\w*|clinicas?|proveedor\w*|vets?)\b/;
const LIST_WORD = /\b(hay|cuales|que|disponibles?|lista|existen|conoces|muestrame)\b/;

// Rule 6 — offerings (INT-02, INT-03). Purchase words are offering words: ordering is deferred.
const OFFERING_WORD = /\bquien(es)? (ofrece|ofrecen|tiene|tienen|vende|venden|hace|hacen)\b|\bdonde (hay|venden|ofrecen|compro|consigo|puedo)\b|\bcuanto (cuesta|cuestan|vale|valen)\b|\b(precio|precios|valor|servicio|servicios|producto|productos|hay|compr\w*|pedir|vend\w*|ofrece\w*|necesito|busco)\b/;

/**
 * Providers whose name is in the question (BR-052): the whole normalized name is contained, or all
 * its significant tokens (3+ letters, not generic words) appear as words.
 */
export function matchProviders(normalized, providers) {
  const words = new Set(normalized.split(' '));
  const scored = providers.map((provider) => {
    const name = normalize(provider.name);
    const tokens = name.split(' ').filter((t) => t.length >= 3 && !GENERIC_NAME_TOKENS.has(t));
    const matched = (name && normalized.includes(name)) || (tokens.length > 0 && tokens.every((t) => words.has(t)));
    return { provider, score: matched ? tokens.length + (normalized.includes(name) ? 0.5 : 0) : 0 };
  }).filter((entry) => entry.score > 0);
  // The most specific names win: "patitas norte" picks "Clínica Patitas Norte", not "Clínica Patitas".
  const best = Math.max(0, ...scored.map((entry) => entry.score));
  return scored.filter((entry) => entry.score === best).map((entry) => entry.provider);
}

/**
 * Classifies a question (first matching rule wins).
 * @param {string} question the owner's text
 * @param {Array<{ id: string, name: string }>} providers active providers, for name matching
 * @returns {{ intent: string, [key: string]: any }}
 */
export function classify(question, providers = []) {
  const text = normalize(question);
  if (!text) return { intent: 'fallback' };

  if ((has(text, ACTION_VERB) && has(text, APPOINTMENT_WORD)) || has(text, LEADING_IMPERATIVE)) {
    return { intent: 'action_request', linkTo: has(text, BOOKING_VERB) ? 'search' : 'owner_appointments' };
  }
  if (has(text, HELP)) return { intent: 'help' };
  if (has(text, MY_APPOINTMENTS)) return { intent: 'my_appointments' };

  const wantsHours = has(text, HOURS_WORD);
  const wantsContact = has(text, CONTACT_WORD);
  const offeringQuestion = has(text, OFFERING_WORD);
  if (wantsHours || wantsContact) {
    const matches = matchProviders(text, providers);
    if (matches.length > 1) return { intent: 'several_matches', providers: matches };
    if (matches.length === 1) return { intent: wantsHours ? 'provider_hours' : 'provider_contact', provider: matches[0] };
    if (!offeringQuestion) return { intent: 'no_match', subject: 'provider' };
  }

  // Questions about a kind of offering ("servicio", "cuesta") are offering questions even if they
  // name clinics; the providers list is only for questions about providers themselves.
  const offeringSpecific = /\b(ofrece\w*|cuesta\w*|vale|valen|precio\w*|valor|servicio\w*|producto\w*|vend\w*|compr\w*|pedir)\b/.test(text);
  if (has(text, PROVIDER_WORD) && has(text, LIST_WORD) && !offeringSpecific) {
    let filter = 'all';
    if (/\b(domicilio|casa)\b/.test(text)) filter = 'home';
    else if (/\bindependientes?\b/.test(text)) filter = 'independent';
    else if (/\bclinicas?\b/.test(text)) filter = 'clinic';
    return { intent: 'providers', filter };
  }

  if (offeringQuestion) {
    const subject = offeringSubject(question);
    if (subject) return { intent: 'offerings', subject };
  }
  return { intent: 'fallback' };
}

// Words removed from the start and end of an offering question; MIDDLE_STOP words anywhere.
const EDGE_STOP = new Set([
  'quien', 'quienes', 'que', 'cual', 'cuales', 'cuanto', 'cuanta', 'cuantos', 'cuesta', 'cuestan', 'vale', 'valen',
  'precio', 'precios', 'valor', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'en',
  'donde', 'puedo', 'compro', 'comprar', 'consigo', 'conseguir', 'pedir', 'servicio', 'servicios',
  'producto', 'productos', 'me', 'es', 'son', 'algun', 'alguna', 'algo', 'tienen', 'tiene',
  'ofrece', 'ofrecen', 'vende', 'venden', 'hace', 'hacen', 'hay', 'necesito', 'busco', 'quiero',
]);
const MIDDLE_STOP = new Set(['hay', 'tienen', 'tiene', 'ofrece', 'ofrecen', 'venden', 'vende']);

/** The offering part of a question, with its original words (accents kept) for the search. */
export function offeringSubject(question) {
  let tokens = question.replace(/[¿?¡!.,;:"«»()]/g, ' ').split(/\s+/).filter(Boolean)
    .map((word) => ({ word, folded: normalize(word) }));
  while (tokens.length && EDGE_STOP.has(tokens[0].folded)) tokens = tokens.slice(1);
  while (tokens.length && EDGE_STOP.has(tokens[tokens.length - 1].folded)) tokens = tokens.slice(0, -1);
  tokens = tokens.filter((t) => !MIDDLE_STOP.has(t.folded));
  return tokens.map((t) => t.word).join(' ').trim();
}
