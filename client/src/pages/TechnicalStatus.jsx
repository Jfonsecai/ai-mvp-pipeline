import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';

// TECHNICAL VERIFICATION ONLY (P06.1 section 4.1). Not a product screen and not in UX_SPEC.
// It shows that the static client is served, client routing works on a reload, /api is reachable
// and the database answers: the step-0 checks of COND-001 (a), (b) and the query part of (d).
// Remove it, or protect it, when the first real screens exist.
const CHECKS = [
  { label: 'API (Express)', path: '/api/health' },
  { label: 'Base de datos (PostgreSQL)', path: '/api/health/db' },
];

export default function TechnicalStatus() {
  const [results, setResults] = useState({});

  useEffect(() => {
    CHECKS.forEach(({ path }) => {
      apiFetch(path)
        .then(() => setResults((previous) => ({ ...previous, [path]: 'ok' })))
        .catch((error) => setResults((previous) => ({ ...previous, [path]: error.code })));
    });
  }, []);

  return (
    <main style={{ maxWidth: 'var(--size-form-max)', margin: '0 auto', padding: 'var(--spacing-6)' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', lineHeight: 'var(--line-height-tight)' }}>
        Estado técnico
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Verificación de la base técnica. Esta página no es una pantalla del producto.
      </p>
      <ul>
        {CHECKS.map(({ label, path }) => (
          <li key={path}>
            {label}: <strong>{results[path] === undefined ? 'comprobando…' : results[path]}</strong>
          </li>
        ))}
      </ul>
    </main>
  );
}
