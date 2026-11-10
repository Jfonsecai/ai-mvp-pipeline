// COMP-008 Search and Discovery — voice phrase interpretation (US-035; BR-043, BR-044, BR-053).
// One implementation, used by the voice search (IF-041) and the assistant (IF-045) — CR-031.
// Pure functions: no database, no I/O, so the rules are unit-tested on text (P03-RISK-011).

const MAX_QUERY_LENGTH = 120; // same limit as the typed search (P05-ASM-023)

// Accent folding for matching only; the words placed in the search box keep their accents.
export function fold(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n');
}

// BR-043: species words (case- and accent-insensitive).
const SPECIES_WORDS = new Map([
  ['perro', 'dog'], ['perros', 'dog'], ['perrito', 'dog'], ['perritos', 'dog'],
  ['gato', 'cat'], ['gatos', 'cat'], ['gatito', 'cat'], ['gatitos', 'cat'],
]);

// BR-044: filler words removed only at the start and at the end of the phrase.
const LEADING_PHRASES = [['estoy', 'buscando'], ['me', 'gustaria'], ['busco'], ['buscar'], ['quiero'], ['necesito']];
const LEADING_ARTICLES = new Set(['un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las']);
const TRAILING_PHRASES = [['por', 'favor']];

/** Splits a transcript into words, dropping punctuation; each word keeps its original form. */
function tokenize(transcript) {
  return transcript
    .replace(/[¿?¡!.,;:"«»()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word: word.toLowerCase(), folded: fold(word) }));
}

const startsWith = (tokens, phrase) => phrase.every((part, i) => tokens[i]?.folded === part);
const endsWith = (tokens, phrase) => phrase.every((part, i) => tokens[tokens.length - phrase.length + i]?.folded === part);

/** BR-044: removes leading verbs (then articles) and trailing "por favor". */
function stripFillers(tokens) {
  let rest = [...tokens];
  let changed = true;
  while (changed) {
    changed = false;
    for (const phrase of LEADING_PHRASES) {
      if (startsWith(rest, phrase)) {
        rest = rest.slice(phrase.length);
        changed = true;
      }
    }
  }
  while (rest.length && LEADING_ARTICLES.has(rest[0].folded)) rest = rest.slice(1);
  for (const phrase of TRAILING_PHRASES) if (endsWith(rest, phrase)) rest = rest.slice(0, rest.length - phrase.length);
  return rest;
}

/** BR-043: removes each species word together with the connector right before it. */
function stripSpecies(tokens) {
  const found = new Set();
  const kept = [];
  for (const [index, token] of tokens.entries()) {
    const species = SPECIES_WORDS.get(token.folded);
    if (!species) {
      // "perros y gatos": a conjunction between two species words goes with them (EDGE-037).
      const between = (token.folded === 'y' || token.folded === 'o')
        && SPECIES_WORDS.has(tokens[index - 1]?.folded) && SPECIES_WORDS.has(tokens[index + 1]?.folded);
      if (!between) kept.push(token);
      continue;
    }
    found.add(species);
    // Connectors: "para mi", "para mis", "para", "de".
    const last = kept[kept.length - 1]?.folded;
    const beforeLast = kept[kept.length - 2]?.folded;
    if ((last === 'mi' || last === 'mis') && beforeLast === 'para') kept.splice(-2, 2);
    else if (last === 'para' || last === 'de') kept.pop();
  }
  return { tokens: kept, found };
}

const join = (tokens) => tokens.map((t) => t.word).join(' ').slice(0, MAX_QUERY_LENGTH).trim();

/**
 * Interprets a spoken search phrase (FR-041).
 * @param {string} transcript text recognized by the browser
 * @returns {{ query: string, querySpeciesKept: string, species: 'dog' | 'cat' | 'all' | null }}
 *   `query` is the text to search (empty → no search, AC-120); `querySpeciesKept` is the BR-053
 *   retry text (species words kept, fillers removed); `species` is the spoken species, `all` when
 *   both are named (EDGE-037), or null when none is named (the current filter stays, AC-119).
 */
export function interpretPhrase(transcript) {
  const tokens = tokenize(transcript);
  const { tokens: withoutSpecies, found } = stripSpecies(tokens);
  let species = null;
  if (found.size === 2) species = 'all';
  else if (found.size === 1) species = [...found][0];
  return {
    query: join(stripFillers(withoutSpecies)),
    querySpeciesKept: join(stripFillers(tokens)),
    species,
  };
}

/**
 * Voice search (IF-041 core, also used by the assistant through IF-045): interpret, search, and
 * retry once with the species words kept when nothing was found (BR-053).
 * @param {(args: { q: string, species: string }) => Promise<any[]>} search the shared search query
 * @param {string} transcript
 * @param {'all' | 'dog' | 'cat'} currentSpecies the filter selected before speaking
 */
export async function voiceSearch(search, transcript, currentSpecies = 'all') {
  const { query, querySpeciesKept, species: spoken } = interpretPhrase(transcript);
  const species = spoken ?? currentSpecies;
  if (!query) return { outcome: 'empty_query', species, retried: false, results: [] };
  let results = await search({ q: query, species });
  if (results.length || !spoken || querySpeciesKept === query) {
    return { outcome: 'searched', query, species, retried: false, results };
  }
  results = await search({ q: querySpeciesKept, species });
  if (results.length) return { outcome: 'searched', query: querySpeciesKept, species, retried: true, results };
  return { outcome: 'searched', query, species, retried: false, results: [] };
}
