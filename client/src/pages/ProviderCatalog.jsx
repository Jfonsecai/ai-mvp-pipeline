import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

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

// COMP-UX-022 confirmation dialog (UX_SPEC_V3 §5): says what the removal does; the secondary action is always "No, volver".
// A native modal <dialog> gives focus containment and Escape-to-close; focus returns to the button that opened it.
function ConfirmRemoveDialog({ service, busy, error, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  return <dialog className="confirm-dialog" ref={dialogRef} aria-labelledby="confirm-title" aria-describedby="confirm-text" onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}>
    <h2 id="confirm-title">¿Eliminar este servicio?</h2>
    <p id="confirm-text"><strong>{service.name}</strong>. Dejará de aparecer en las búsquedas. Sus citas próximas se cancelarán.</p>
    {error && <div className="form-alert" role="alert">{error}</div>}
    <div className="confirm-actions">
      <button className="button-secondary" type="button" onClick={onCancel} disabled={busy}>No, volver</button>
      <button className="danger-button" type="button" onClick={onConfirm} disabled={busy}>Sí, eliminar</button>
    </div>
  </dialog>;
}

function OfferingList({ items, kind, onRemove }) {
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
      {kind === 'service' && <div className="catalog-item-actions">
        <Link className="button-link button-link-secondary result-action" to={`/provider/services/${item.id}/edit`} aria-label={`Editar: ${item.name}`}>Editar</Link>
        <button className="link-button danger-link result-action" type="button" onClick={(event) => onRemove(item, event.currentTarget)} aria-label={`Eliminar: ${item.name}`}>Eliminar</button>
      </div>}
      {kind === 'product' && <div className="catalog-item-actions">
        <Link className="button-link button-link-secondary result-action" to={`/provider/products/${item.id}/edit`} aria-label={`Editar: ${item.name}`}>Editar</Link>
      </div>}
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
  const [removing, setRemoving] = useState(null); // { service } while the confirmation is open (the opener button is kept in openerRef)
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState('');

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

  // After the dialog is gone, focus goes back to the button that opened it, or to the services heading when
  // that card was removed (keyboard and screen-reader users keep their place).
  const openerRef = useRef(null);
  useEffect(() => {
    if (removing || !openerRef.current) return;
    const opener = openerRef.current;
    openerRef.current = null;
    (opener.isConnected ? opener : document.getElementById('services-title'))?.focus();
  }, [removing]);

  const closeDialog = () => {
    setRemoving(null);
    setRemoveError('');
  };

  // US-012: DELETE removes the service and cancels its upcoming appointments (BR-034). A 404 means it is
  // already gone (removed elsewhere), so the list is reloaded instead of pretending it was removed here.
  async function confirmRemove() {
    const { service } = removing;
    setRemoveBusy(true);
    setRemoveError('');
    try {
      await apiFetch(`/api/provider/offerings/${service.id}`, { method: 'DELETE' });
      setCatalog((current) => ({ ...current, services: current.services.filter((item) => item.id !== service.id) }));
      setNotice('Servicio eliminado.');
      setRemoving(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 404) {
        setRemoving(null);
        setNotice('');
        setRemoveError('Ese servicio ya no existe. Actualizamos tu catálogo.');
        setAttempt((value) => value + 1);
      } else {
        setRemoveError('No pudimos eliminar el servicio. Inténtalo de nuevo.');
      }
    } finally {
      setRemoveBusy(false);
    }
  }

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
        {removeError && !removing && <div className="form-alert" role="alert">{removeError}</div>}
        {loading && <p role="status">Cargando catálogo…</p>}
        {error && <div className="form-alert" role="alert">
          No pudimos cargar tu catálogo. Revisa tu conexión e inténtalo de nuevo.
          <button className="link-button" type="button" onClick={() => setAttempt((value) => value + 1)}>Reintentar</button>
        </div>}
        {!loading && !error && <>
          <section className="catalog-section" aria-labelledby="services-title">
            <h2 id="services-title" tabIndex={-1}>Servicios ({catalog.services.length})</h2>
            <OfferingList items={catalog.services} kind="service" onRemove={(service, opener) => { setNotice(''); setRemoveError(''); openerRef.current = opener; setRemoving({ service }); }} />
          </section>
          <section className="catalog-section" aria-labelledby="products-title">
            <h2 id="products-title">Productos ({catalog.products.length})</h2>
            <OfferingList items={catalog.products} kind="product" />
          </section>
        </>}
      </section>
      {removing && <ConfirmRemoveDialog service={removing.service} busy={removeBusy} error={removeError} onConfirm={() => void confirmRemove()} onCancel={closeDialog} />}
    </main>
  );
}
