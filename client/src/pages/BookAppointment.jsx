import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

// SCR-UX-006 "Agendar cita" (FLOW-UX-010; US-019, US-020): pet, place and day/time.
const MSG_NET = 'No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.';
const MSG_FORM = 'Revisa los campos marcados para continuar.';
const MSG_SLOT_GONE = 'Ese horario ya no está disponible. Elige otro.';
const MSG_REQUIRED = 'Este campo es obligatorio.';
const speciesLabel = (species) => (species === 'dog' ? 'Perro' : 'Gato');
const speciesPlural = (species) => (species === 'dog' ? 'perros' : 'gatos');
const typeLabel = (type) => (type === 'clinic' ? 'Clínica veterinaria' : 'Veterinario independiente');
const modalityLabel = (modality) => ({ clinic: 'En la clínica', home: 'A domicilio', both: 'En la clínica y a domicilio' })[modality];
const priceLabel = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// Calendar arithmetic on YYYY-MM-DD strings (Bogota dates; no time zone involved).
const addDays = (date, days) => {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
};
const mondayOf = (date) => addDays(date, 1 - (new Date(`${date}T00:00:00Z`).getUTCDay() || 7));

const dayChipLabel = (date) => new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${date}T12:00:00Z`)).replace('.', '');
const dayFullLabel = (date) => new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  .format(new Date(`${date}T12:00:00Z`));
const timeLabel = (iso) => new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' })
  .format(new Date(iso));
const slotFullLabel = (date, iso) => `${dayFullLabel(date)}, ${timeLabel(iso)} a ${timeLabel(new Date(new Date(iso).getTime() + 3_600_000))}`;

const firstDayWithSlots = (days) => days.find((day) => day.slots.length > 0)?.date ?? '';

export default function BookAppointment() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [pets, setPets] = useState(null);
  const [context, setContext] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | error | not-found
  const [weekLoading, setWeekLoading] = useState(false);
  const [petId, setPetId] = useState('');
  const [modality, setModality] = useState('');
  const [visitAddress, setVisitAddress] = useState('');
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState('');
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef(0);

  const applyContext = useCallback((value) => {
    setContext(value);
    setDay(firstDayWithSlots(value.days));
    setSlot('');
  }, []);

  const loadContext = useCallback(async (weekStart) => {
    const current = ++requestId.current;
    const query = weekStart ? `?weekStart=${weekStart}` : '';
    const value = await apiFetch(`/api/services/${encodeURIComponent(serviceId)}/booking-context${query}`);
    if (current !== requestId.current) return null;
    return value;
  }, [serviceId]);

  useEffect(() => {
    let active = true;
    setState('loading');
    Promise.all([apiFetch('/api/owner/pets'), loadContext()])
      .then(([petList, value]) => {
        if (!active || !value) return;
        setPets(petList.pets);
        applyContext(value);
        setModality(value.service.modality === 'both' ? '' : value.service.modality);
        setVisitAddress('');
        if (value.eligiblePetIds.length === 1) setPetId(value.eligiblePetIds[0]);
        setState('ready');
      })
      .catch((error) => {
        if (active) setState(error instanceof ApiError && error.code === 'NOT_FOUND' ? 'not-found' : 'error');
      });
    return () => { active = false; };
  }, [serviceId, attempt, loadContext, applyContext]);

  async function changeWeek(weekStart) {
    setWeekLoading(true);
    setAlert('');
    try {
      const value = await loadContext(weekStart);
      if (value) applyContext(value);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'NOT_FOUND') setState('not-found');
      else setAlert(MSG_NET);
    } finally {
      setWeekLoading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!petId) nextErrors.pet = 'Elige una mascota.';
    if (service.modality === 'both' && !modality) nextErrors.modality = 'Elige dónde será la cita.';
    if (modality === 'home' && !visitAddress.trim()) nextErrors.visitAddress = MSG_REQUIRED;
    if (!slot) nextErrors.slot = 'Elige un horario.';
    setErrors(nextErrors);
    setAlert('');
    if (Object.keys(nextErrors).length) {
      setAlert(MSG_FORM);
      return;
    }

    setSaving(true);
    const payload = {
      serviceId: context.service.id,
      petId,
      startsAt: slot,
      ...(context.service.modality === 'both' ? { modality } : {}),
      ...(modality === 'home' ? { visitAddress: visitAddress.trim() } : {}),
    };
    try {
      const appointment = await apiFetch('/api/owner/appointments', { method: 'POST', body: payload });
      navigate('/owner/appointments', { state: { justBookedId: appointment.id } });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SLOT_UNAVAILABLE') {
        setAlert(MSG_SLOT_GONE);
        try {
          const value = await loadContext(context.weekStart);
          if (value) {
            setContext(value);
            setDay((current) => (value.days.find((d) => d.date === current)?.slots.length ? current : firstDayWithSlots(value.days)));
            setSlot('');
          }
        } catch {
          setAlert(MSG_NET);
        }
      } else if (error instanceof ApiError && error.code === 'NOT_FOUND') {
        setState('not-found');
      } else if (error instanceof ApiError && error.code === 'PET_NOT_ELIGIBLE') {
        setAlert(`Este servicio es solo para ${speciesPlural(context.service.species)}.`);
      } else if (error instanceof ApiError && error.code === 'NO_PETS') {
        setAlert('Para agendar necesitas tener al menos una mascota registrada.');
      } else if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        setAlert(MSG_FORM);
      } else {
        setAlert(MSG_NET);
      }
    } finally {
      setSaving(false);
    }
  }

  if (state === 'not-found') return <Navigate to="/not-found" replace />;

  const service = context?.service;
  const onlySpecies = service ? speciesPlural(service.species) : '';
  const noPets = context && !context.ownerHasPets;
  const noEligible = context && context.ownerHasPets && context.eligiblePetIds.length === 0;
  const currentWeekMonday = context ? mondayOf(context.now.slice(0, 10)) : '';
  const selectedDay = context?.days.find((d) => d.date === day);

  return <main className="page-shell booking-page">
    <section className="booking-card" aria-labelledby="booking-title">
      <Link className="back-link" to="/owner/home">Volver a la búsqueda</Link>
      <h1 id="booking-title">Agendar cita</h1>
      {state === 'loading' && <p role="status">Cargando…</p>}
      {state === 'error' && <div className="form-alert" role="alert">
        {MSG_NET} <button className="link-button" type="button" onClick={() => setAttempt((count) => count + 1)}>Reintentar</button>
      </div>}

      {state === 'ready' && <>
        <section className="booking-summary" aria-labelledby="booking-service">
          <h2 id="booking-service">{service.name}</h2>
          <dl className="catalog-details">
            <div><dt>Proveedor</dt><dd><Link to={`/owner/providers/${service.provider.id}`}>{service.provider.name}</Link> · {typeLabel(service.provider.type)}</dd></div>
            <div><dt>Especie</dt><dd>{speciesLabel(service.species)}</dd></div>
            <div><dt>Precio</dt><dd>{priceLabel.format(service.priceCop)}</dd></div>
            <div><dt>Modalidad</dt><dd>{modalityLabel(service.modality)}</dd></div>
          </dl>
        </section>

        {alert && <div className="form-alert" role="alert">{alert}</div>}

        {noPets && <div className="info-alert" role="status">Para agendar necesitas tener al menos una mascota registrada.</div>}

        {!noPets && <form onSubmit={submit} noValidate>
          <fieldset className="booking-section" aria-describedby={errors.pet ? 'booking-pet-error' : undefined}>
            <legend>1. ¿Para qué mascota?</legend>
            {noEligible && <div className="warning-alert" role="status">
              Ninguna de tus mascotas puede recibir este servicio. Este servicio es solo para {onlySpecies}.
            </div>}
            {pets.map((pet) => {
              const eligible = context.eligiblePetIds.includes(pet.id);
              return <label className={`choice-card${eligible ? '' : ' choice-card-disabled'}`} key={pet.id}>
                <input
                  type="radio"
                  name="pet"
                  value={pet.id}
                  disabled={!eligible}
                  checked={petId === pet.id}
                  onChange={() => { setPetId(pet.id); setErrors((current) => ({ ...current, pet: undefined })); setAlert(''); }}
                />
                <span>
                  <strong>{pet.name}</strong>
                  <small>{speciesLabel(pet.species)} · {pet.breed}</small>
                  {!eligible && <small>Este servicio es solo para {onlySpecies}.</small>}
                </span>
              </label>;
            })}
            {errors.pet && <span id="booking-pet-error" className="field-error">{errors.pet}</span>}
          </fieldset>

          {!noEligible && <>
            <fieldset className="booking-section">
              <legend>2. ¿Dónde será la cita?</legend>
              {service.modality === 'both'
                ? <div className="modality-options" role="radiogroup" aria-label="Modalidad de la cita"
                  aria-describedby={errors.modality ? 'booking-modality-error' : undefined}>
                  <label className={`choice-card${modality === 'clinic' ? ' choice-card-selected' : ''}`}>
                    <input type="radio" name="modality" value="clinic" checked={modality === 'clinic'}
                      onChange={() => { setModality('clinic'); setErrors((current) => ({ ...current, modality: undefined })); setAlert(''); }} />
                    <span>En la clínica</span>
                  </label>
                  <label className={`choice-card${modality === 'home' ? ' choice-card-selected' : ''}`}>
                    <input type="radio" name="modality" value="home" checked={modality === 'home'}
                      onChange={() => { setModality('home'); setErrors((current) => ({ ...current, modality: undefined })); setAlert(''); }} />
                    <span>A domicilio</span>
                  </label>
                </div>
                : <p>{modality === 'home' ? 'Esta cita es a domicilio.' : 'Esta cita es en la clínica.'}</p>}
              {errors.modality && <span id="booking-modality-error" className="field-error">{errors.modality}</span>}
              {modality === 'home' && <>
                <label className="field-label" htmlFor="visit-address">Dirección de la visita</label>
                <input id="visit-address" name="visitAddress" type="text" value={visitAddress} maxLength={300} required
                  autoComplete="street-address" aria-invalid={Boolean(errors.visitAddress)}
                  aria-describedby={errors.visitAddress ? 'visit-address-error' : 'visit-address-help'}
                  onChange={(event) => {
                    setVisitAddress(event.target.value);
                    setErrors((current) => ({ ...current, visitAddress: undefined }));
                  }} />
                <span className="field-help" id="visit-address-help">Incluye barrio, torre o apartamento si aplica.</span>
                {errors.visitAddress && <span className="field-error" id="visit-address-error">{errors.visitAddress}</span>}
              </>}
              {modality === 'clinic' && service.provider.address && <p className="field-help">Lugar: {service.provider.address}</p>}
            </fieldset>

            <fieldset className="booking-section" aria-describedby={errors.slot ? 'booking-slot-error' : undefined}>
              <legend>3. ¿Cuándo?</legend>
              {!context.providerHasHours
                ? <div className="info-alert" role="status">Este proveedor aún no ha definido su horario de atención, por eso no es posible agendar.</div>
                : <>
                  <div className="week-nav">
                    <button className="button-secondary" type="button" disabled={weekLoading || context.weekStart <= currentWeekMonday}
                      onClick={() => changeWeek(addDays(context.weekStart, -7))}>Semana anterior</button>
                    <button className="button-secondary" type="button" disabled={weekLoading}
                      onClick={() => changeWeek(addDays(context.weekStart, 7))}>Semana siguiente</button>
                  </div>
                  <fieldset className="chip-group" aria-label="Día">
                    {context.days.map((entry) => {
                      const available = entry.slots.length > 0;
                      return <label className={`chip${available ? '' : ' chip-disabled'}`} key={entry.date}>
                        <input type="radio" name="day" value={entry.date} disabled={!available || weekLoading} checked={day === entry.date}
                          aria-label={dayFullLabel(entry.date)}
                          onChange={() => { setDay(entry.date); setSlot(''); setErrors((current) => ({ ...current, slot: undefined })); }} />
                        <span>{dayChipLabel(entry.date)}</span>
                        {!available && <small>Sin horarios</small>}
                      </label>;
                    })}
                  </fieldset>
                  {!context.days.some((entry) => entry.slots.length > 0) && <p className="field-help" role="status">No hay horarios disponibles esta semana. Prueba la semana siguiente.</p>}
                  {selectedDay && <fieldset className="chip-group chip-group-slots" aria-label="Hora">
                    {selectedDay.slots.map((iso) => <label className="chip" key={iso}>
                      <input type="radio" name="slot" value={iso} checked={slot === iso} aria-label={slotFullLabel(selectedDay.date, iso)}
                        onChange={() => { setSlot(iso); setErrors((current) => ({ ...current, slot: undefined })); setAlert(''); }} />
                      <span>{timeLabel(iso)}</span>
                    </label>)}
                  </fieldset>}
                  <p className="field-help">Cada cita dura 1 hora. Hora de Bogotá.</p>
                </>}
              {errors.slot && <span id="booking-slot-error" className="field-error">{errors.slot}</span>}
            </fieldset>

            {context.providerHasHours && <>
              <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Agendando…' : 'Agendar cita'}</button>
              <p className="field-help">La cita queda agendada de inmediato.</p>
            </>}
          </>}
        </form>}
      </>}
    </section>
  </main>;
}
