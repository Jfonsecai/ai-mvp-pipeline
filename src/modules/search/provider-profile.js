// COMP-008 Search and Discovery — IF-008 public provider profile (US-018, read-only).
// Owns no table: provider facts come from COMP-006 (IF-019) and offerings from COMP-007 (IF-021).
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';
import { isUuid } from '../../shared/ids.js';
import { getProviderFacts } from '../provider/profile.js';
import { listProviderOfferings } from '../catalog/offerings.js';

/** CTR-005 PublicProviderProfile: address and phone are omitted when the provider has none (AC-045). */
function publicProfile(facts, { services, products }) {
  return {
    id: facts.id,
    name: facts.name,
    type: facts.type,
    ...(facts.address ? { address: facts.address } : {}),
    ...(facts.contactPhone ? { contactPhone: facts.contactPhone } : {}),
    contactEmail: facts.contactEmail,
    services,
    products,
  };
}

export function createPublicProviderProfileRouter({ db, guard }) {
  const router = Router();

  router.get('/providers/:providerId', guard({ role: 'owner' }), async (req, res) => {
    // A malformed or unknown identifier is indistinguishable from any missing resource (CR-006).
    if (!isUuid(req.params.providerId)) throw new Outcome('NOT_FOUND');
    const facts = await getProviderFacts(db, req.params.providerId.toLowerCase());
    if (!facts) throw new Outcome('NOT_FOUND');
    res.json(publicProfile(facts, await listProviderOfferings(db, facts.id)));
  });

  return router;
}
