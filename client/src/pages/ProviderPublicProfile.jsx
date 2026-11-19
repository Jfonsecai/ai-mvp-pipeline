import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';
import ListenButton from '../voice/ListenButton.jsx';

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

// Provider phone numbers are saved with digits, spaces and an optional leading "+".
const whatsappHref = (phone) => {
  const digits = phone.replace(/\D/g, '');
  const internationalNumber = digits.startsWith('57') ? digits : digits.length === 10 ? `57${digits}` : digits;
  return `https://wa.me/${internationalNumber}`;
};
const gmailHref = (email) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
const mapsHref = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const profileSpeech = (profile) => [
  `Proveedor ${profile.name}.`,
  providerTypeLabel(profile.type) + '.',
  profile.address ? `Dirección: ${profile.address}.` : '',
  profile.contactPhone ? `Teléfono: ${profile.contactPhone}.` : '',
  `Tiene ${profile.services.length + profile.products.length} ofertas publicadas.`,
].filter(Boolean).join(' ');

function OfferingList({ items, kind }) {
  if (!items.length) {
    return <p className="catalog-empty">Este proveedor aún no ha publicado {kind === 'service' ? 'servicios' : 'productos'}.</p>;
  }
  return <ul className="catalog-list">
    {items.map((item) => <li className={`catalog-item provider-offering-card provider-offering-${kind}`} key={item.id}>
      <div className="catalog-item-content provider-offering-content">
        <div className="provider-offering-heading">
          <span className="provider-offering-icon" aria-hidden="true">{kind === 'service' ? '✚' : '♡'}</span>
          <span className="provider-offering-kind">{kind === 'service' ? 'Servicio veterinario' : 'Producto para mascotas'}</span>
        </div>
        <h3>{item.name}</h3>
        <dl className="catalog-details">
          <div><dt>Especie</dt><dd>{speciesLabel(item.species)}</dd></div>
          {kind === 'service' && <div><dt>Modalidad</dt><dd>{modalityLabel(item.modality)}</dd></div>}
          {kind === 'product' && <div><dt>Disponibilidad</dt><dd>{item.available === false ? 'No disponible' : 'Disponible'}</dd></div>}
        </dl>
        <div className="provider-offering-footer">
          <div><span>Precio</span><strong>{priceLabel.format(item.priceCop)}</strong></div>
          {kind === 'service' && <Link className="button-link button-link-secondary result-action" to={`/owner/services/${item.id}/book`} aria-label={`Agendar cita: ${item.name}`}>Agendar cita <span aria-hidden="true">→</span></Link>}
        </div>
      </div>
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
        <ListenButton text={profileSpeech(profile)} />

        <section className="contact-card" aria-labelledby="contact-title">
          <h2 id="contact-title">Contacto</h2>
          <dl className="catalog-details">
            {profile.address && <div><dt>Dirección</dt><dd><a href={mapsHref(profile.address)} target="_blank" rel="noopener noreferrer" aria-label={`Buscar ${profile.address} en Google Maps`}>{profile.address} <span aria-hidden="true">↗</span></a></dd></div>}
            {profile.contactPhone && <div><dt>WhatsApp</dt><dd><a href={whatsappHref(profile.contactPhone)} target="_blank" rel="noopener noreferrer" aria-label={`Contactar a ${profile.name} por WhatsApp`}>{profile.contactPhone} <span aria-hidden="true">↗</span></a></dd></div>}
            <div><dt>Gmail</dt><dd><a href={gmailHref(profile.contactEmail)} target="_blank" rel="noopener noreferrer" aria-label={`Escribir a ${profile.name} por Gmail`}>{profile.contactEmail} <span aria-hidden="true">↗</span></a></dd></div>
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
