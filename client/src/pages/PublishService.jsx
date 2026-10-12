import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

const MAX_PRICE_COP = 2_147_483_647;
const requiredMessage = 'Este campo es obligatorio.';

function validate(values, providerType) {
  const errors = {};
  if (!values.name.trim()) errors.name = requiredMessage;
  else if ([...values.name.trim()].length > 120) errors.name = 'El nombre supera los 120 caracteres permitidos.';
  if (!values.priceCop) errors.priceCop = requiredMessage;
  else if (!Number.isInteger(Number(values.priceCop)) || Number(values.priceCop) < 1 || Number(values.priceCop) > MAX_PRICE_COP) {
    errors.priceCop = 'Escribe un precio entero válido en pesos colombianos.';
  }
  if (!values.species) errors.species = 'Elige una especie.';
  if (providerType === 'clinic' && !values.modality) errors.modality = 'Elige dónde ofreces el servicio.';
  return errors;
}

function serverErrors(fields) {
  const errors = {};
  for (const { field, reason } of fields ?? []) {
    if (field === 'name') errors.name = reason === 'TOO_LONG' ? 'El nombre supera los 120 caracteres permitidos.' : requiredMessage;
    if (field === 'priceCop') errors.priceCop = reason === 'REQUIRED'
      ? requiredMessage
      : 'Escribe un precio entero válido en pesos colombianos.';
    if (field === 'species') errors.species = 'Elige una especie.';
    if (field === 'modality') errors.modality = 'Elige dónde ofreces el servicio.';
  }
  return errors;
}

export default function PublishService() {
  const navigate = useNavigate();
  const [providerType, setProviderType] = useState('');
  const [values, setValues] = useState({ name: '', priceCop: '', species: '', modality: '' });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    apiFetch('/api/provider/profile')
      .then((profile) => { if (active) setProviderType(profile.providerType); })
      .catch(() => { if (active) setLoadFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setAlert('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(values, providerType);
    setErrors(nextErrors);
    setAlert('');
    if (Object.keys(nextErrors).length) {
      setAlert('Revisa los campos marcados para continuar.');
      return;
    }

    setSaving(true);
    const payload = {
      name: values.name.trim(),
      priceCop: Number(values.priceCop),
      species: values.species,
      ...(providerType === 'clinic' ? { modality: values.modality } : {}),
    };
    try {
      await apiFetch('/api/provider/services', { method: 'POST', body: payload });
      navigate('/provider/catalog', { replace: true, state: { notice: 'Servicio publicado.' } });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        const fieldErrors = serverErrors(error.fields);
        setErrors(fieldErrors);
        setAlert(Object.keys(fieldErrors).length ? 'Revisa los campos marcados para continuar.' : 'Revisa los datos ingresados.');
      } else {
        setAlert('No pudimos publicar el servicio. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="form-card" aria-labelledby="publish-service-title">
        <Link className="back-link" to="/provider/catalog">Volver al catálogo</Link>
        <h1 id="publish-service-title">Publicar servicio</h1>
        {loading && <p role="status">Cargando datos del proveedor…</p>}
        {loadFailed && <div className="form-alert" role="alert">
          No pudimos cargar tus datos. Revisa tu conexión e inténtalo de nuevo.
          <button className="link-button" type="button" onClick={() => setAttempt((value) => value + 1)}>Reintentar</button>
        </div>}
        {!loading && !loadFailed && <form onSubmit={submit} noValidate>
          {alert && <div className="form-alert" role="alert">{alert}</div>}
          <div className="form-section-title">Datos del servicio</div>

          <label className="field-label" htmlFor="service-name">Nombre del servicio</label>
          <input id="service-name" maxLength={120} required value={values.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'service-name-error' : undefined} placeholder="Ej.: Consulta general" />
          {errors.name && <span id="service-name-error" className="field-error">{errors.name}</span>}

          <label className="field-label" htmlFor="service-price">Precio</label>
          <input id="service-price" type="number" min="1" max={MAX_PRICE_COP} step="1" required value={values.priceCop} onChange={(event) => update('priceCop', event.target.value)} aria-invalid={Boolean(errors.priceCop)} aria-describedby={errors.priceCop ? 'service-price-error service-price-help' : 'service-price-help'} />
          <small id="service-price-help" className="field-help">Precio en pesos colombianos (COP).</small>
          {errors.priceCop && <span id="service-price-error" className="field-error">{errors.priceCop}</span>}

          <fieldset className="provider-type-group" aria-describedby={errors.species ? 'service-species-error' : undefined}>
            <legend>¿Para qué especie es?</legend>
            <label className="choice-card"><input type="radio" name="species" value="dog" required checked={values.species === 'dog'} onChange={() => update('species', 'dog')} /><span>Perro</span></label>
            <label className="choice-card"><input type="radio" name="species" value="cat" required checked={values.species === 'cat'} onChange={() => update('species', 'cat')} /><span>Gato</span></label>
          </fieldset>
          {errors.species && <span id="service-species-error" className="field-error">{errors.species}</span>}

          {providerType === 'clinic'
            ? <fieldset className="provider-type-group" aria-describedby={errors.modality ? 'service-modality-error' : undefined}>
              <legend>¿Dónde ofreces este servicio?</legend>
              <label className="choice-card"><input type="radio" name="modality" value="clinic" required checked={values.modality === 'clinic'} onChange={() => update('modality', 'clinic')} /><span>En mi clínica</span></label>
              <label className="choice-card"><input type="radio" name="modality" value="home" required checked={values.modality === 'home'} onChange={() => update('modality', 'home')} /><span>A domicilio</span></label>
              <label className="choice-card"><input type="radio" name="modality" value="both" required checked={values.modality === 'both'} onChange={() => update('modality', 'both')} /><span>En clínica y a domicilio</span></label>
            </fieldset>
            : <p className="info-alert" role="status">Ofreces este servicio a domicilio.</p>}
          {errors.modality && <span id="service-modality-error" className="field-error">{errors.modality}</span>}

          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Publicando servicio…' : 'Publicar servicio'}</button>
        </form>}
      </section>
    </main>
  );
}
