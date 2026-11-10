import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { expect } from '@playwright/test';
import { stateFile } from './state.js';

export async function readState() {
  return JSON.parse(await readFile(stateFile, 'utf8'));
}

export async function resetAppointment() {
  const state = await readState();
  const database = new pg.Client({
    connectionString: process.env.TEST_DATABASE_URL,
    options: `-c search_path=${state.schema}`,
  });
  try {
    await database.connect();
    await database.query(
      'UPDATE appointment SET starts_at = $2 WHERE id = $1 AND status = $3',
      [state.movingAppointmentId, state.movingStartsAt, 'scheduled'],
    );
    await database.query(
      'UPDATE appointment SET starts_at = $2 WHERE id = $1 AND status = $3',
      [state.occupiedAppointmentId, state.occupiedStartsAt, 'scheduled'],
    );
  } finally {
    await database.end();
  }
}

export async function signInAndOpenReschedule(page) {
  const state = await readState();
  await page.goto('/sign-in');
  await page.getByRole('radio', { name: 'Dueño de mascota' }).check();
  await page.getByLabel('Correo electrónico').fill(state.email);
  await page.getByLabel('Contraseña').fill('incorrect-e2e-password');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('alert')).toContainText('No pudimos iniciar sesión');
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByLabel('Contraseña').fill(state.password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/owner\/home$/);
  await page.getByRole('link', { name: 'Mis citas' }).click();
  await expect(page.getByRole('heading', { name: 'Mis citas' })).toBeVisible();
  await page.getByRole('link', { name: 'Reprogramar cita: Consulta E2E' }).click();
  await expect(page.getByRole('heading', { name: 'Reprogramar cita' })).toBeVisible();
  const slots = page.locator('input[name="reschedule-slot"]');
  await expect(slots).toHaveCount(2);
  await expect(page.locator(`input[name="reschedule-slot"][value="${state.movingStartsAt}"]`)).toHaveCount(0);
  await expect(page.locator(`input[name="reschedule-slot"][value="${state.occupiedStartsAt}"]`)).toHaveCount(0);
  return state;
}

export async function expectPersistedStart(page, state, startsAt) {
  const response = await page.request.get('/api/owner/appointments');
  expect(response.ok()).toBeTruthy();
  const { appointments } = await response.json();
  const appointment = appointments.find(({ id }) => id === state.movingAppointmentId);
  expect(appointment?.startsAt).toBe(startsAt);
}
