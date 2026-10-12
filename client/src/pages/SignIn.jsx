import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

const genericFailure = 'No pudimos iniciar sesión. Revisa el correo, la contraseña y el tipo de cuenta.';

export default function SignIn({ expired = false, unavailable = false, onAuthenticated }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ accountType: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(expired ? 'Tu sesión terminó. Inicia sesión de nuevo.' : unavailable ? 'No pudimos comprobar tu sesión. Revisa tu conexión e inténtalo de nuevo.' : '');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setAlert('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!values.accountType) nextErrors.accountType = 'Elige cómo quieres entrar.';
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
      const session = await apiFetch('/api/auth/sign-in', { method: 'POST', body: { ...values, email: values.email.trim() } });
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

  return <main className="page-shell"><section className="form-card" aria-labelledby="signin-title">
    <h1 id="signin-title">Iniciar sesión</h1>
    <form onSubmit={submit} noValidate>
      {alert && <div className={expired ? 'success-alert' : 'form-alert'} role={expired ? 'status' : 'alert'}>{alert}</div>}
      <fieldset className="provider-type-group" aria-describedby={errors.accountType ? 'signin-type-error' : undefined}>
        <legend>¿Cómo quieres entrar?</legend>
        <label className="choice-card"><input type="radio" name="accountType" value="owner" autoFocus checked={values.accountType === 'owner'} onChange={() => update('accountType', 'owner')} /><span>Dueño de mascota</span></label>
        <label className="choice-card"><input type="radio" name="accountType" value="provider" checked={values.accountType === 'provider'} onChange={() => update('accountType', 'provider')} /><span>Proveedor</span></label>
      </fieldset>
      {errors.accountType && <span id="signin-type-error" className="field-error">{errors.accountType}</span>}

      <label className="field-label" htmlFor="signin-email">Correo electrónico</label>
      <input id="signin-email" name="email" type="email" autoComplete="username" maxLength={254} value={values.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'signin-email-error' : undefined} />
      {errors.email && <span id="signin-email-error" className="field-error">{errors.email}</span>}

      <label className="field-label" htmlFor="signin-password">Contraseña</label>
      <input id="signin-password" name="password" type="password" autoComplete="current-password" maxLength={128} value={values.password} onChange={(event) => update('password', event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'signin-password-error' : undefined} />
      {errors.password && <span id="signin-password-error" className="field-error">{errors.password}</span>}

      <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}</button>
    </form>
    <p className="signin-prompt">¿No tienes cuenta?</p>
    <Link to="/owner/sign-up">Crear cuenta de dueño de mascota</Link><br />
    <Link to="/provider/sign-up">Crear cuenta de proveedor</Link>
  </section></main>;
}
