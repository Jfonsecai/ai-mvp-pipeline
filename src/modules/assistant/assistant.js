// COMP-013 Assistant — IF-042 POST /api/assistant/messages (US-036 to US-040). Read-only and
// stateless (BR-045, BR-050, CR-028): it never writes and keeps no conversation. Questions are not
// logged (CR-027; the request logger records no body).
import { Router } from 'express';
import { Outcome } from '../../shared/outcomes.js';
import { classify } from './intents.js';
import * as answers from './answers.js';
import { listProviderFacts } from '../provider/profile.js';
import { listWorkingHours } from '../provider/working-hours.js';
import { listProvidersWithHomeService } from '../catalog/offerings.js';
import { searchOfferings } from '../search/offerings.js';
import { voiceSearch } from '../search/voice-phrase.js';
import { listOwnerAppointments } from '../scheduling/booking.js';

const MAX_QUESTION = 200;

export function validateQuestion(body) {
  const text = typeof body?.text === 'string' ? body.text.trim() : undefined;
  if (body?.text === undefined || text === '') return { fields: [{ field: 'text', reason: 'REQUIRED' }] };
  if (text === undefined) return { fields: [{ field: 'text', reason: 'INVALID_FORMAT' }] };
  if ([...text].length > MAX_QUESTION) return { fields: [{ field: 'text', reason: 'TOO_LONG' }] };
  if (body.viaVoice !== undefined && typeof body.viaVoice !== 'boolean') return { fields: [{ field: 'viaVoice', reason: 'INVALID_FORMAT' }] };
  return { value: text };
}

/** Answers one question for one owner (exported for tests). */
export async function answerQuestion(db, { ownerId, text, now }) {
  const providers = await listProviderFacts(db);
  const result = classify(text, providers);
  switch (result.intent) {
    case 'action_request': return answers.actionRequest(result.linkTo);
    case 'help': return answers.help();
    case 'my_appointments': {
      const all = await listOwnerAppointments(db, { ownerId, now });
      return answers.myAppointments(all.filter((a) => a.status === 'scheduled' && a.upcoming)); // BR-048
    }
    case 'several_matches': return answers.severalMatches(result.providers);
    case 'provider_hours': return answers.providerHours(result.provider, await listWorkingHours(db, result.provider.id));
    case 'provider_contact': return answers.providerContact(result.provider);
    case 'no_match': return answers.noProvider();
    case 'providers': {
      let selected = providers;
      if (result.filter === 'home') {
        const home = new Set(await listProvidersWithHomeService(db));
        selected = providers.filter((p) => home.has(p.id));
      } else if (result.filter !== 'all') {
        selected = providers.filter((p) => p.type === result.filter);
      }
      return answers.providersList(result.filter, selected);
    }
    case 'offerings': {
      // Same interpretation and search as the voice search (CR-031, BR-042, BR-053).
      const search = await voiceSearch((args) => searchOfferings(db, args), result.subject, 'all');
      if (search.outcome === 'empty_query') return answers.fallback();
      return answers.offerings(search);
    }
    default: return answers.fallback();
  }
}

export function createAssistantRouter({ db, guard, clock }) {
  const router = Router();
  router.post('/assistant/messages', guard({ role: 'owner' }), async (req, res) => {
    const validation = validateQuestion(req.body);
    if (validation.fields) throw new Outcome('VALIDATION_FAILED', { fields: validation.fields });
    res.json(await answerQuestion(db, { ownerId: req.session.accountId, text: validation.value, now: clock.now() }));
  });
  return router;
}
