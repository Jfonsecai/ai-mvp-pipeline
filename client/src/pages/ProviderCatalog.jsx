import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../api/client.js';

const speciesLabel = (species) => (species === 'dog' ? 'Perro' : 'Gato');
const modalityLabel = (modality) => ({
  clinic: 'En mi clínica',
  home: 'A domicilio',
  both: 'En clínica y a domicilio',
})[modality];
const priceLabel = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function OfferingList({ items, kind }) {
  if (!items.length) {
    return <p className="catalog-empty">Aún no has publicado {kind === 'service' ? 'servicios' : 'productos'}.</p>;
  }
  return <ul className="catalog-list">
    {items.map((item) => <li className="catalog-item" key={item.id}>
      <h3>{item.name}</h3>
      <dl className="catalog-details">
        <div><dt>Tipo</dt><dd>{kind === 'service' ? 'Servicio' : 'Producto'}</dd></div>
        <div><dt>Especie</dt><dd>{speciesLabel(item.species)}</dd></div>
        <div><dt>Precio</dt><dd>{priceLabel.format(item.priceCop)}</dd></div>
        {kind === 'service' && <div><dt>Modalidad</dt><dd>{modalityLabel(item.modality)}</dd></div>}
      </dl>
    </li>)}
  </ul>;
}

export default function ProviderCatalog() {
  const location = useLocation();
  const [catalog, setCatalog] = useState({ services: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState(location.state?.notice ?? '');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    apiFetch('/api/provider/offerings')
      .then((saved) => { if (active) setCatalog(saved); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  return (
    <main className="page-shell catalog-page">
      <section className="catalog-card" aria-labelledby="catalog-title">
        <h1 id="catalog-title">Catálogo</h1>
        <p className="catalog-subtitle">Administra los servicios y productos que has publicado.</p>
        <div className="catalog-actions">
          <Link className="button-link catalog-publish-link" to="/provider/services/new">Publicar servicio</Link>
          <Link className="button-link button-link-secondary catalog-publish-link" to="/provider/products/new">Publicar producto</Link>
        </div>
        {notice && <p className="success-alert" role="status">{notice}</p>}
        {loading && <p role="status">Cargando catálogo…</p>}
        {error && <div className="form-alert" role="alert">
          No pudimos cargar tu catálogo. Revisa tu conexión e inténtalo de nuevo.
          <button className="link-button" type="button" onClick={() => setAttempt((value) => value + 1)}>Reintentar</button>
        </div>}
        {!loading && !error && <>
          <section className="catalog-section" aria-labelledby="services-title">
            <h2 id="services-title">Servicios ({catalog.services.length})</h2>
            <OfferingList items={catalog.services} kind="service" />
          </section>
          <section className="catalog-section" aria-labelledby="products-title">
            <h2 id="products-title">Productos ({catalog.products.length})</h2>
            <OfferingList items={catalog.products} kind="product" />
          </section>
        </>}
      </section>
    </main>
  );
}
