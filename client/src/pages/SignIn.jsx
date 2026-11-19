import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

const genericFailure = 'No pudimos iniciar sesión. Revisa el correo y la contraseña.';
const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export default function SignIn({ expired = false, unavailable = false, onAuthenticated }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [demoAccountType, setDemoAccountType] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(expired ? 'Tu sesión terminó. Inicia sesión de nuevo.' : unavailable ? 'No pudimos comprobar tu sesión. Revisa tu conexión e inténtalo de nuevo.' : '');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === 'email' || field === 'password') setDemoAccountType(null);
    setErrors((current) => ({ ...current, [field]: undefined }));
    setAlert('');
  }

  function useDemo(accountType) {
    setValues({
      email: accountType === 'owner' ? 'demo.dueno@vetcare.local' : 'demo.clinica@vetcare.local',
      password: 'VetCareDemo2026!',
    });
    setDemoAccountType(accountType);
    setErrors({});
    setAlert('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!values.email.trim()) nextErrors.email = 'Este campo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = 'Escribe un correo válido.';
    if (!values.password) nextErrors.password = 'Este campo es obligatorio.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setAlert('Revisa los campos marcados para continuar.');
      return;
    }

    setSubmitting(true);
    setAlert('');
    try {
      const accountTypes = demoAccountType
        ? [demoAccountType, demoAccountType === 'owner' ? 'provider' : 'owner']
        : ['owner', 'provider'];
      let session;
      let credentialsError;
      for (const accountType of accountTypes) {
        try {
          session = await apiFetch('/api/auth/sign-in', {
            method: 'POST',
            body: { ...values, email: values.email.trim(), accountType },
          });
          break;
        } catch (error) {
          if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') {
            credentialsError = error;
            continue;
          }
          throw error;
        }
      }
      if (!session) throw credentialsError ?? new ApiError('INVALID_CREDENTIALS', 401);
      onAuthenticated({ state: 'active', ...session });
      navigate(session.accountType === 'owner' ? '/owner/home' : '/provider/appointments', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        setErrors(Object.fromEntries((error.fields ?? []).map(({ field, reason }) => [field, reason === 'REQUIRED' ? 'Este campo es obligatorio.' : 'Revisa este campo.'])));
        setAlert('Revisa los campos marcados para continuar.');
      } else {
        setValues((current) => ({ ...current, password: '' }));
        setErrors({});
        setAlert(error instanceof ApiError && error.status === 0
          ? 'No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.'
          : genericFailure);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="auth-page">
    <section className="auth-story" aria-label="Bienvenido a VetCare">
      <Link className="auth-brand" to="/" aria-label="VetCare, inicio">
        <span className="auth-brand-icon" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="10" cy="12" r="4"/><circle cx="18" cy="7" r="4"/><circle cx="27" cy="8" r="4"/><circle cx="34" cy="14" r="4"/><path d="M8 26c0-6 5-10 12-10s12 4 12 10c0 5-4 8-9 6l-3-1-3 1c-5 2-9-1-9-6Z"/><path d="M20 27s-4-2.3-4-4.7a2.3 2.3 0 0 1 4-1.5 2.3 2.3 0 0 1 4 1.5c0 2.4-4 4.7-4 4.7Z" fill="#087f8c"/></svg></span>
        <span>Vet<span>Care</span></span>
      </Link>
      <p className="auth-eyebrow">Bienvenido de nuevo</p>
      <h1>Cuidado veterinario, más cerca de ti.</h1>
      <p className="auth-description">Encuentra servicios para tu mascota o administra tu práctica desde un solo lugar.</p>
      <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080" alt="Perro y gato descansando juntos" />
    </section>
    <section className="form-card auth-card" aria-labelledby="signin-title">
    <p className="auth-card-eyebrow">VETCARE</p>
    <h2 id="signin-title">Iniciar sesión</h2>
    <form onSubmit={submit} noValidate>
      {alert && <div className={expired ? 'success-alert' : 'form-alert'} role={expired ? 'status' : 'alert'}>{alert}</div>}
      <label className="field-label" htmlFor="signin-email">Correo electrónico</label>
      <input id="signin-email" name="email" type="email" autoComplete="username" autoFocus maxLength={254} value={values.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'signin-email-error' : undefined} />
      {errors.email && <span id="signin-email-error" className="field-error">{errors.email}</span>}

      <label className="field-label" htmlFor="signin-password">Contraseña</label>
      <input id="signin-password" name="password" type="password" autoComplete="current-password" maxLength={128} value={values.password} onChange={(event) => update('password', event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'signin-password-error' : undefined} />
      {errors.password && <span id="signin-password-error" className="field-error">{errors.password}</span>}

      <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}</button>
    </form>
    <p className="signin-prompt">¿Primera vez en VetCare? Elige el tipo de cuenta que quieres crear:</p>
    <nav className="signup-options" aria-label="Crear una cuenta">
      <Link className="signup-option" to="/owner/sign-up">
        <span className="signup-option-icon" aria-hidden="true">🐾</span>
        <span className="signup-option-copy"><strong>Soy dueño de mascota</strong><small>Encuentra servicios y organiza el cuidado de tu mascota.</small></span>
        <span className="signup-option-arrow" aria-hidden="true">→</span>
      </Link>
      <Link className="signup-option" to="/provider/sign-up">
        <span className="signup-option-icon signup-provider-icon" aria-hidden="true">✚</span>
        <span className="signup-option-copy"><strong>Soy proveedor veterinario</strong><small>Publica tus servicios y gestiona las citas de tus clientes.</small></span>
        <span className="signup-option-arrow" aria-hidden="true">→</span>
      </Link>
    </nav>
    {demoMode && <aside className="demo-access" aria-label="Acceso de demostración">
      <p>¿Solo quieres explorar la app?</p>
      <small>Usa una cuenta de prueba; no necesitas registrarte.</small>
      <div className="demo-access-actions">
        <button type="button" onClick={() => useDemo('owner')}>Entrar como dueño</button>
        <button type="button" onClick={() => useDemo('provider')}>Entrar como proveedor</button>
      </div>
      <small>Contraseña: VetCareDemo2026!</small>
    </aside>}
    </section>
  </main>;
}
