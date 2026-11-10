import { expect, test } from '@playwright/test';
import { expectPersistedStart, resetAppointment, signInAndOpenReschedule } from './reschedule-helpers.js';

test.beforeEach(resetAppointment);

test('owner sees only future, unoccupied reschedule slots and the appointment remains unchanged', async ({ page }) => {
  const state = await signInAndOpenReschedule(page);
  const slotValues = await page.locator('input[name="reschedule-slot"]').evaluateAll((inputs) =>
    inputs.map(({ value }) => value).sort(),
  );
  expect(slotValues).toEqual([state.availableStartsAt, state.targetStartsAt].sort());
  await expectPersistedStart(page, state, state.movingStartsAt);
});
