import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../api/client.js';

const MSG_NET = 'No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.';
const dateLabel = new Intl.DateTimeFormat('es-CO', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Bogota',
});
const timeLabel = new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/Bogota',
});
const providerTypeLabel = (type) => (type === 'clinic' ? 'Clínica veterinaria' : 'Veterinario independiente');
const modalityLabel = (modality) => (modality === 'home' ? 'A domicilio' : 'En la clínica');

function AppointmentCard({ appointment, headingRefs }) {
  const when = `${dateLabel.format(new Date(appointment.startsAt))} · ${timeLabel.format(new Date(appointment.startsAt))} – ${timeLabel.format(new Date(appointment.endsAt))}`;
  const cancelled = appointment.status === 'cancelled';

  return <li className="appointment-list-item">
    <article className={`appointment-card ${cancelled ? 'appointment-card-cancelled' : ''}`} aria-labelledby={`appointment-${appointment.id}`}>
      <h3
        id={`appointment-${appointment.id}`}
        ref={(node) => {
          if (node) headingRefs.current.set(appointment.id, node);
          else headingRefs.current.delete(appointment.id);
        }}
        tabIndex={-1}
      >
        {when}
      </h3>
      <div className="appointment-badges">
        <span className={`appointment-badge ${cancelled ? 'appointment-badge-neutral' : 'appointment-badge-success'}`}>
          {cancelled ? 'Cancelada' : 'Programada'}
        </span>
        <span className="appointment-badge appointment-badge-neutral">{modalityLabel(appointment.modality)}</span>
        <span className="appointment-badge appointment-badge-neutral">{providerTypeLabel(appointment.provider.type)}</span>
      </div>
      <dl className="appointment-details">
        <div><dt>Servicio</dt><dd>{appointment.service.name}</dd></div>
        <div><dt>Proveedor</dt><dd>{appointment.provider.name}</dd></div>
        <div><dt>Mascota</dt><dd>{appointment.pet.name}</dd></div>
        <div><dt>{appointment.modality === 'home' ? 'Domicilio' : 'Lugar'}</dt><dd>{appointment.place.address}</dd></div>
      </dl>
    </article>
  </li>;
}

export default function OwnerAppointments() {
  const location = useLocation();
  const justBookedId = location.state?.justBookedId;
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const headingRefs = useRef(new Map());

  useEffect(() => {
    let active = true;
    setState('loading');
    apiFetch('/api/owner/appointments')
      .then((response) => {
        if (!active) return;
        setAppointments(response.appointments);
        setState('ready');
      })
      .catch(() => {
        if (active) setState('error');
      });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (state !== 'ready' || !justBookedId || !appointments.some((appointment) => appointment.id === justBookedId)) return undefined;
    setToastVisible(true);
    const timeout = window.setTimeout(() => setToastVisible(false), 5_000);
    return () => window.clearTimeout(timeout);
  }, [state, justBookedId, appointments]);

  useEffect(() => {
    if (state !== 'ready' || !justBookedId || !headingRefs.current.has(justBookedId)) return undefined;
    const frame = window.requestAnimationFrame(() => headingRefs.current.get(justBookedId)?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [state, justBookedId, appointments]);

  const upcoming = appointments.filter((appointment) => appointment.upcoming);
  const previous = appointments.filter((appointment) => !appointment.upcoming);
  const justBooked = appointments.find((appointment) => appointment.id === justBookedId);

  return <main className="page-shell appointments-page">
    <section className="appointments-content" aria-labelledby="appointments-title">
      <h1 id="appointments-title">Mis citas</h1>
      {state === 'loading' && <p className="appointments-message" role="status">Cargando tus citas…</p>}
      {state === 'error' && <div className="form-alert" role="alert">
        {MSG_NET} <button className="link-button" type="button" onClick={() => setAttempt((count) => count + 1)}>Reintentar</button>
      </div>}
      {state === 'ready' && appointments.length === 0 && <section className="appointments-empty">
        <h2>Aún no tienes citas</h2>
        <p>Busca un servicio para agendar tu primera cita.</p>
        <Link className="button-link" to="/owner/home">Buscar servicios</Link>
      </section>}
      {state === 'ready' && appointments.length > 0 && <>
        {toastVisible && justBooked && <div className="appointment-toast success-alert" role="status">Cita agendada: {justBooked.service.name}</div>}
        <section className="appointments-group" aria-labelledby="upcoming-title">
          <h2 id="upcoming-title">Próximas</h2>
          {upcoming.length
            ? <ul className="appointment-list">{upcoming.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} headingRefs={headingRefs} />)}</ul>
            : <p className="appointments-message">No tienes citas próximas.</p>}
        </section>
        <section className="appointments-group" aria-labelledby="previous-title">
          <h2 id="previous-title">Anteriores</h2>
          {previous.length
            ? <ul className="appointment-list">{previous.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} headingRefs={headingRefs} />)}</ul>
            : <p className="appointments-message">No tienes citas anteriores.</p>}
        </section>
      </>}
    </section>
  </main>;
}
