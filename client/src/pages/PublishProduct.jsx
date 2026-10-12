import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

// SCR-UX-013 "Publicar producto" (FLOW-UX-007; US-013). There is no stock field: every new
// product is published as available (AC-111, BR-031, TD-13).
const MAX_PRICE_COP = 2_147_483_647;
const MSG_REQ = 'Este campo es obligatorio.';
const MSG_PRICE = 'Escribe un precio en pesos, solo números, mayor que 0.';
const MSG_SPECIES = 'Elige una especie.';
const MSG_NAME_LONG = 'El nombre supera los 120 caracteres permitidos.';
const MSG_FORM = 'Revisa los campos marcados para continuar.';

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = MSG_REQ;
  else if ([...values.name.trim()].length > 120) errors.name = MSG_NAME_LONG;
  if (values.priceCop === '') errors.priceCop = MSG_REQ;
  else if (!/^\d+$/.test(values.priceCop) || Number(values.priceCop) < 1 || Number(values.priceCop) > MAX_PRICE_COP) {
    errors.priceCop = MSG_PRICE;
  }
  if (!values.species) errors.species = MSG_SPECIES;
  return errors;
}

function serverErrors(fields) {
  const errors = {};
  for (const { field, reason } of fields ?? []) {
    if (field === 'name') errors.name = reason === 'TOO_LONG' ? MSG_NAME_LONG : MSG_REQ;
    if (field === 'priceCop') errors.priceCop = reason === 'REQUIRED' ? MSG_REQ : MSG_PRICE;
    if (field === 'species') errors.species = MSG_SPECIES;
  }
  return errors;
}

export default function PublishProduct() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', priceCop: '', species: '' });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setAlert('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setAlert('');
    if (Object.keys(nextErrors).length) {
      setAlert(MSG_FORM);
      return;
    }

    setSaving(true);
    const payload = { name: values.name.trim(), priceCop: Number(values.priceCop), species: values.species };
    try {
      await apiFetch('/api/provider/products', { method: 'POST', body: payload });
      navigate('/provider/catalog', { replace: true, state: { notice: 'Producto publicado.' } });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        const fieldErrors = serverErrors(error.fields);
        setErrors(fieldErrors);
        setAlert(MSG_FORM);
      } else {
        setAlert('No pudimos publicar el producto. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="form-card" aria-labelledby="publish-product-title">
        <Link className="back-link" to="/provider/catalog">Volver al catálogo</Link>
        <h1 id="publish-product-title">Publicar producto</h1>
        <form onSubmit={submit} noValidate>
          {alert && <div className="form-alert" role="alert">{alert}</div>}
          <div className="form-section-title">Datos del producto</div>

          <label className="field-label" htmlFor="product-name">Nombre del producto</label>
          <input id="product-name" maxLength={120} required value={values.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'product-name-error' : undefined} placeholder="Ej.: Concentrado para gato 2 kg" />
          {errors.name && <span id="product-name-error" className="field-error">{errors.name}</span>}

          <label className="field-label" htmlFor="product-price">Precio</label>
          <input id="product-price" type="number" inputMode="numeric" min="1" max={MAX_PRICE_COP} step="1" required value={values.priceCop} onChange={(event) => update('priceCop', event.target.value)} aria-invalid={Boolean(errors.priceCop)} aria-describedby={errors.priceCop ? 'product-price-error product-price-help' : 'product-price-help'} />
          <small id="product-price-help" className="field-help">Precio en pesos colombianos (COP).</small>
          {errors.priceCop && <span id="product-price-error" className="field-error">{errors.priceCop}</span>}

          <fieldset className="provider-type-group" aria-describedby={errors.species ? 'product-species-error' : undefined}>
            <legend>¿Para qué especie es?</legend>
            <label className="choice-card"><input type="radio" name="species" value="dog" required checked={values.species === 'dog'} onChange={() => update('species', 'dog')} /><span>Perro</span></label>
            <label className="choice-card"><input type="radio" name="species" value="cat" required checked={values.species === 'cat'} onChange={() => update('species', 'cat')} /><span>Gato</span></label>
          </fieldset>
          {errors.species && <span id="product-species-error" className="field-error">{errors.species}</span>}

          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Publicando producto…' : 'Publicar producto'}</button>
        </form>
      </section>
    </main>
  );
}
