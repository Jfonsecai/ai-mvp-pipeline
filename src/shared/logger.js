// COMP-010 Shared Kernel - logging without sensitive data (CR-020, CR-005).
// Logs carry event names, outcome codes, operation names and IDs only: never passwords, tokens,
// emails, phones, addresses, request bodies, headers or query strings. One JSON object per line.

const FORBIDDEN_KEYS = /pass(word)?|token|secret|cookie|authorization|email|phone|address|database_?url/i;

/**
 * @param {{ write?: (line: string) => void, level?: 'debug' | 'info' | 'error' }} [options]
 */
export function createLogger({ write = (line) => process.stdout.write(`${line}\n`), level = 'info' } = {}) {
  const order = { debug: 0, info: 1, error: 2 };

  function emit(severity, event, fields = {}) {
    if (order[severity] < order[level]) return;
    const safe = {};
    for (const [key, value] of Object.entries(fields)) {
      // Defensive: a field named like sensitive data is dropped rather than logged.
      if (!FORBIDDEN_KEYS.test(key)) safe[key] = value;
    }
    write(JSON.stringify({ time: new Date().toISOString(), severity, event, ...safe }));
  }

  return Object.freeze({
    debug: (event, fields) => emit('debug', event, fields),
    info: (event, fields) => emit('info', event, fields),
    error: (event, fields) => emit('error', event, fields),
  });
}
