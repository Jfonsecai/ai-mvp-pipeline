import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

// SCR-UX-005 "Perfil del proveedor", owner view (FLOW-UX-009; US-018). Booking and ordering actions
// belong to US-019 and US-027 and are not rendered here.
const MSG_NET = 'No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.';
const speciesLabel = (species) => (species === 'dog' ? 'Perro' : 'Gato');
const providerTypeLabel = (type) => (type === 'clinic' ? 'Clínica veterinaria' : 'Veterinario independiente');
const modalityLabel = (modality) => ({
  clinic: 'En la clínica',
  home: 'A domicilio',
  both: 'En la clínica y a domicilio',
})[modality];
const priceLabel = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// The phone only holds digits, spaces and "+"; the email is encoded so it cannot add mailto fields.
const telHref = (phone) => `tel:${phone.replace(/\s+/g, '')}`;
const mailHref = (email) => `mailto:${email.replace(/[?&#%]/g, encodeURIComponent)}`;

function OfferingList({ items, kind }) {
  if (!items.length) {
    return <p className="catalog-empty">Este proveedor aún no ha publicado {kind === 'service' ? 'servicios' : 'productos'}.</p>;
  }
  return <ul className="catalog-list">
    {items.map((item) => <li className="catalog-item" key={item.id}>
      <h3>{item.name}</h3>
      <dl className="catalog-details">
        <div><dt>Tipo</dt><dd>{kind === 'service' ? 'Servicio' : 'Producto'}</dd></div>
        <div><dt>Especie</dt><dd>{speciesLabel(item.species)}</dd></div>
        <div><dt>Precio</dt><dd>{priceLabel.format(item.priceCop)}</dd></div>
        {kind === 'service' && <div><dt>Modalidad</dt><dd>{modalityLabel(item.modality)}</dd></div>}
        {kind === 'product' && item.available === false && <div><dt>Disponibilidad</dt><dd>No disponible</dd></div>}
      </dl>
    </li>)}
  </ul>;
}

export default function ProviderPublicProfile() {
  const { providerId } = useParams();
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState('loading');
    setProfile(null);
    apiFetch(`/api/providers/${encodeURIComponent(providerId)}`)
      .then((value) => {
        if (!active) return;
        setProfile(value);
        setState('ready');
      })
      .catch((error) => {
        if (!active) return;
        setState(error instanceof ApiError && error.code === 'NOT_FOUND' ? 'not-found' : 'error');
      });
    return () => { active = false; };
  }, [providerId, attempt]);

  if (state === 'not-found') return <Navigate to="/not-found" replace />;

  return <main className="page-shell catalog-page">
    <section className="catalog-card" aria-labelledby="public-profile-title">
      <Link className="back-link" to="/owner/home">Volver a la búsqueda</Link>
      {state === 'loading' && <p role="status">Cargando…</p>}
      {state === 'error' && <div className="form-alert" role="alert">
        {MSG_NET} <button className="link-button" type="button" onClick={() => setAttempt((count) => count + 1)}>Reintentar</button>
      </div>}
      {state === 'ready' && <>
        <h1 id="public-profile-title">{profile.name}</h1>
        <p className="provider-type-badge">{providerTypeLabel(profile.type)}</p>

        <section className="contact-card" aria-labelledby="contact-title">
          <h2 id="contact-title">Contacto</h2>
          <dl className="catalog-details">
            {profile.address && <div><dt>Dirección</dt><dd>{profile.address}</dd></div>}
            {profile.contactPhone && <div><dt>Teléfono</dt><dd><a href={telHref(profile.contactPhone)}>{profile.contactPhone}</a></dd></div>}
            <div><dt>Correo</dt><dd><a href={mailHref(profile.contactEmail)}>{profile.contactEmail}</a></dd></div>
          </dl>
        </section>

        <section className="catalog-section" aria-labelledby="profile-services-title">
          <h2 id="profile-services-title">Servicios ({profile.services.length})</h2>
          <OfferingList items={profile.services} kind="service" />
        </section>
        <section className="catalog-section" aria-labelledby="profile-products-title">
          <h2 id="profile-products-title">Productos ({profile.products.length})</h2>
          <OfferingList items={profile.products} kind="product" />
        </section>
      </>}
    </section>
  </main>;
}
