import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
const modalityLabel = (modality) => (modality === 'home' ? 'A domicilio' : 'En la clínica');

function AppointmentCard({ appointment }) {
  const when = `${dateLabel.format(new Date(appointment.startsAt))} · ${timeLabel.format(new Date(appointment.startsAt))} – ${timeLabel.format(new Date(appointment.endsAt))}`;
  const cancelled = appointment.status === 'cancelled';

  return <li className="appointment-list-item">
    <article className={`appointment-card ${cancelled ? 'appointment-card-cancelled' : ''}`} aria-labelledby={`provider-appointment-${appointment.id}`}>
      <h3 id={`provider-appointment-${appointment.id}`} tabIndex={-1}>{when}</h3>
      <div className="appointment-badges">
        <span className={`appointment-badge ${cancelled ? 'appointment-badge-neutral' : 'appointment-badge-success'}`}>
          {cancelled ? 'Cancelada' : 'Programada'}
        </span>
        <span className="appointment-badge appointment-badge-neutral">{modalityLabel(appointment.modality)}</span>
      </div>
      <dl className="appointment-details">
        <div><dt>Servicio</dt><dd>{appointment.service.name}</dd></div>
        <div><dt>Mascota</dt><dd>{appointment.pet.name}</dd></div>
        <div><dt>Dueño</dt><dd>{appointment.ownerName}</dd></div>
        {appointment.modality === 'home' && <div><dt>Dirección</dt><dd>{appointment.visitAddress}</dd></div>}
      </dl>
    </article>
  </li>;
}

export default function ProviderAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState('loading');
    apiFetch('/api/provider/appointments')
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

  const upcoming = appointments.filter((appointment) => appointment.upcoming);
  const previous = appointments.filter((appointment) => !appointment.upcoming);

  return <main className="page-shell appointments-page">
    <section className="appointments-content" aria-labelledby="provider-appointments-title">
      <h1 id="provider-appointments-title">Citas</h1>
      {state === 'loading' && <p className="appointments-message" role="status">Cargando tus citas…</p>}
      {state === 'error' && <div className="form-alert" role="alert">
        {MSG_NET} <button className="link-button" type="button" onClick={() => setAttempt((count) => count + 1)}>Reintentar</button>
      </div>}
      {state === 'ready' && appointments.length === 0 && <section className="appointments-empty">
        <h2>Aún no tienes citas</h2>
        <p>Cuando alguien agende un servicio contigo, aparecerá aquí.</p>
        <div className="appointments-empty-actions">
          <Link className="button-link" to="/provider/catalog">Ir al catálogo</Link>
          <Link className="button-secondary" to="/provider/working-hours">Definir horario</Link>
        </div>
      </section>}
      {state === 'ready' && appointments.length > 0 && <>
        <section className="appointments-group" aria-labelledby="provider-upcoming-title">
          <h2 id="provider-upcoming-title">Próximas</h2>
          {upcoming.length
            ? <ul className="appointment-list">{upcoming.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}</ul>
            : <p className="appointments-message">No tienes citas próximas.</p>}
        </section>
        <section className="appointments-group" aria-labelledby="provider-previous-title">
          <h2 id="provider-previous-title">Anteriores</h2>
          {previous.length
            ? <ul className="appointment-list">{previous.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}</ul>
            : <p className="appointments-message">No tienes citas anteriores.</p>}
        </section>
      </>}
    </section>
  </main>;
}
