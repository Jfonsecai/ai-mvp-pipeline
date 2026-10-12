// COMP-008 Search and Discovery — US-016 text search (IF-007, read-only).
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';

const MAX_QUERY_LENGTH = 120;
const ACCENT_FROM = 'áéíóúü';
const ACCENT_TO = 'aeiouu';

export function validateSearchQuery(input) {
  if (input === undefined || input === null || input === '') {
    return { fields: [{ field: 'q', reason: 'REQUIRED' }] };
  }
  if (typeof input !== 'string') {
    return { fields: [{ field: 'q', reason: 'INVALID_FORMAT' }] };
  }
  const value = input.trim();
  if (!value) return { fields: [{ field: 'q', reason: 'REQUIRED' }] };
  if ([...value].length > MAX_QUERY_LENGTH) {
    return { fields: [{ field: 'q', reason: 'TOO_LONG' }] };
  }
  return { value };
}

function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, '\\$&');
}

function searchResult(row) {
  const result = {
    id: row.id,
    kind: row.kind,
    name: row.name,
    priceCop: Number(row.price_cop),
    species: row.species,
    provider: {
      id: row.provider_id,
      name: row.public_name,
      type: row.provider_type,
    },
  };
  if (row.kind === 'service') result.modality = row.modality;
  else result.available = row.available;
  return result;
}

export function createSearchRouter({ db, guard }) {
  const router = Router();

  router.get('/search', guard({ role: 'owner' }), async (req, res) => {
    const validation = validateSearchQuery(req.query.q);
    if (validation.fields) throw new Outcome('VALIDATION_FAILED', { fields: validation.fields });

    const result = await db.query(
      `SELECT o.id, o.kind, o.name, o.price_cop, o.species, o.modality, o.available,
              p.provider_id, p.public_name, p.provider_type
         FROM offering o
         JOIN provider_profile p ON p.provider_id = o.provider_id
        WHERE translate(lower(o.name), '${ACCENT_FROM}', '${ACCENT_TO}')
              LIKE '%' || translate(lower($1), '${ACCENT_FROM}', '${ACCENT_TO}') || '%' ESCAPE E'\\\\'`,
      [escapeLikePattern(validation.value)],
    );
    res.json({ results: result.rows.map(searchResult) });
  });

  return router;
}
