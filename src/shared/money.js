// COMP-010 Shared Kernel - money is whole Colombian pesos, greater than 0 (CR-011, ADR-008).
// Integer end to end: no decimals, no currency field.

/** True for an integer number of pesos greater than 0 that fits the database `integer` column. */
export function isValidPriceCop(value) {
  return Number.isSafeInteger(value) && value > 0 && value <= 2_147_483_647;
}
