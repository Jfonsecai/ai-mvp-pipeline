import { useEffect, useState } from 'react';
import { ApiError, apiFetch } from '../api/client.js';

const emptyPet = { name: '', species: '', breed: '', ageYears: '', weightKg: '', heightCm: '' };
const speciesLabel = (species) => (species === 'dog' ? 'Perro' : 'Gato');

function petPayload(values) {
  return {
    name: values.name.trim(),
    species: values.species,
    breed: values.breed.trim(),
    ageYears: Number(values.ageYears),
    ...(values.weightKg === '' ? {} : { weightKg: Number(values.weightKg) }),
    ...(values.heightCm === '' ? {} : { heightCm: Number(values.heightCm) }),
  };
}

function PetForm({ initial, submitLabel, onSubmit, onCancel, error, fieldErrors = {} }) {
  const [values, setValues] = useState(initial);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    onSubmit(petPayload(values));
  };
  return <form className="pet-form" onSubmit={submit} noValidate>
    <h2>{submitLabel === 'Agregar mascota' ? 'Nueva mascota' : 'Editar mascota'}</h2>
    {error && <div className="form-alert" role="alert">{error}</div>}
    <label className="field-label" htmlFor="pet-name">Nombre</label>
    <input id="pet-name" value={values.name} maxLength={80} required aria-invalid={Boolean(fieldErrors.name)} onChange={(event) => update('name', event.target.value)} />
    {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
    <fieldset className="provider-type-group">
      <legend>Especie</legend>
      {['dog', 'cat'].map((species) => <label className="choice-card" key={species}>
        <input type="radio" name="pet-species" value={species} checked={values.species === species} required onChange={() => update('species', species)} />
        <span>{speciesLabel(species)}</span>
      </label>)}
    </fieldset>
      {fieldErrors.species && <span className="field-error">{fieldErrors.species}</span>}
    <label className="field-label" htmlFor="pet-breed">Raza</label>
    <input id="pet-breed" value={values.breed} maxLength={80} required aria-invalid={Boolean(fieldErrors.breed)} onChange={(event) => update('breed', event.target.value)} />
    {fieldErrors.breed && <span className="field-error">{fieldErrors.breed}</span>}
    <label className="field-label" htmlFor="pet-age">Edad en años</label>
    <input id="pet-age" type="number" min="0" step="1" value={values.ageYears} required aria-invalid={Boolean(fieldErrors.ageYears)} onChange={(event) => update('ageYears', event.target.value)} />
    {fieldErrors.ageYears && <span className="field-error">{fieldErrors.ageYears}</span>}
    <label className="field-label" htmlFor="pet-weight">Peso en kg (opcional)</label>
    <input id="pet-weight" type="number" min="0.1" max="999.9" step="0.1" value={values.weightKg} aria-invalid={Boolean(fieldErrors.weightKg)} onChange={(event) => update('weightKg', event.target.value)} />
    {fieldErrors.weightKg && <span className="field-error">{fieldErrors.weightKg}</span>}
    <label className="field-label" htmlFor="pet-height">Altura en cm (opcional)</label>
    <input id="pet-height" type="number" min="1" max="32767" step="1" value={values.heightCm} aria-invalid={Boolean(fieldErrors.heightCm)} onChange={(event) => update('heightCm', event.target.value)} />
    {fieldErrors.heightCm && <span className="field-error">{fieldErrors.heightCm}</span>}
    <div className="pet-form-actions">
      <button className="primary-button" type="submit">{submitLabel}</button>
      {onCancel && <button className="button-secondary" type="button" onClick={onCancel}>Cancelar</button>}
    </div>
  </form>;
}

export default function OwnerPets() {
  const [pets, setPets] = useState([]);
  const [state, setState] = useState('loading');
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  async function loadPets() {
    setState('loading');
    try {
      const response = await apiFetch('/api/owner/pets');
      setPets(response.pets);
      setState('ready');
    } catch {
      setError('No pudimos cargar tus mascotas. Intenta de nuevo.');
      setState('error');
    }
  }

  useEffect(() => { void loadPets(); }, []);

  async function savePet(payload, petId) {
    setError('');
    setFieldErrors({});
    try {
      const saved = await apiFetch(petId ? `/api/owner/pets/${petId}` : '/api/owner/pets', { method: petId ? 'PUT' : 'POST', body: payload });
      setPets((current) => petId ? current.map((pet) => pet.id === petId ? saved : pet) : [...current, saved]);
      setAdding(false);
      setEditing(null);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setFieldErrors(Object.fromEntries((requestError.fields ?? []).map(({ field, reason }) => [field, reason === 'REQUIRED' ? 'Este campo es obligatorio.' : 'Revisa este campo.'])));
      }
      setError('Revisa los campos obligatorios e inténtalo de nuevo.');
    }
  }

  async function removePet(pet) {
    if (!window.confirm(`¿Quieres retirar a ${pet.name}? Sus citas próximas serán canceladas.`)) return;
    try {
      await apiFetch(`/api/owner/pets/${pet.id}`, { method: 'DELETE' });
      setPets((current) => current.filter((item) => item.id !== pet.id));
    } catch {
      setError('No pudimos retirar la mascota. Intenta de nuevo.');
    }
  }

  return <main className="page-shell pets-page">
    <section className="pets-content" aria-labelledby="pets-title">
      <div className="pets-heading"><div><h1 id="pets-title">Mis mascotas</h1><p>Administra las mascotas que puedes elegir al agendar.</p></div><button className="primary-button pets-add-button" type="button" onClick={() => { setAdding(true); setEditing(null); setError(''); }}>Agregar mascota</button></div>
      {state === 'loading' && <p role="status">Cargando tus mascotas…</p>}
      {state === 'error' && <div className="form-alert" role="alert">{error} <button className="link-button" type="button" onClick={() => void loadPets()}>Reintentar</button></div>}
      {state === 'ready' && !pets.length && <section className="pets-empty"><h2>No tienes mascotas registradas</h2><p>Agrega una mascota para poder elegirla al agendar una cita.</p></section>}
      {state === 'ready' && pets.length > 0 && <ul className="pets-list">{pets.map((pet) => <li className="pet-card" key={pet.id}>
        <h2>{pet.name}</h2><dl className="pet-details"><div><dt>Especie</dt><dd>{speciesLabel(pet.species)}</dd></div><div><dt>Raza</dt><dd>{pet.breed}</dd></div><div><dt>Edad</dt><dd>{pet.ageYears} años</dd></div>{pet.weightKg !== undefined && <div><dt>Peso</dt><dd>{pet.weightKg} kg</dd></div>}{pet.heightCm !== undefined && <div><dt>Altura</dt><dd>{pet.heightCm} cm</dd></div>}</dl>
        <div className="pet-actions"><button className="button-secondary" type="button" onClick={() => { setEditing(pet); setAdding(false); setError(''); }}>Editar</button><button className="link-button" type="button" onClick={() => void removePet(pet)}>Retirar</button></div>
      </li>)}</ul>}
      {(adding || editing) && <PetForm initial={editing ? { name: editing.name, species: editing.species, breed: editing.breed, ageYears: String(editing.ageYears), weightKg: editing.weightKg === undefined ? '' : String(editing.weightKg), heightCm: editing.heightCm === undefined ? '' : String(editing.heightCm) } : emptyPet} submitLabel={editing ? 'Guardar cambios' : 'Agregar mascota'} error={error} fieldErrors={fieldErrors} onSubmit={(payload) => void savePet(payload, editing?.id)} onCancel={() => { setAdding(false); setEditing(null); setError(''); setFieldErrors({}); }} />}
    </section>
  </main>;
}