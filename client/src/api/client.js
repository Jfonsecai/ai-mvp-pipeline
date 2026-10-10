// COMP-001 - the single place the client talks to the backend (IF-001 to IF-032, API_SPEC.yaml).
// JSON over same-origin HTTPS; the session travels in the HttpOnly cookie, never in JavaScript
// (ARCHITECTURE 6.2 COMP-001 "Data"). Browsers add the Origin header on state-changing requests,
// which the backend requires (CR-021).
//
// This module only turns responses into values or ApiError. Mapping an outcome code to a Spanish
// message (MSG-*, ADR-011) belongs to COMP-002 and the screens, not here.

export class ApiError extends Error {
  /**
   * @param {string} code a CTR-001 outcome code; UNEXPECTED when the response is not a CTR-001 body
   * @param {number} status HTTP status, 0 when the request never completed
   * @param {Array<{ field: string, reason: string }>} [fields] for VALIDATION_FAILED
   */
  constructor(code, status, fields) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

/**
 * @param {string} path API path starting with /api
 * @param {{ method?: string, body?: unknown, fetchImpl?: typeof fetch }} [options]
 * @returns {Promise<any>} the parsed JSON body, or null for 204
 * @throws {ApiError}
 */
export async function apiFetch(path, { method = 'GET', body, fetchImpl = globalThis.fetch } = {}) {
  const init = { method, headers: { Accept: 'application/json' }, credentials: 'same-origin' };
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetchImpl(path, init);
  } catch {
    throw new ApiError('UNEXPECTED', 0); // network failure -> MSG-NET in the UI
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // not JSON (for example an HTML error page from the platform)
  }

  if (!response.ok) {
    const code = typeof payload?.code === 'string' ? payload.code : 'UNEXPECTED';
    throw new ApiError(code, response.status, Array.isArray(payload?.fields) ? payload.fields : undefined);
  }
  if (payload === null) throw new ApiError('UNEXPECTED', response.status);
  return payload;
}
