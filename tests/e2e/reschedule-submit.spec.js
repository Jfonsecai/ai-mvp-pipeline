import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { expectPersistedStart, resetAppointment, signInAndOpenReschedule } from './reschedule-helpers.js';

test.beforeEach(resetAppointment);

test('owner confirms a new slot and sees the persisted appointment and return focus', async ({ page }) => {
  const state = await signInAndOpenReschedule(page);
  await mkdir(resolve('artifacts/06_implementation/evidence/US-023'), { recursive: true });
  await page.screenshot({ path: 'artifacts/06_implementation/evidence/US-023/reschedule-picker.png', fullPage: true });

  const target = page.locator(`input[name="reschedule-slot"][value="${state.targetStartsAt}"]`);
  await target.focus();
  await page.keyboard.press('Space');
  await expect(target).toBeChecked();
  const confirm = page.getByRole('button', { name: 'Confirmar nuevo horario' });
  await confirm.focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/owner\/appointments$/);
  await expect(page.getByRole('status')).toContainText('Cita reprogramada.');
  const card = page.locator('.appointment-card').filter({ hasText: 'Consulta E2E' });
  const heading = card.getByRole('heading');
  const formattedTime = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota',
  }).format(new Date(state.targetStartsAt));
  await expect(heading).toContainText(formattedTime);
  await expect(heading).toBeFocused();
  await page.screenshot({ path: 'artifacts/06_implementation/evidence/US-023/reschedule-success.png', fullPage: true });
  await expectPersistedStart(page, state, state.targetStartsAt);
});
