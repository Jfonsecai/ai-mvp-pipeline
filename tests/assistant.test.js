// US-036 to US-040 (COMP-013): classification and answer composition on text, no database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, offeringSubject } from '../src/modules/assistant/intents.js';
import * as answers from '../src/modules/assistant/answers.js';
import { validateQuestion } from '../src/modules/assistant/assistant.js';

const P = [
  { id: 'p1', name: 'Clínica Patitas', type: 'clinic', address: 'Calle 1 # 2-3', contactPhone: '300 111 2222', contactEmail: 'patitas@x.test' },
  { id: 'p2', name: 'Clínica Patitas Norte', type: 'clinic', address: 'Calle 9', contactPhone: null, contactEmail: 'norte@x.test' },
  { id: 'p3', name: 'Dr. Huesos', type: 'independent', address: null, contactPhone: null, contactEmail: 'huesos@x.test' },
];
const intent = (q) => classify(q, P).intent;

test('UX example questions reach the intended answer kind (SCR-UX-018)', () => {
  assert.equal(intent('¿Qué veterinarias hay?'), 'providers');
  assert.equal(classify('¿Qué veterinarios a domicilio hay?', P).filter, 'home'); // AC-160
  assert.equal(classify('¿Qué clínicas hay?', P).filter, 'clinic'); // AC-131
  assert.equal(classify('¿Hay veterinarios independientes?', P).filter, 'independent');
  assert.equal(intent('¿Quién ofrece vacunación para gatos?'), 'offerings'); // AC-136
  assert.equal(intent('¿Cuánto cuesta una consulta?'), 'offerings'); // AC-138
  assert.equal(intent('¿Cuál es el horario de Dr. Huesos?'), 'provider_hours'); // AC-132
  assert.equal(intent('¿Dónde queda Dr. Huesos?'), 'provider_contact'); // AC-133
  assert.equal(intent('¿Cuándo es mi próxima cita?'), 'my_appointments'); // AC-141
  assert.equal(intent('Ayuda'), 'help'); // AC-145
  assert.equal(intent('¿Qué puedo preguntarte?'), 'help');
});

test('BR-052: provider names matched by tokens; several matches; unknown provider', () => {
  assert.equal(classify('horario de patitas norte', P).provider.id, 'p2');
  assert.equal(classify('¿A qué hora abre Clínica Patitas?', P).provider.id, 'p1');
  const twins = [{ id: 'a', name: 'Patitas Vet' }, { id: 'b', name: 'Clínica Patitas' }];
  assert.equal(classify('¿Dónde queda Patitas?', twins).intent, 'several_matches'); // AC-134
  assert.deepEqual(classify('¿Dónde queda la clínica Luna?', P), { intent: 'no_match', subject: 'provider' }); // AC-135
});

test('AC-129 / BR-045: action requests are refused, with the right link', () => {
  assert.deepEqual(classify('Cancela mi cita', P), { intent: 'action_request', linkTo: 'owner_appointments' });
  assert.deepEqual(classify('quiero agendar una cita para mañana', P), { intent: 'action_request', linkTo: 'search' });
  assert.equal(intent('¿Dónde compro alimento para gato?'), 'offerings'); // A5-VAL-001: purchase words are not actions
});

test('AC-146 / AC-147: unrecognized and medical questions fall back', () => {
  assert.equal(intent('hola'), 'fallback');
  assert.equal(intent('mi perro vomita, ¿qué hago?'), 'fallback');
  assert.match(answers.fallback().text, /agenda una cita con un veterinario/);
});

test('offering subject keeps the words of the offering, accents included', () => {
  assert.equal(offeringSubject('¿Quién ofrece corte de uñas para perros?'), 'corte de uñas para perros');
  assert.equal(offeringSubject('¿Qué servicios de baño hay para gatos?'), 'baño para gatos');
  assert.equal(offeringSubject('¿Cuánto cuesta una consulta?'), 'consulta');
});

test('AC-130 / BR-047: providers list text, rows by name, at most 5, total', () => {
  const many = Array.from({ length: 7 }, (_, i) => ({ id: `x${i}`, name: `Vet ${String.fromCharCode(71 - i)}`, type: i % 2 ? 'clinic' : 'independent' }));
  const a = answers.providersList('all', many);
  assert.equal(a.text, 'Hay 7 veterinarias y veterinarios en VetCare. Te muestro 5:');
  assert.equal(a.total, 7);
  assert.equal(a.items.length, 5);
  assert.deepEqual(a.items[0], { label: 'Vet A — Veterinario independiente', target: { screen: 'provider_profile', providerId: 'x6' } });
  assert.equal(answers.providersList('home', [P[0]]).text, 'Hay 1 proveedor con servicios a domicilio. Te muestro 1:');
});

test('AC-132 / AC-133 / EDGE-045: hours, contact without address, no hours', () => {
  assert.equal(
    answers.providerHours(P[0], [{ weekday: 2, startHour: 14, endHour: 18 }, { weekday: 1, startHour: 8, endHour: 12 }]).text,
    'Clínica Patitas atiende: lunes de 8:00 a. m. a 12:00 p. m.; martes de 2:00 p. m. a 6:00 p. m.',
  );
  assert.equal(answers.providerHours(P[2], []).text, 'Dr. Huesos aún no ha definido su horario de atención.');
  assert.equal(answers.providerContact(P[0]).text, 'Clínica Patitas: dirección Calle 1 # 2-3; teléfono 300 111 2222; correo patitas@x.test.');
  assert.equal(answers.providerContact(P[2]).text, 'Dr. Huesos: correo huesos@x.test.');
});

test('AC-136 to AC-140: offerings rows (name, species, price, provider), order by price, link when more than 5', () => {
  const r = (name, priceCop, species = 'cat') => ({ name, priceCop, species, provider: { id: 'p1', name: 'Clínica Patitas' } });
  const six = [r('Vacuna C', 30000), r('Vacuna A', 10000), r('Vacuna B', 10000), r('Vacuna D', 40000), r('Vacuna E', 50000), r('Vacuna F', 60000)];
  const a = answers.offerings({ query: 'vacuna', species: 'cat', results: six });
  assert.equal(a.text, 'Encontré 6 resultados para «vacuna» para gatos. Te muestro 5:');
  assert.equal(a.items[0].label, 'Vacuna A — Gato — $ 10.000 — Clínica Patitas');
  assert.equal(a.items[1].label.startsWith('Vacuna B'), true);
  assert.deepEqual(a.searchLink, { q: 'vacuna', species: 'cat' });
  assert.equal(answers.offerings({ query: 'baño', species: 'all', results: [] }).text, 'No encontré servicios ni productos para «baño».');
});

test('AC-141 / AC-142: next appointments, one and none', () => {
  const appt = { startsAt: '2026-10-13T09:00:00-05:00', service: { name: 'Vacunación' }, provider: { name: 'Clínica Patitas' }, pet: { name: 'Toby' } };
  assert.equal(answers.myAppointments([appt]).text, 'Tu próxima cita es el martes 13 de octubre a las 9:00 a. m.: Vacunación con Clínica Patitas para Toby.');
  assert.equal(answers.myAppointments([appt]).items[0].label, 'martes 13 de octubre 9:00 a. m. — Vacunación con Clínica Patitas — Toby');
  assert.equal(answers.myAppointments([appt, appt]).text, 'Tienes 2 citas próximas:');
  assert.equal(answers.myAppointments([]).text, 'No tienes citas próximas.');
});

test('question validation: required, type, 200 characters, viaVoice boolean', () => {
  assert.deepEqual(validateQuestion({ text: '  ' }), { fields: [{ field: 'text', reason: 'REQUIRED' }] });
  assert.deepEqual(validateQuestion({ text: 5 }), { fields: [{ field: 'text', reason: 'INVALID_FORMAT' }] });
  assert.deepEqual(validateQuestion({ text: 'a'.repeat(201) }), { fields: [{ field: 'text', reason: 'TOO_LONG' }] });
  assert.deepEqual(validateQuestion({ text: 'hola', viaVoice: 'yes' }), { fields: [{ field: 'viaVoice', reason: 'INVALID_FORMAT' }] });
  assert.deepEqual(validateQuestion({ text: ' hola ', viaVoice: true }), { value: 'hola' });
});
