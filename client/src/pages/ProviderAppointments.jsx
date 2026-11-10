import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';

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

function ConfirmCancelDialog({ appointment, busy, error, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const startsAt = new Date(appointment.startsAt);
  const dateTime = `${dateLabel.format(startsAt)} · ${timeLabel.format(startsAt)}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return <dialog
    className="confirm-dialog"
    ref={dialogRef}
    aria-labelledby="provider-cancel-title"
    aria-describedby="provider-cancel-text"
    onCancel={(event) => {
      event.preventDefault();
      if (!busy) onCancel();
    }}
  >
    <h2 id="provider-cancel-title">¿Cancelar esta cita?</h2>
    <p id="provider-cancel-text"><strong>{appointment.service.name} · {dateTime}.</strong> La cita quedará cancelada y no se podrá reactivar. El dueño la verá como cancelada.</p>
    {error && <div className="form-alert" role="alert">{error}</div>}
    <div className="confirm-actions">
      <button className="button-secondary" type="button" onClick={onCancel} disabled={busy}>No, volver</button>
      <button className="danger-button" type="button" onClick={onConfirm} disabled={busy}>Sí, cancelar cita</button>
    </div>
  </dialog>;
}

function AppointmentCard({ appointment, headingRefs, onCancel }) {
  const when = `${dateLabel.format(new Date(appointment.startsAt))} · ${timeLabel.format(new Date(appointment.startsAt))} – ${timeLabel.format(new Date(appointment.endsAt))}`;
  const cancelled = appointment.status === 'cancelled';

  return <li className="appointment-list-item">
    <article className={`appointment-card ${cancelled ? 'appointment-card-cancelled' : ''}`} aria-labelledby={`provider-appointment-${appointment.id}`}>
      <h3
        id={`provider-appointment-${appointment.id}`}
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
      </div>
      <dl className="appointment-details">
        <div><dt>Servicio</dt><dd>{appointment.service.name}</dd></div>
        <div><dt>Mascota</dt><dd>{appointment.pet.name}</dd></div>
        <div><dt>Dueño</dt><dd>{appointment.ownerName}</dd></div>
        {appointment.modality === 'home' && <div><dt>Dirección</dt><dd>{appointment.visitAddress}</dd></div>}
      </dl>
      {appointment.upcoming && appointment.status === 'scheduled' && <div className="appointment-card-actions">
        <Link
          className="link-button"
          to={`/provider/appointments/${appointment.id}/reschedule`}
          aria-label={`Reprogramar cita: ${appointment.service.name}`}
        >
          Reprogramar
        </Link>
        <button
          className="link-button danger-link"
          type="button"
          onClick={(event) => onCancel(appointment, event.currentTarget)}
          aria-label={`Cancelar cita: ${appointment.service.name}`}
        >
          Cancelar cita
        </button>
      </div>}
    </article>
  </li>;
}

export default function ProviderAppointments() {
  const location = useLocation();
  const justRescheduledId = location.state?.justRescheduledId;
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [cancelling, setCancelling] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelDialogError, setCancelDialogError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelToastVisible, setCancelToastVisible] = useState(false);
  const [rescheduleToastVisible, setRescheduleToastVisible] = useState(false);
  const headingRefs = useRef(new Map());
  const openerRef = useRef(null);
  const cancelledAppointmentIdRef = useRef(null);
  const pageHeadingRef = useRef(null);
  const rescheduleToastShownRef = useRef(false);

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

  useEffect(() => {
    if (
      rescheduleToastShownRef.current || state !== 'ready' || !justRescheduledId
      || !appointments.some((appointment) => appointment.id === justRescheduledId)
    ) return undefined;
    rescheduleToastShownRef.current = true;
    setRescheduleToastVisible(true);
    const timeout = window.setTimeout(() => setRescheduleToastVisible(false), 5_000);
    return () => window.clearTimeout(timeout);
  }, [state, justRescheduledId, appointments]);

  useEffect(() => {
    if (!cancelToastVisible) return undefined;
    const timeout = window.setTimeout(() => setCancelToastVisible(false), 5_000);
    return () => window.clearTimeout(timeout);
  }, [cancelToastVisible]);

  useEffect(() => {
    if (cancelling || !openerRef.current) return;
    const opener = openerRef.current;
    openerRef.current = null;
    if (opener.isConnected) opener.focus();
    else {
      const heading = cancelledAppointmentIdRef.current && headingRefs.current.get(cancelledAppointmentIdRef.current);
      cancelledAppointmentIdRef.current = null;
      (heading ?? pageHeadingRef.current)?.focus();
    }
  }, [cancelling]);

  const upcoming = appointments.filter((appointment) => appointment.upcoming);
  const previous = appointments.filter((appointment) => !appointment.upcoming);

  function openCancel(appointment, opener) {
    setCancelError('');
    setCancelDialogError('');
    openerRef.current = opener;
    setCancelling(appointment);
  }

  function closeCancel() {
    if (cancelBusy) return;
    setCancelling(null);
    setCancelDialogError('');
  }

  async function confirmCancel() {
    if (!cancelling) return;
    const appointment = cancelling;
    setCancelBusy(true);
    setCancelDialogError('');
    try {
      const saved = await apiFetch(`/api/provider/appointments/${appointment.id}/cancel`, { method: 'POST' });
      setAppointments((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      cancelledAppointmentIdRef.current = saved.id;
      setCancelToastVisible(true);
      setCancelling(null);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'APPOINTMENT_NOT_CHANGEABLE') {
        setCancelling(null);
        setCancelError('Esta cita ya no se puede cancelar.');
        setAttempt((count) => count + 1);
      } else if (error instanceof ApiError && error.status === 404) {
        setCancelling(null);
        setCancelError('Esta cita ya no está disponible. Actualizamos tus citas.');
        setAttempt((count) => count + 1);
      } else {
        setCancelDialogError(MSG_NET);
      }
    } finally {
      setCancelBusy(false);
    }
  }

  return <main className="page-shell appointments-page">
    <section className="appointments-content" aria-labelledby="provider-appointments-title">
      <h1 id="provider-appointments-title" ref={pageHeadingRef} tabIndex={-1}>Citas</h1>
      {cancelError && <div className="form-alert" role="alert">{cancelError}</div>}
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
        {cancelToastVisible && <div className="appointment-toast success-alert" role="status">Cita cancelada. El dueño la verá como cancelada.</div>}
        {rescheduleToastVisible && <div className="appointment-toast success-alert" role="status">Cita reprogramada.</div>}
        <section className="appointments-group" aria-labelledby="provider-upcoming-title">
          <h2 id="provider-upcoming-title">Próximas</h2>
          {upcoming.length
            ? <ul className="appointment-list">{upcoming.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} headingRefs={headingRefs} onCancel={openCancel} />)}</ul>
            : <p className="appointments-message">No tienes citas próximas.</p>}
        </section>
        <section className="appointments-group" aria-labelledby="provider-previous-title">
          <h2 id="provider-previous-title">Anteriores</h2>
          {previous.length
            ? <ul className="appointment-list">{previous.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} headingRefs={headingRefs} onCancel={openCancel} />)}</ul>
            : <p className="appointments-message">No tienes citas anteriores.</p>}
        </section>
      </>}
    </section>
    {cancelling && <ConfirmCancelDialog
      appointment={cancelling}
      busy={cancelBusy}
      error={cancelDialogError}
      onConfirm={confirmCancel}
      onCancel={closeCancel}
    />}
  </main>;
}
