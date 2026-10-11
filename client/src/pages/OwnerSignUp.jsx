import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

const messages = {
  REQUIRED: 'Este campo es obligatorio.',
  INVALID_FORMAT: 'Revisa el formato de este campo.',
  TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
  TOO_LONG: 'El valor supera la longitud permitida.',
  OUT_OF_RANGE: 'El valor está fuera del rango permitido.',
  NOT_ALLOWED: 'Elige una opción válida.',
};

function localErrors(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = messages.REQUIRED;
  if (!values.email.trim()) errors.email = messages.REQUIRED;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
  if (!values.password) errors.password = messages.REQUIRED;
  else if ([...values.password].length < 8) errors.password = messages.TOO_SHORT;
  const petIsEmpty = ['petName', 'species', 'breed', 'ageYears', 'weightKg', 'heightCm'].every((key) => !String(values[key]).trim());
  if (!petIsEmpty) for (const key of ['petName', 'species', 'breed', 'ageYears']) {
    if (!String(values[key]).trim()) errors[key] = key === 'species' ? 'Elige la especie.' : messages.REQUIRED;
  }
  if (values.ageYears && (!Number.isInteger(Number(values.ageYears)) || Number(values.ageYears) < 0)) errors.ageYears = 'Escribe una edad entera de 0 o más.';
  if (values.weightKg && (!Number.isFinite(Number(values.weightKg)) || Number(values.weightKg) <= 0 || Number(values.weightKg) > 999.9 || !/^\d+(\.\d)?$/.test(values.weightKg))) errors.weightKg = 'Escribe el peso en kg con máximo un decimal.';
  if (values.heightCm && (!Number.isInteger(Number(values.heightCm)) || Number(values.heightCm) < 1 || Number(values.heightCm) > 32767)) errors.heightCm = 'Escribe la altura en centímetros enteros.';
  return errors;
}

export default function OwnerSignUp({ onAuthenticated }) {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [values, setValues] = useState({ name: '', email: '', password: '', petName: '', species: '', breed: '', ageYears: '', weightKg: '', heightCm: '' });
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
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    setSubmitting(true);
    setAlert('');
    const petIsEmpty = ['petName', 'species', 'breed', 'ageYears', 'weightKg', 'heightCm'].every((key) => !String(values[key]).trim());
    const pet = petIsEmpty ? undefined : {
      name: values.petName.trim(), species: values.species, breed: values.breed.trim(), ageYears: Number(values.ageYears),
      ...(values.weightKg ? { weightKg: Number(values.weightKg) } : {}),
      ...(values.heightCm ? { heightCm: Number(values.heightCm) } : {}),
    };
    const payload = { name: values.name.trim(), email: values.email.trim(), password: values.password, ...(pet ? { pet } : {}) };
    try {
      const session = await apiFetch('/api/auth/sign-up/owner', { method: 'POST', body: payload });
      onAuthenticated({ state: 'active', ...session });
      navigate('/owner/home', { replace: true, state: { name: payload.name, pet: pet && { name: pet.name, species: pet.species } } });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        const mapped = {};
        const formFields = { 'pet.name': 'petName', 'pet.species': 'species', 'pet.breed': 'breed', 'pet.ageYears': 'ageYears', 'pet.weightKg': 'weightKg', 'pet.heightCm': 'heightCm' };
        for (const { field, reason } of error.fields ?? []) mapped[formFields[field] ?? field] = messages[reason] ?? 'Revisa este campo.';
        setErrors(mapped);
        setAlert((error.fields ?? []).some(({ field }) => field === 'pet') ? 'Debes registrar al menos una mascota para crear tu cuenta.' : 'Revisa los campos marcados para continuar.');
        requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      } else if (error instanceof ApiError && error.code === 'DUPLICATE_ACCOUNT_FOR_TYPE') {
        setErrors({ email: 'Ya existe una cuenta de dueño de mascota con este correo.' });
        requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      } else {
        setAlert('No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const field = (id, label, valueKey, options = {}) => <>
    <label className="field-label" htmlFor={id}>{label}</label>
    <input id={id} name={valueKey} value={values[valueKey]} onChange={(event) => update(valueKey, event.target.value)} aria-invalid={Boolean(errors[valueKey])} aria-describedby={errors[valueKey] ? `${id}-error` : undefined} {...options} />
    {errors[valueKey] && <span id={`${id}-error`} className="field-error">{errors[valueKey]}{valueKey === 'email' && errors.email.startsWith('Ya existe') && <> <Link to="/sign-in">Iniciar sesión</Link></>}</span>}
  </>;

  return <main className="page-shell"><section className="form-card" aria-labelledby="owner-signup-title">
    <Link className="back-link" to="/">Volver</Link>
    <h1 id="owner-signup-title">Crear cuenta de dueño de mascota</h1>
    <form ref={formRef} onSubmit={submit} noValidate>
      {alert && <div className="form-alert" role="alert">{alert}</div>}
      <div className="form-section-title">Tus datos</div>
      {field('owner-name', 'Nombre', 'name', { autoComplete: 'name', maxLength: 120, required: true })}
      {field('owner-email', 'Correo electrónico', 'email', { type: 'email', autoComplete: 'email', maxLength: 254, required: true })}
      {field('owner-password', 'Contraseña', 'password', { type: 'password', autoComplete: 'new-password', minLength: 8, maxLength: 128, required: true })}
      <small className="field-help">Mínimo 8 caracteres.</small>
      <div className="form-section-title">Tu primera mascota</div>
      <p>Necesitas registrar al menos una mascota para crear tu cuenta.</p>
      {field('pet-name', 'Nombre de la mascota', 'petName', { maxLength: 80, required: true })}
      <fieldset className="provider-type-group" aria-describedby={errors.species ? 'pet-species-error' : undefined}>
        <legend>Especie</legend>
        <label className="choice-card"><input type="radio" name="species" value="dog" checked={values.species === 'dog'} onChange={() => update('species', 'dog')} /><span>Perro</span></label>
        <label className="choice-card"><input type="radio" name="species" value="cat" checked={values.species === 'cat'} onChange={() => update('species', 'cat')} /><span>Gato</span></label>
        <small className="field-help">Algunos servicios son solo para perros o para gatos.</small>
      </fieldset>
      {errors.species && <span id="pet-species-error" className="field-error">{errors.species}</span>}
      {field('pet-breed', 'Raza', 'breed', { maxLength: 80, required: true })}
      {field('pet-age', 'Edad (años)', 'ageYears', { type: 'number', min: 0, step: 1, required: true })}
      <small className="field-help">Si tiene menos de un año, escribe 0.</small>
      {field('pet-weight', 'Peso en kg (opcional)', 'weightKg', { type: 'number', min: 0.1, max: 999.9, step: 0.1 })}
      {field('pet-height', 'Altura en cm (opcional)', 'heightCm', { type: 'number', min: 1, max: 32767, step: 1 })}
      <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Creando cuenta…' : 'Crear cuenta'}</button>
    </form>
    <p className="signin-prompt">¿Ya tienes una cuenta? <Link to="/sign-in">Iniciar sesión</Link></p>
  </section></main>;
}
