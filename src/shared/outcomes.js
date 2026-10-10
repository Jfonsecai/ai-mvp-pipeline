// COMP-010 Shared Kernel - outcome and reason codes (CTR-001, ADR-011).
// The list is closed: the backend returns only these codes, never internal messages (CR-005).

export const OUTCOME_HTTP_STATUS = Object.freeze({
  VALIDATION_FAILED: 422,
  DUPLICATE_ACCOUNT_FOR_TYPE: 409,
  INVALID_CREDENTIALS: 401,
  UNAUTHENTICATED: 401,
  SESSION_EXPIRED: 401,
  FORBIDDEN_ORIGIN: 403,
  NOT_FOUND: 404,
  SLOT_UNAVAILABLE: 409,
  PET_NOT_ELIGIBLE: 422,
  NO_PETS: 422,
  PRODUCT_UNAVAILABLE: 409,
  ORDER_STATUS_CHANGED: 409,
  UNEXPECTED: 500,
});

export const OUTCOME_CODES = Object.freeze(Object.keys(OUTCOME_HTTP_STATUS));

export const REASON_CODES = Object.freeze([
  'REQUIRED',
  'INVALID_FORMAT',
  'OUT_OF_RANGE',
  'TOO_SHORT',
  'TOO_LONG',
  'NOT_ON_THE_HOUR',
  'END_NOT_AFTER_START',
  'NOT_ALLOWED',
]);

/**
 * A business outcome that the API boundary (COMP-003) maps to an ErrorResponse (CTR-001).
 * Modules throw it (or the boundary raises it); nothing else leaves the backend.
 */
export class Outcome extends Error {
  /**
   * @param {string} code one of OUTCOME_CODES
   * @param {{ fields?: Array<{ field: string, reason: string }> }} [options]
   */
  constructor(code, { fields } = {}) {
    super(code);
    if (!(code in OUTCOME_HTTP_STATUS)) {
      throw new TypeError(`Unknown outcome code: ${code}`);
    }
    this.name = 'Outcome';
    this.code = code;
    this.fields = fields;
  }

  get status() {
    return OUTCOME_HTTP_STATUS[this.code];
  }

  /** The CTR-001 response body: only `code`, plus `fields` for VALIDATION_FAILED. */
  toBody() {
    const body = { code: this.code };
    if (this.code === 'VALIDATION_FAILED' && this.fields) body.fields = this.fields;
    return body;
  }
}
