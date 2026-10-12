// COMP-008 Search and Discovery — US-016 text search and US-017 species filter (IF-007, read-only).
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';

const MAX_QUERY_LENGTH = 120;
const SPECIES_FILTERS = new Set(['all', 'dog', 'cat']); // API_SPEC SpeciesFilter
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

/**
 * Optional `species` query parameter (CTR-005 SpeciesFilter). Absent means `all`. The filter is on
 * the species of the offering, never on the owner's pets (BR-008, AC-042).
 */
export function validateSpeciesFilter(input) {
  if (input === undefined) return { value: 'all' };
  if (typeof input !== 'string') return { fields: [{ field: 'species', reason: 'INVALID_FORMAT' }] };
  if (!SPECIES_FILTERS.has(input)) return { fields: [{ field: 'species', reason: 'NOT_ALLOWED' }] };
  return { value: input };
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
    const speciesFilter = validateSpeciesFilter(req.query.species);
    const fields = [...(validation.fields ?? []), ...(speciesFilter.fields ?? [])];
    if (fields.length) throw new Outcome('VALIDATION_FAILED', { fields });

    // Text and species both apply (AC-086); "all" adds no condition (AC-043).
    const params = [escapeLikePattern(validation.value)];
    let speciesCondition = '';
    if (speciesFilter.value !== 'all') {
      params.push(speciesFilter.value);
      speciesCondition = ' AND o.species = $2';
    }

    const result = await db.query(
      `SELECT o.id, o.kind, o.name, o.price_cop, o.species, o.modality, o.available,
              p.provider_id, p.public_name, p.provider_type
         FROM offering o
         JOIN provider_profile p ON p.provider_id = o.provider_id
        WHERE translate(lower(o.name), '${ACCENT_FROM}', '${ACCENT_TO}')
              LIKE '%' || translate(lower($1), '${ACCENT_FROM}', '${ACCENT_TO}') || '%' ESCAPE E'\\\\'${speciesCondition}`,
      params,
    );
    res.json({ results: result.rows.map(searchResult) });
  });

  return router;
}
