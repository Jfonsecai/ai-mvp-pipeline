import { Link, useLocation } from 'react-router-dom';

export default function OwnerWelcome() {
  const { state } = useLocation();
  return <main className="page-shell"><section className="form-card" aria-labelledby="owner-welcome-title">
    <div className="success-alert" role="status">Tu cuenta ya está creada y tu primera mascota está registrada.</div>
    <h1 id="owner-welcome-title">Bienvenido{state?.name ? `, ${state.name}` : ''}</h1>
    {state?.pet?.name && <p>{state.pet.name} ya forma parte de tu cuenta.</p>}
    <p>La búsqueda de servicios estará disponible en el siguiente paso.</p>
    <Link className="button-link" to="/">Continuar</Link>
  </section></main>;
}
