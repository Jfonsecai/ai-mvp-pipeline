// COMP-007 Catalog — IF-006 service publication and provider catalog (US-010).
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';

const SERVICE_FIELDS = new Set(['name', 'priceCop', 'species', 'modality']);
const SPECIES = new Set(['dog', 'cat']);
const MODALITIES = new Set(['clinic', 'home', 'both']);
const MAX_PRICE_COP = 2_147_483_647;

function validationError(fields) {
  return new Outcome('VALIDATION_FAILED', { fields });
}

export function validatePublishService(input, providerType) {
  const fields = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { fields: [{ field: 'form', reason: 'REQUIRED' }] };
  }

  for (const key of Object.keys(input)) {
    if (!SERVICE_FIELDS.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });
  }

  let name;
  if (input.name === undefined) fields.push({ field: 'name', reason: 'REQUIRED' });
  else if (typeof input.name !== 'string') fields.push({ field: 'name', reason: 'INVALID_FORMAT' });
  else {
    name = input.name.trim();
    if (!name) fields.push({ field: 'name', reason: 'REQUIRED' });
    else if ([...name].length > 120) fields.push({ field: 'name', reason: 'TOO_LONG' });
  }

  const priceCop = input.priceCop;
  if (priceCop === undefined) fields.push({ field: 'priceCop', reason: 'REQUIRED' });
  else if (typeof priceCop !== 'number' || !Number.isInteger(priceCop)) {
    fields.push({ field: 'priceCop', reason: 'INVALID_FORMAT' });
  } else if (priceCop < 1 || priceCop > MAX_PRICE_COP) {
    fields.push({ field: 'priceCop', reason: 'OUT_OF_RANGE' });
  }

  const species = input.species;
  if (species === undefined) fields.push({ field: 'species', reason: 'REQUIRED' });
  else if (typeof species !== 'string' || !SPECIES.has(species)) {
    fields.push({ field: 'species', reason: 'NOT_ALLOWED' });
  }

  let modality;
  if (providerType === 'independent') {
    if (input.modality !== undefined && input.modality !== 'home') {
      fields.push({ field: 'modality', reason: 'NOT_ALLOWED' });
    }
    modality = 'home';
  } else if (providerType === 'clinic') {
    if (input.modality === undefined) fields.push({ field: 'modality', reason: 'REQUIRED' });
    else if (typeof input.modality !== 'string' || !MODALITIES.has(input.modality)) {
      fields.push({ field: 'modality', reason: 'NOT_ALLOWED' });
    } else modality = input.modality;
  } else {
    throw new TypeError('Provider profile has an unsupported provider type');
  }

  if (fields.length) return { fields };
  return { value: { name, priceCop, species, modality } };
}

function catalogService(row) {
  return {
    id: row.id,
    kind: 'service',
    name: row.name,
    priceCop: Number(row.price_cop),
    species: row.species,
    modality: row.modality,
  };
}

function catalogProduct(row) {
  return {
    id: row.id,
    kind: 'product',
    name: row.name,
    priceCop: Number(row.price_cop),
    species: row.species,
    available: row.available,
  };
}

async function providerTypeFor(db, providerId) {
  const result = await db.query(
    'SELECT provider_type FROM provider_profile WHERE provider_id = $1',
    [providerId],
  );
  if (!result.rows.length) throw new Outcome('NOT_FOUND');
  return result.rows[0].provider_type;
}

export function createCatalogRouter({ db, guard }) {
  const router = Router();

  router.get('/provider/offerings', guard({ role: 'provider' }), async (req, res) => {
    await providerTypeFor(db, req.session.accountId);
    const result = await db.query(
      `SELECT id, kind, name, price_cop, species, modality, available
         FROM offering
        WHERE provider_id = $1
        ORDER BY created_at, id`,
      [req.session.accountId],
    );
    const services = [];
    const products = [];
    for (const row of result.rows) {
      if (row.kind === 'service') services.push(catalogService(row));
      else products.push(catalogProduct(row));
    }
    res.json({ services, products });
  });

  router.post('/provider/services', guard({ role: 'provider' }), async (req, res) => {
    const providerId = req.session.accountId;
    const providerType = await providerTypeFor(db, providerId);
    const validation = validatePublishService(req.body, providerType);
    if (validation.fields) throw validationError(validation.fields);

    const { name, priceCop, species, modality } = validation.value;
    const result = await db.query(
      `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
       VALUES ($1, $2, 'service', $3, $4, $5, $6)
       RETURNING id, name, price_cop, species, modality`,
      [providerId, providerType, name, priceCop, species, modality],
    );
    res.status(201).json(catalogService(result.rows[0]));
  });

  return router;
}
