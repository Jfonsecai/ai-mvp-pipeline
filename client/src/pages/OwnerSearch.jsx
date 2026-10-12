import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../api/client.js';

const speciesLabel = (species) => (species === 'dog' ? 'Perro' : 'Gato');
const SPECIES_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
];
const kindLabel = (kind) => (kind === 'service' ? 'Servicio' : 'Producto');
const providerTypeLabel = (type) => (type === 'clinic' ? 'Clínica veterinaria' : 'Veterinario independiente');
const modalityLabel = (modality) => ({
  clinic: 'En la clínica',
  home: 'A domicilio',
  both: 'En la clínica y a domicilio',
})[modality];
const priceLabel = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function SearchResult({ result }) {
  return <li className="search-result">
    <h2>{result.name}</h2>
    <dl className="search-result-details">
      <div><dt>Tipo</dt><dd>{kindLabel(result.kind)}</dd></div>
      <div><dt>Especie</dt><dd>{speciesLabel(result.species)}</dd></div>
      <div><dt>Precio</dt><dd>{priceLabel.format(result.priceCop)}</dd></div>
      <div><dt>Proveedor</dt><dd><Link to={`/owner/providers/${result.provider.id}`}>{result.provider.name}</Link></dd></div>
      <div><dt>Ofrecido por</dt><dd>{providerTypeLabel(result.provider.type)}</dd></div>
      {result.kind === 'service'
        ? <div><dt>Modalidad</dt><dd>{modalityLabel(result.modality)}</dd></div>
        : <div><dt>Disponibilidad</dt><dd>{result.available ? 'Disponible' : 'No disponible'}</dd></div>}
    </dl>
    {result.kind === 'service' && <Link className="button-link button-link-secondary result-action" to={`/owner/services/${result.id}/book`} aria-label={`Agendar cita: ${result.name}`}>Agendar cita</Link>}
  </li>;
}

export default function OwnerSearch() {
  const { state: locationState } = useLocation();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [species, setSpecies] = useState('all');
  const [submittedSpecies, setSubmittedSpecies] = useState('all');
  const [results, setResults] = useState([]);
  const [searchState, setSearchState] = useState('initial');
  const [queryError, setQueryError] = useState('');
  const requestId = useRef(0);
  const registered = Boolean(locationState?.name || locationState?.pet?.name);

  useEffect(() => () => { requestId.current += 1; }, []);

  // Runs the search for already-normalized text with the given species filter (US-017).
  async function runSearch(normalized, speciesValue) {
    const currentRequest = ++requestId.current;
    setSubmittedQuery(normalized);
    setSubmittedSpecies(speciesValue);
    setSearchState('loading');

    try {
      const response = await apiFetch(`/api/search?q=${encodeURIComponent(normalized)}&species=${speciesValue}`);
      if (requestId.current !== currentRequest) return;
      setResults(response.results);
      setSearchState('complete');
    } catch {
      if (requestId.current === currentRequest) setSearchState('error');
    }
  }

  async function search(value) {
    const normalized = value.trim();
    if (!normalized) {
      setQueryError('Escribe el nombre de un servicio o producto para buscar.');
      return;
    }
    setQueryError('');
    setQuery(normalized);
    await runSearch(normalized, species);
  }

  // Changing the filter re-applies the last submitted search at once. Before any search it is only
  // remembered and applied to the first one (SCR-UX-004). Unsubmitted text in the field is left alone.
  function changeSpecies(next) {
    setSpecies(next);
    if (submittedQuery) void runSearch(submittedQuery, next);
  }

  function submit(event) {
    event.preventDefault();
    void search(query);
  }

  return <main className="page-shell search-page">
    <section className="search-card" aria-labelledby="search-title">
      {registered && <>
        <div className="success-alert" role="status">Tu cuenta ya está creada y tu primera mascota está registrada.</div>
        {locationState?.pet?.name && <p>{locationState.pet.name} ya forma parte de tu cuenta.</p>}
      </>}
      <h1 id="search-title">Buscar</h1>
      <p className="search-subtitle">Servicios y productos de veterinarias y veterinarios en Bogotá.</p>
      <form className="search-form" onSubmit={submit}>
        <label className="field-label" htmlFor="offering-query">Servicio o producto</label>
        <div className="search-controls">
          <input
            id="offering-query"
            type="search"
            value={query}
            maxLength={120}
            required
            autoComplete="off"
            aria-invalid={Boolean(queryError)}
            aria-describedby={queryError ? 'offering-query-error' : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setQueryError('');
            }}
          />
          <button className="primary-button search-submit" type="submit" disabled={searchState === 'loading'}>
            {searchState === 'loading' ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
        {queryError && <span className="field-error" id="offering-query-error">{queryError}</span>}
        <fieldset className="species-filter">
          <legend>Especie</legend>
          {SPECIES_OPTIONS.map(({ value, label }) => <label className="species-option" key={value}>
            <input
              type="radio"
              name="species-filter"
              value={value}
              checked={species === value}
              onChange={() => changeSpecies(value)}
            />
            <span>{label}</span>
          </label>)}
        </fieldset>
      </form>

      <section className="search-results" aria-label="Resultados de búsqueda">
        {searchState === 'initial' && <div className="search-empty">
          <h2>¿Qué necesita tu mascota?</h2>
          <p>Escribe el nombre de un servicio o producto para ver las opciones de todos los proveedores.</p>
        </div>}
        {searchState === 'loading' && <p role="status">Buscando servicios y productos…</p>}
        {searchState === 'error' && <div className="form-alert" role="alert">
          No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.
          <button className="link-button" type="button" onClick={() => void runSearch(submittedQuery, submittedSpecies)}>Reintentar</button>
        </div>}
        {searchState === 'complete' && results.length === 0 && <div className="search-empty" role="status">
          <h2>No encontramos resultados</h2>
          <p>{submittedSpecies === 'all' ? 'Prueba con otra palabra.' : 'Prueba con otra palabra o quita el filtro de especie.'}</p>
          {submittedSpecies !== 'all' && <button className="button-secondary" type="button" onClick={() => changeSpecies('all')}>Quitar filtro</button>}
        </div>}
        {searchState === 'complete' && results.length > 0 && <>
          <p className="search-summary" aria-live="polite">
            {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para «{submittedQuery}»
          </p>
          <ul className="search-results-list">
            {results.map((result) => <SearchResult key={result.id} result={result} />)}
          </ul>
        </>}
      </section>
    </section>
  </main>;
}
