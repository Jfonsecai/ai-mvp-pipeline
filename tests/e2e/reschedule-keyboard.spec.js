import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { expectPersistedStart, resetAppointment, signInAndOpenReschedule } from './reschedule-helpers.js';

test.beforeEach(resetAppointment);

test('owner can select a reschedule slot with the keyboard without changing persisted data', async ({ page }) => {
  const state = await signInAndOpenReschedule(page);
  const target = page.locator(`input[name="reschedule-slot"][value="${state.targetStartsAt}"]`);
  await target.focus();
  await page.keyboard.press('Space');
  await expect(target).toBeChecked();
  await mkdir(resolve('artifacts/06_implementation/evidence/US-023'), { recursive: true });
  await page.screenshot({ path: 'artifacts/06_implementation/evidence/US-023/reschedule-slot-selected.png', fullPage: true });
  await expectPersistedStart(page, state, state.movingStartsAt);
});
