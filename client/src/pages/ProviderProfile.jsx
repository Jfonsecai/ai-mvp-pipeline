import { useEffect, useState } from 'react';
import { ApiError, apiFetch } from '../api/client.js';

// SCR-UX-009 "Mi perfil" (FLOW-UX-004; US-008). Messages follow MSG-REQ, MSG-EMAIL, MSG-PHONE,
// MSG-FORM, MSG-NET and MSG-SAVED of the UX catalog.
const MSG_REQ = 'Este campo es obligatorio.';
const MSG_EMAIL = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
const MSG_PHONE = 'Usa solo números, espacios y el signo +.';
const MSG_FORM = 'Revisa los campos marcados para continuar.';
const MSG_NET = 'No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.';
const MSG_SAVED = 'Cambios guardados.';
const MSG_TOO_LONG = 'El valor supera la longitud permitida.';

const PHONE_PATTERN = /^[0-9 +]*[0-9][0-9 +]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const typeLabel = (type) => (type === 'clinic' ? 'Clínica veterinaria' : 'Veterinario independiente');

const toValues = (profile) => ({
  publicName: profile.publicName,
  contactPhone: profile.contactPhone ?? '',
  contactEmail: profile.contactEmail,
  address: profile.address ?? '',
});

function localErrors(values, providerType) {
  const errors = {};
  if (!values.publicName.trim()) errors.publicName = MSG_REQ;
  if (!values.contactPhone.trim()) errors.contactPhone = MSG_REQ;
  else if (!PHONE_PATTERN.test(values.contactPhone.trim())) errors.contactPhone = MSG_PHONE;
  if (!values.contactEmail.trim()) errors.contactEmail = MSG_REQ;
  else if (!EMAIL_PATTERN.test(values.contactEmail.trim())) errors.contactEmail = MSG_EMAIL;
  if (providerType === 'clinic' && !values.address.trim()) errors.address = MSG_REQ;
  return errors;
}

function serverErrors(fields) {
  const errors = {};
  for (const { field, reason } of fields ?? []) {
    if (!['publicName', 'contactPhone', 'contactEmail', 'address'].includes(field)) continue;
    errors[field] = reason === 'REQUIRED'
      ? MSG_REQ
      : reason === 'TOO_LONG'
        ? MSG_TOO_LONG
        : field === 'contactPhone'
          ? MSG_PHONE
          : field === 'contactEmail'
            ? MSG_EMAIL
            : 'Revisa este campo.';
  }
  return errors;
}

function TextField({ id, label, help, error, ...input }) {
  const describedBy = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return <>
    <label className="field-label" htmlFor={id}>{label}</label>
    {help && <small id={`${id}-help`} className="field-help">{help}</small>}
    <input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...input} />
    {error && <span id={`${id}-error`} className="field-error">{error}</span>}
  </>;
}

export default function ProviderProfile() {
  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState('');
  const [notice, setNotice] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadFailed(false);
    apiFetch('/api/provider/profile')
      .then((saved) => {
        if (!active) return;
        setProfile(saved);
        setValues(toValues(saved));
      })
      .catch(() => { if (active) setLoadFailed(true); });
    return () => { active = false; };
  }, [attempt]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setAlert('');
    setNotice('');
  }

  async function save(event) {
    event.preventDefault();
    const nextErrors = localErrors(values, profile.providerType);
    setErrors(nextErrors);
    setAlert('');
    setNotice('');
    if (Object.keys(nextErrors).length) {
      setAlert(MSG_FORM);
      return;
    }

    setSaving(true);
    const address = values.address.trim();
    const payload = {
      publicName: values.publicName.trim(),
      contactPhone: values.contactPhone.trim(),
      contactEmail: values.contactEmail.trim(),
      address: address || null,
    };
    try {
      const saved = await apiFetch('/api/provider/profile', { method: 'PUT', body: payload });
      setProfile(saved);
      setValues(toValues(saved));
      setNotice(MSG_SAVED);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        setErrors(serverErrors(error.fields));
        setAlert(MSG_FORM);
      } else {
        setAlert(MSG_NET);
      }
    } finally {
      setSaving(false);
    }
  }

  const isClinic = profile?.providerType === 'clinic';

  return (
    <main className="page-shell profile-page">
      <section className="form-card" aria-labelledby="provider-profile-title">
        <h1 id="provider-profile-title">Mi perfil</h1>
        <p>Esta información es pública para los dueños de mascotas.</p>
        {!profile && !loadFailed && <p role="status">Cargando…</p>}
        {loadFailed && <div className="form-alert" role="alert">
          {MSG_NET} <button className="link-button" type="button" onClick={() => setAttempt((count) => count + 1)}>Reintentar</button>
        </div>}
        {profile && !profile.profileCompleted && <div className="info-alert" role="status">
          Completa tu perfil, define tu horario y publica tus servicios para que los dueños de mascotas puedan encontrarte y agendar contigo.
        </div>}
        {alert && <div className="form-alert" role="alert">{alert}</div>}
        {notice && <div className="success-alert" role="status">{notice}</div>}
        {profile && <form onSubmit={save} noValidate>
          <div className="form-section-title">Datos públicos</div>
          <dl className="profile-summary">
            <div><dt>Tipo de proveedor</dt><dd>{typeLabel(profile.providerType)}</dd></div>
          </dl>

          <TextField id="profile-name" name="publicName" label="Nombre" autoComplete="organization" maxLength={120} required
            value={values.publicName} error={errors.publicName} onChange={(event) => update('publicName', event.target.value)} />
          <TextField id="profile-phone" name="contactPhone" label="Teléfono de contacto" type="tel" autoComplete="tel" maxLength={30} required
            value={values.contactPhone} error={errors.contactPhone} onChange={(event) => update('contactPhone', event.target.value)} />
          <TextField id="profile-email" name="contactEmail" label="Correo de contacto" type="email" autoComplete="email" maxLength={254} required
            value={values.contactEmail} error={errors.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} />
          {isClinic
            ? <TextField id="profile-address" name="address" label="Dirección de la clínica" autoComplete="street-address" maxLength={300} required
              help="Se mostrará en tu perfil y en las citas en la clínica."
              value={values.address} error={errors.address} onChange={(event) => update('address', event.target.value)} />
            : <TextField id="profile-address" name="address" label="Dirección (opcional)" autoComplete="street-address" maxLength={300}
              help="Si quieres, escribe una dirección de referencia. Se mostrará en tu perfil."
              value={values.address} error={errors.address} onChange={(event) => update('address', event.target.value)} />}

          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>}
      </section>
    </main>
  );
}
