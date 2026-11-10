import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

const MSG_NET = 'No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.';
const MSG_SLOT_GONE = 'Ese horario ya no está disponible. Elige otro.';
const addDays = (date, days) => {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
};
const mondayOf = (date) => addDays(date, 1 - (new Date(`${date}T00:00:00Z`).getUTCDay() || 7));
const dayChipLabel = (date) => new Intl.DateTimeFormat('es-CO', {
  weekday: 'short',
  day: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${date}T12:00:00Z`)).replace('.', '');
const dayFullLabel = (date) => new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${date}T12:00:00Z`));
const dateLabel = new Intl.DateTimeFormat('es-CO', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Bogota',
});
const timeLabel = (iso) => new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/Bogota',
}).format(new Date(iso));
const modalityLabel = (modality) => (modality === 'home' ? 'A domicilio' : 'En la clínica');
const firstDayWithSlots = (days) => days.find((day) => day.slots.length > 0)?.date ?? '';

export default function RescheduleAppointment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [context, setContext] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [state, setState] = useState('loading');
  const [weekLoading, setWeekLoading] = useState(false);
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState('');
  const [alert, setAlert] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef(0);

  const loadContext = useCallback(async (weekStart) => {
    const current = ++requestId.current;
    const query = weekStart ? `?weekStart=${weekStart}` : '';
    const value = await apiFetch(`/api/owner/appointments/${encodeURIComponent(appointmentId)}/reschedule-context${query}`);
    if (current !== requestId.current) return null;
    return value;
  }, [appointmentId]);

  const applyContext = useCallback((value) => {
    setContext(value);
    setDay(firstDayWithSlots(value.days));
    setSlot('');
  }, []);

  useEffect(() => {
    let active = true;
    setState('loading');
    Promise.all([loadContext(), apiFetch('/api/owner/appointments')])
      .then(([value, result]) => {
        if (!active || !value) return;
        const found = result.appointments.find((item) => item.id === appointmentId);
        if (!found) {
          setState('not-found');
          return;
        }
        setAppointment(found);
        applyContext(value);
        setState('ready');
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.code === 'NOT_FOUND') setState('not-found');
        else if (error instanceof ApiError && error.code === 'APPOINTMENT_NOT_CHANGEABLE') setState('not-changeable');
        else setState('error');
      });
    return () => { active = false; };
  }, [appointmentId, attempt, loadContext, applyContext]);

  async function changeWeek(weekStart) {
    setWeekLoading(true);
    setAlert('');
    try {
      const value = await loadContext(weekStart);
      if (value) applyContext(value);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'APPOINTMENT_NOT_CHANGEABLE') setState('not-changeable');
      else if (error instanceof ApiError && error.code === 'NOT_FOUND') setState('not-found');
      else setAlert(MSG_NET);
    } finally {
      setWeekLoading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!slot) {
      setAlert('Elige un horario.');
      return;
    }
    setSaving(true);
    setAlert('');
    try {
      const saved = await apiFetch(`/api/owner/appointments/${encodeURIComponent(appointmentId)}/reschedule`, {
        method: 'POST',
        body: { startsAt: slot },
      });
      navigate('/owner/appointments', { state: { justRescheduledId: saved.id } });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SLOT_UNAVAILABLE') {
        setAlert(MSG_SLOT_GONE);
        try {
          const value = await loadContext(context.weekStart);
          if (value) applyContext(value);
        } catch (refreshError) {
          if (refreshError instanceof ApiError && refreshError.code === 'APPOINTMENT_NOT_CHANGEABLE') setState('not-changeable');
          else setAlert(MSG_NET);
        }
      } else if (error instanceof ApiError && error.code === 'APPOINTMENT_NOT_CHANGEABLE') {
        setState('not-changeable');
      } else if (error instanceof ApiError && error.code === 'NOT_FOUND') {
        setState('not-found');
      } else {
        setAlert(MSG_NET);
      }
    } finally {
      setSaving(false);
    }
  }

  if (state === 'not-found') return <Navigate to="/not-found" replace />;
  const currentWeekMonday = context ? mondayOf(context.now.slice(0, 10)) : '';
  const selectedDay = context?.days.find((entry) => entry.date === day);
  const currentDate = appointment ? new Date(appointment.startsAt) : null;

  return <main className="page-shell booking-page">
    <section className="booking-card" aria-labelledby="reschedule-title">
      <Link className="back-link" to="/owner/appointments">Volver a Mis citas</Link>
      <h1 id="reschedule-title">Reprogramar cita</h1>
      {state === 'loading' && <p role="status">Cargando horarios…</p>}
      {state === 'error' && <div className="form-alert" role="alert">
        {MSG_NET} <button className="link-button" type="button" onClick={() => setAttempt((count) => count + 1)}>Reintentar</button>
      </div>}
      {state === 'not-changeable' && <div className="form-alert" role="alert">
        Esta cita ya no se puede reprogramar. <Link className="link-button" to="/owner/appointments">Volver a Mis citas</Link>
      </div>}
      {state === 'ready' && context && appointment && <>
        <section className="booking-summary" aria-labelledby="reschedule-summary-title">
          <h2 id="reschedule-summary-title">{appointment.service.name}</h2>
          <dl className="catalog-details">
            <div><dt>Proveedor</dt><dd>{appointment.provider.name}</dd></div>
            <div><dt>Mascota</dt><dd>{appointment.pet.name}</dd></div>
            <div><dt>Modalidad</dt><dd>{modalityLabel(appointment.modality)}</dd></div>
            <div><dt>Horario actual</dt><dd>{dateLabel.format(currentDate)} · {timeLabel(appointment.startsAt)}</dd></div>
          </dl>
        </section>

        {alert && <div className="form-alert" role="alert">{alert}</div>}
        {!context.providerHasHours
          ? <div className="info-alert" role="status">Este proveedor aún no ha definido su horario de atención, por eso no es posible reprogramar.</div>
          : <form onSubmit={submit}>
            <fieldset className="booking-section">
              <legend>Elige el nuevo horario</legend>
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
                    <input type="radio" name="reschedule-day" value={entry.date} disabled={!available || weekLoading}
                      checked={day === entry.date} aria-label={dayFullLabel(entry.date)}
                      onChange={() => { setDay(entry.date); setSlot(''); setAlert(''); }} />
                    <span>{dayChipLabel(entry.date)}</span>
                    {!available && <small>Sin horarios</small>}
                  </label>;
                })}
              </fieldset>
              {!context.days.some((entry) => entry.slots.length > 0) && <p className="field-help" role="status">No hay horarios disponibles esta semana. Prueba la semana siguiente.</p>}
              {selectedDay && <fieldset className="chip-group chip-group-slots" aria-label="Hora">
                {selectedDay.slots.map((iso) => <label className="chip" key={iso}>
                  <input type="radio" name="reschedule-slot" value={iso} checked={slot === iso}
                    aria-label={`${dayFullLabel(selectedDay.date)}, ${timeLabel(iso)}`}
                    onChange={() => { setSlot(iso); setAlert(''); }} />
                  <span>{timeLabel(iso)}</span>
                </label>)}
              </fieldset>}
              <p className="field-help">Se mantienen la mascota, el servicio, la modalidad y el lugar de la cita. Hora de Bogotá.</p>
            </fieldset>
            <div className="pet-form-actions">
              <button className="primary-button" type="submit" disabled={saving || !slot}>
                {saving ? 'Reprogramando…' : 'Confirmar nuevo horario'}
              </button>
              <Link className="button-secondary" to="/owner/appointments">Volver</Link>
            </div>
          </form>}
      </>}
    </section>
  </main>;
}
