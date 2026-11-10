// COMP-007 Catalog — IF-006 service publication (US-010), product publication (US-013) and provider catalog.
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';
import { isUuid } from '../../shared/ids.js';
import { withTransaction } from '../../shared/transaction.js';
import { lockProvider } from '../provider/profile.js';
import { cancelUpcomingServiceAppointments } from '../scheduling/cancellation.js';

const SERVICE_FIELDS = new Set(['name', 'priceCop', 'species', 'modality']);
const PRODUCT_FIELDS = new Set(['name', 'priceCop', 'species']);
const SPECIES = new Set(['dog', 'cat']);
const MODALITIES = new Set(['clinic', 'home', 'both']);
const MAX_PRICE_COP = 2_147_483_647;

function validationError(fields) {
  return new Outcome('VALIDATION_FAILED', { fields });
}

const isMissing = (value) => value === undefined || value === null || value === '';

/** Shared offering-field checks (BR-006, BR-027, BR-032): a missing, null or blank value is REQUIRED. */
function checkName(input, fields) {
  const value = input.name;
  if (value === undefined || value === null) fields.push({ field: 'name', reason: 'REQUIRED' });
  else if (typeof value !== 'string') fields.push({ field: 'name', reason: 'INVALID_FORMAT' });
  else {
    const name = value.trim();
    if (!name) fields.push({ field: 'name', reason: 'REQUIRED' });
    else if ([...name].length > 120) fields.push({ field: 'name', reason: 'TOO_LONG' });
    else return name;
  }
  return undefined;
}

function checkPrice(input, fields) {
  const value = input.priceCop;
  if (isMissing(value)) fields.push({ field: 'priceCop', reason: 'REQUIRED' });
  else if (typeof value !== 'number' || !Number.isInteger(value)) fields.push({ field: 'priceCop', reason: 'INVALID_FORMAT' });
  else if (value < 1 || value > MAX_PRICE_COP) fields.push({ field: 'priceCop', reason: 'OUT_OF_RANGE' });
  return value;
}

function checkSpecies(input, fields) {
  const value = input.species;
  if (isMissing(value)) fields.push({ field: 'species', reason: 'REQUIRED' });
  else if (typeof value !== 'string' || !SPECIES.has(value)) fields.push({ field: 'species', reason: 'NOT_ALLOWED' });
  return value;
}

function checkShape(input, allowed, fields) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) fields.push({ field: key, reason: 'NOT_ALLOWED' });
  }
  return true;
}

export function validatePublishService(input, providerType) {
  const fields = [];
  if (!checkShape(input, SERVICE_FIELDS, fields)) return { fields: [{ field: 'form', reason: 'REQUIRED' }] };

  const name = checkName(input, fields);
  const priceCop = checkPrice(input, fields);
  const species = checkSpecies(input, fields);

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

/** IF-006 publishProduct request (CTR-005 PublishProductRequest): name, price and exactly one species. */
export function validatePublishProduct(input) {
  const fields = [];
  if (!checkShape(input, PRODUCT_FIELDS, fields)) return { fields: [{ field: 'form', reason: 'REQUIRED' }] };

  const name = checkName(input, fields);
  const priceCop = checkPrice(input, fields);
  const species = checkSpecies(input, fields);

  if (fields.length) return { fields };
  return { value: { name, priceCop, species } };
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

/**
 * IF-021 offering facts: a read-only query owned by COMP-007 for other modules (the provider's own
 * catalog and the COMP-008 public profile). Services and products in publication order.
 */
export async function listProviderOfferings(db, providerId) {
  const result = await db.query(
    `SELECT id, kind, name, price_cop, species, modality, available
       FROM offering
      WHERE provider_id = $1 AND removed_at IS NULL
      ORDER BY created_at, id`,
    [providerId],
  );
  const services = [];
  const products = [];
  for (const row of result.rows) {
    if (row.kind === 'service') services.push(catalogService(row));
    else products.push(catalogProduct(row));
  }
  return { services, products };
}

/**
 * IF-021 service facts: a read-only query owned by COMP-007 for COMP-009 (booking). Returns null
 * when the identifier is not a service.
 */
export async function getServiceFacts(db, serviceId, { includeRemoved = false } = {}) {
  const result = await db.query(
    `SELECT id, provider_id, provider_type, name, price_cop, species, modality
       FROM offering
      WHERE id = $1 AND kind = 'service'${includeRemoved ? '' : ' AND removed_at IS NULL'}`,
    [serviceId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    providerId: row.provider_id,
    providerType: row.provider_type,
    name: row.name,
    priceCop: Number(row.price_cop),
    species: row.species,
    modality: row.modality,
  };
}

/** IF-047 (iteration 2): providers with at least one active service offered at home (BR-054). */
export async function listProvidersWithHomeService(db) {
  const result = await db.query(
    `SELECT DISTINCT provider_id
       FROM offering
      WHERE kind = 'service' AND modality IN ('home', 'both') AND removed_at IS NULL`,
  );
  return result.rows.map((row) => row.provider_id);
}

/**
 * IF-037 removeOffering (US-012 services, US-015 products): in one transaction, under the provider lock
 * (IF-024), marks the provider's own active offering as removed. For a service it also cancels the upcoming
 * appointments (IF-044); for a product `cancelledAppointments` is 0 and nothing else is touched: orders
 * already placed keep their status (AC-085, EDGE-019, P02-ASM-012), which is why removal is logical
 * (`removed_at`) and the row stays referenced by `product_order` (ADR-020). Another provider's offering,
 * an unknown id and an already removed offering are all NOT_FOUND (CR-006). `db` is a pool.
 */
export async function removeOffering(db, { providerId, offeringId, now }) {
  return withTransaction(db, async (client) => {
    if (!(await lockProvider(client, providerId))) throw new Outcome('NOT_FOUND');
    const offering = await client.query(
      `SELECT id, kind FROM offering
        WHERE id = $1 AND provider_id = $2 AND removed_at IS NULL
          FOR UPDATE`,
      [offeringId, providerId],
    );
    if (!offering.rows.length) throw new Outcome('NOT_FOUND');
    await client.query('UPDATE offering SET removed_at = $2 WHERE id = $1', [offeringId, now]);
    const cancelledAppointments = offering.rows[0].kind === 'service'
      ? await cancelUpcomingServiceAppointments(client, { serviceId: offeringId, now })
      : 0;
    return { removed: true, cancelledAppointments };
  });
}

export function createCatalogRouter({ db, guard, clock }) {
  const router = Router();

  router.get('/provider/offerings', guard({ role: 'provider' }), async (req, res) => {
    await providerTypeFor(db, req.session.accountId);
    res.json(await listProviderOfferings(db, req.session.accountId));
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

  // IF-036 updateService (US-011): replaces the details of one of the provider's own active services
  // with the same validation as publishing (BR-006, BR-007). A service of another provider, a product,
  // a removed offering and a malformed id are all the same NOT_FOUND (AC-031, CR-006). The provider
  // lock (IF-024) serializes the change with bookings, removals and hours saves. Appointments that
  // are already booked are never touched (P04-ASM-036).
  router.put('/provider/services/:offeringId', guard({ role: 'provider' }), async (req, res) => {
    if (!isUuid(req.params.offeringId)) throw new Outcome('NOT_FOUND');
    const providerId = req.session.accountId;
    const providerType = await providerTypeFor(db, providerId);
    const validation = validatePublishService(req.body, providerType);
    if (validation.fields) throw validationError(validation.fields);

    const { name, priceCop, species, modality } = validation.value;
    const saved = await withTransaction(db, async (client) => {
      if (!(await lockProvider(client, providerId))) throw new Outcome('NOT_FOUND');
      const result = await client.query(
        `UPDATE offering
            SET name = $3, price_cop = $4, species = $5, modality = $6
          WHERE id = $1 AND provider_id = $2 AND kind = 'service' AND removed_at IS NULL
          RETURNING id, name, price_cop, species, modality`,
        [req.params.offeringId.toLowerCase(), providerId, name, priceCop, species, modality],
      );
      return result.rows[0];
    });
    if (!saved) throw new Outcome('NOT_FOUND');
    res.json(catalogService(saved));
  });

  // IF-036 updateProduct (US-014): replaces name, price and species of one of the provider's own active
  // products with the publish validator (BR-006, BR-032). Availability is not part of the body and is
  // never changed here (API_SPEC_V2). A product of another provider, a service, a removed offering and a
  // malformed id are all the same NOT_FOUND (AC-036, CR-006). One conditional UPDATE is atomic, so no
  // transaction or provider lock is needed: no booking-like operation depends on a product's details yet.
  router.put('/provider/products/:offeringId', guard({ role: 'provider' }), async (req, res) => {
    if (!isUuid(req.params.offeringId)) throw new Outcome('NOT_FOUND');
    const providerId = req.session.accountId;
    await providerTypeFor(db, providerId);
    const validation = validatePublishProduct(req.body);
    if (validation.fields) throw validationError(validation.fields);

    const { name, priceCop, species } = validation.value;
    const result = await db.query(
      `UPDATE offering
          SET name = $3, price_cop = $4, species = $5
        WHERE id = $1 AND provider_id = $2 AND kind = 'product' AND removed_at IS NULL
        RETURNING id, name, price_cop, species, available`,
      [req.params.offeringId.toLowerCase(), providerId, name, priceCop, species],
    );
    if (!result.rows.length) throw new Outcome('NOT_FOUND');
    res.json(catalogProduct(result.rows[0]));
  });

  // IF-037 removeOffering (US-012 services, US-015 products): logical removal; a removed service's upcoming
  // appointments are cancelled. Answers the RemovalResult of API_SPEC_V2.
  router.delete('/provider/offerings/:offeringId', guard({ role: 'provider' }), async (req, res) => {
    if (!isUuid(req.params.offeringId)) throw new Outcome('NOT_FOUND');
    res.json(await removeOffering(db, {
      providerId: req.session.accountId,
      offeringId: req.params.offeringId.toLowerCase(),
      now: clock.now(),
    }));
  });

  router.post('/provider/products', guard({ role: 'provider' }), async (req, res) => {
    const providerId = req.session.accountId;
    const providerType = await providerTypeFor(db, providerId);
    const validation = validatePublishProduct(req.body);
    if (validation.fields) throw validationError(validation.fields);

    // Every new product is published as available (AC-111, BR-031, TD-13); products have no modality.
    const { name, priceCop, species } = validation.value;
    const result = await db.query(
      `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, available)
       VALUES ($1, $2, 'product', $3, $4, $5, true)
       RETURNING id, name, price_cop, species, available`,
      [providerId, providerType, name, priceCop, species],
    );
    res.status(201).json(catalogProduct(result.rows[0]));
  });

  return router;
}
