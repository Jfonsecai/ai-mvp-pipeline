import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

const reasonMessages = {
  REQUIRED: 'Este campo es obligatorio.',
  INVALID_FORMAT: 'Escribe un correo válido, por ejemplo nombre@correo.com.',
  TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
  TOO_LONG: 'El valor supera la longitud permitida.',
  NOT_ALLOWED: 'Elige una opción válida.',
};

function localErrors(values) {
  const errors = {};
  const passwordLength = [...values.password].length;
  if (!values.name.trim()) errors.name = reasonMessages.REQUIRED;
  if (!values.email.trim()) errors.email = reasonMessages.REQUIRED;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = reasonMessages.INVALID_FORMAT;
  if (!values.password) errors.password = reasonMessages.REQUIRED;
  else if (passwordLength < 8) errors.password = reasonMessages.TOO_SHORT;
  if (!values.providerType) errors.providerType = 'Elige el tipo de proveedor.';
  if (values.providerType === 'clinic' && !values.address.trim()) errors.address = reasonMessages.REQUIRED;
  return errors;
}

export default function ProviderSignUp() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', providerType: '', address: '' });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setAlert('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = localErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setAlert('Revisa los campos marcados para continuar.');
      return;
    }

    setSubmitting(true);
    setAlert('');
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      providerType: values.providerType,
      ...(values.providerType === 'clinic' ? { address: values.address.trim() } : {}),
    };
    try {
      await apiFetch('/api/auth/sign-up/provider', { method: 'POST', body: payload });
      navigate('/provider/profile', { replace: true, state: { name: payload.name, providerType: payload.providerType, address: payload.address } });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        const serverErrors = Object.fromEntries((error.fields ?? []).map(({ field, reason }) => [field, reasonMessages[reason] ?? 'Revisa este campo.']));
        setErrors(serverErrors);
        setAlert('Revisa los campos marcados para continuar.');
      } else if (error instanceof ApiError && error.code === 'DUPLICATE_ACCOUNT_FOR_TYPE') {
        setErrors({ email: 'Ya existe una cuenta de proveedor con este correo.' });
        setAlert('');
      } else {
        setAlert('No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="form-card" aria-labelledby="provider-signup-title">
        <Link className="back-link" to="/">Volver</Link>
        <h1 id="provider-signup-title">Crear cuenta de proveedor</h1>
        <form onSubmit={submit} noValidate>
          {alert && <div className="form-alert" role="alert">{alert}{alert.startsWith('Ya existe') && <> <Link to="/sign-in">Iniciar sesión</Link></>}</div>}

          <div className="form-section-title">Datos de tu cuenta</div>
          <label className="field-label" htmlFor="provider-name">Nombre de la clínica o del veterinario</label>
          <input id="provider-name" name="name" autoComplete="organization" maxLength={120} required value={values.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'provider-name-error' : undefined} />
          {errors.name && <span id="provider-name-error" className="field-error">{errors.name}</span>}

          <label className="field-label" htmlFor="provider-email">Correo electrónico</label>
          <input id="provider-email" name="email" type="email" autoComplete="email" maxLength={254} required value={values.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'provider-email-error' : undefined} />
          {errors.email && <span id="provider-email-error" className="field-error">{errors.email}{errors.email.startsWith('Ya existe') && <> <Link to="/sign-in">Iniciar sesión</Link></>}</span>}

          <label className="field-label" htmlFor="provider-password">Contraseña</label>
          <input id="provider-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={values.password} onChange={(event) => update('password', event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'provider-password-error provider-password-help' : 'provider-password-help'} />
          <small id="provider-password-help" className="field-help">Mínimo 8 caracteres.</small>
          {errors.password && <span id="provider-password-error" className="field-error">{errors.password}</span>}

          <fieldset className="provider-type-group" aria-describedby={errors.providerType ? 'provider-type-error' : undefined}>
            <legend>¿Qué tipo de proveedor eres?</legend>
            <label className="choice-card"><input type="radio" name="providerType" value="clinic" required checked={values.providerType === 'clinic'} onChange={() => update('providerType', 'clinic')} /><span><strong>Clínica veterinaria</strong><small>Puedes recibir varias citas a la misma hora y ofrecer servicios en tu clínica o a domicilio.</small></span></label>
            <label className="choice-card"><input type="radio" name="providerType" value="independent" required checked={values.providerType === 'independent'} onChange={() => update('providerType', 'independent')} /><span><strong>Veterinario independiente</strong><small>Recibes una cita por hora y ofreces servicios a domicilio.</small></span></label>
          </fieldset>
          {errors.providerType && <span id="provider-type-error" className="field-error">{errors.providerType}</span>}

          {values.providerType === 'clinic' && <>
            <label className="field-label" htmlFor="provider-address">Dirección de la clínica</label>
            <small className="field-help">Se mostrará en tu perfil. Podrás cambiarla, pero no borrarla.</small>
            <input id="provider-address" name="address" autoComplete="street-address" maxLength={300} required value={values.address} onChange={(event) => update('address', event.target.value)} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'provider-address-help provider-address-error' : 'provider-address-help'} />
            {errors.address && <span id="provider-address-error" className="field-error">{errors.address}</span>}
          </>}

          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Creando cuenta…' : 'Crear cuenta'}</button>
        </form>
        <p className="signin-prompt">¿Ya tienes una cuenta? <Link to="/sign-in">Iniciar sesión</Link></p>
      </section>
    </main>
  );
}
