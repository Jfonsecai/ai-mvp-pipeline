import { useEffect, useState } from 'react';
import { ApiError, apiFetch } from '../api/client.js';

const DAYS = [
  { weekday: 1, name: 'Lunes' },
  { weekday: 2, name: 'Martes' },
  { weekday: 3, name: 'Miércoles' },
  { weekday: 4, name: 'Jueves' },
  { weekday: 5, name: 'Viernes' },
  { weekday: 6, name: 'Sábado' },
  { weekday: 7, name: 'Domingo' },
];

const hourLabel = (hour) => {
  const date = new Date(Date.UTC(2000, 0, 1, hour === 24 ? 0 : hour));
  const label = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(date);
  return hour === 24 ? `${label} (medianoche)` : label;
};

const startHours = Array.from({ length: 24 }, (_, hour) => hour);
const endHours = Array.from({ length: 24 }, (_, index) => index + 1);

function serverFieldErrors(fields) {
  const errors = {};
  for (const { field, reason } of fields ?? []) {
    const match = /^days\.(\d+)\.(startHour|endHour)$/.exec(field);
    if (!match) continue;
    const day = DAYS[Number(match[1])];
    if (!day) continue;
    const message = reason === 'NOT_ON_THE_HOUR'
      ? 'Usa horas en punto, por ejemplo 8:00 a. m.'
      : reason === 'END_NOT_AFTER_START'
        ? 'La hora de cierre debe ser posterior a la de apertura.'
        : reason === 'OUT_OF_RANGE'
          ? 'Elige una hora válida.'
          : 'Selecciona una hora.';
    errors[`${day.weekday}.${match[2]}`] = message;
  }
  return errors;
}

function validateDays(days) {
  const errors = {};
  for (const [index, day] of days.entries()) {
    if (!day.works) continue;
    if (day.startHour === undefined || day.endHour === undefined) {
      if (day.startHour === undefined) errors[`${day.weekday}.startHour`] = 'Selecciona una hora.';
      if (day.endHour === undefined) errors[`${day.weekday}.endHour`] = 'Selecciona una hora.';
    } else if (day.endHour <= day.startHour) {
      errors[`${day.weekday}.endHour`] = 'La hora de cierre debe ser posterior a la de apertura.';
    }
  }
  return errors;
}

export default function ProviderWorkingHours() {
  const [days, setDays] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alert, setAlert] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch('/api/provider/working-hours')
      .then(({ days: savedDays }) => { if (active) setDays(savedDays); })
      .catch(() => { if (active) setAlert('No pudimos cargar tu horario. Revisa tu conexión e inténtalo de nuevo.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function updateDay(weekday, update) {
    setDays((current) => current.map((day) => day.weekday === weekday ? { ...day, ...update } : day));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`${weekday}.startHour`];
      delete next[`${weekday}.endHour`];
      return next;
    });
    setAlert('');
    setNotice('');
  }

  async function save(event) {
    event.preventDefault();
    const errors = validateDays(days);
    setFieldErrors(errors);
    setAlert('');
    setNotice('');
    if (Object.keys(errors).length) {
      setAlert('Revisa las horas marcadas para continuar.');
      return;
    }

    setSaving(true);
    const payload = {
      days: days.map((day) => day.works
        ? { weekday: day.weekday, works: true, startHour: Number(day.startHour), endHour: Number(day.endHour) }
        : { weekday: day.weekday, works: false }),
    };
    try {
      const saved = await apiFetch('/api/provider/working-hours', { method: 'PUT', body: payload });
      setDays(saved.days);
      setNotice('Horario guardado.');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        const nextErrors = serverFieldErrors(error.fields);
        setFieldErrors(nextErrors);
        setAlert(Object.keys(nextErrors).length ? 'Revisa las horas marcadas para continuar.' : 'Revisa los días y las horas ingresadas.');
      } else {
        setAlert('No pudimos guardar tu horario. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  }

  const noHours = days.length === 7 && days.every((day) => !day.works);

  return (
    <main className="page-shell working-hours-page">
      <section className="working-hours-card" aria-labelledby="working-hours-title">
        <h1 id="working-hours-title">Horario de atención</h1>
        <p className="working-hours-subtitle">Los dueños solo podrán agendar en estos días y horas. Cada cita dura 1 hora.</p>
        {loading && <p role="status">Cargando horario…</p>}
        {!loading && noHours && <div className="info-alert" role="status">Aún no has definido tu horario. Mientras no lo hagas, los dueños no podrán agendar citas contigo.</div>}
        {alert && <div className="form-alert" role="alert">{alert}</div>}
        {notice && <div className="success-alert" role="status">{notice}</div>}
        {!loading && <form onSubmit={save} noValidate>
          <h2>Semana</h2>
          <div className="working-hours-list">
            {days.map((day) => {
              const name = DAYS[day.weekday - 1].name;
              const startError = fieldErrors[`${day.weekday}.startHour`];
              const endError = fieldErrors[`${day.weekday}.endHour`];
              return <fieldset className="working-day-row" key={day.weekday}>
                <legend>{name}</legend>
                <label className="working-day-toggle">
                  <input
                    type="checkbox"
                    checked={day.works}
                    onChange={(event) => updateDay(day.weekday, { works: event.target.checked })}
                  />
                  Atiende
                </label>
                {day.works
                  ? <div className="working-day-hours">
                    <label htmlFor={`start-${day.weekday}`}>Desde</label>
                    <div>
                      <select
                        id={`start-${day.weekday}`}
                        value={day.startHour ?? ''}
                        aria-invalid={Boolean(startError)}
                        aria-describedby={startError ? `start-error-${day.weekday}` : undefined}
                        onChange={(event) => updateDay(day.weekday, { startHour: event.target.value === '' ? undefined : Number(event.target.value) })}
                      >
                        <option value="">Selecciona una hora</option>
                        {startHours.map((hour) => <option value={hour} key={hour}>{hourLabel(hour)}</option>)}
                      </select>
                      {startError && <span className="field-error" id={`start-error-${day.weekday}`}>{startError}</span>}
                    </div>
                    <label htmlFor={`end-${day.weekday}`}>Hasta</label>
                    <div>
                      <select
                        id={`end-${day.weekday}`}
                        value={day.endHour ?? ''}
                        aria-invalid={Boolean(endError)}
                        aria-describedby={endError ? `end-error-${day.weekday}` : undefined}
                        onChange={(event) => updateDay(day.weekday, { endHour: event.target.value === '' ? undefined : Number(event.target.value) })}
                      >
                        <option value="">Selecciona una hora</option>
                        {endHours.map((hour) => <option value={hour} key={hour}>{hourLabel(hour)}</option>)}
                      </select>
                      {endError && <span className="field-error" id={`end-error-${day.weekday}`}>{endError}</span>}
                    </div>
                  </div>
                  : <span className="working-day-off">No atiende</span>}
              </fieldset>;
            })}
          </div>
          <div className="warning-alert">Si cambias tu horario, las citas próximas que queden por fuera del nuevo horario se cancelarán automáticamente y aparecerán como canceladas.</div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Guardando horario…' : 'Guardar horario'}</button>
        </form>}
      </section>
    </main>
  );
}
