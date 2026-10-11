import { Link, useLocation } from 'react-router-dom';

export default function ProviderWelcome() {
  const { state } = useLocation();
  return (
    <main className="page-shell">
      <section className="form-card" aria-labelledby="provider-profile-title">
        <div className="success-alert" role="status">Tu cuenta ya está creada. Completa tu perfil para que los tutores puedan encontrarte.</div>
        <h1 id="provider-profile-title">Tu cuenta de proveedor está lista</h1>
        {state?.name && state?.providerType && <dl className="profile-summary">
          <div><dt>Nombre</dt><dd>{state.name}</dd></div>
          <div><dt>Tipo de proveedor</dt><dd>{state.providerType === 'clinic' ? 'Clínica veterinaria' : 'Veterinario independiente'}</dd></div>
          {state.providerType === 'clinic' && state.address && <div><dt>Dirección de la clínica</dt><dd>{state.address}</dd></div>}
        </dl>}
        <p>La edición de tu perfil estará disponible en el siguiente paso.</p>
        <Link className="button-link" to="/">Continuar</Link>
      </section>
    </main>
  );
}
