import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.js';
import ListenButton from '../voice/ListenButton.jsx';

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

const appointmentSpeech = (appointment, date, time) => [
  `Cita ${appointment.status === 'cancelled' ? 'cancelada' : 'programada'}.`,
  `Fecha: ${date}.`,
  `Hora: ${time}.`,
  `Servicio: ${appointment.service.name}.`,
  `Proveedor: ${appointment.provider.name}.`,
  `Mascota: ${appointment.pet.name}.`,
  `Modalidad: ${modalityLabel(appointment.modality)}.`,
].join(' ');

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
    aria-labelledby="cancel-title"
    aria-describedby="cancel-text"
    onCancel={(event) => {
      event.preventDefault();
      if (!busy) onCancel();
    }}
  >
    <h2 id="cancel-title">¿Cancelar esta cita?</h2>
    <p id="cancel-text"><strong>{appointment.service.name} · {dateTime}.</strong> La cita quedará cancelada y no se podrá reactivar.</p>
    {error && <div className="form-alert" role="alert">{error}</div>}
    <div className="confirm-actions">
      <button className="button-secondary" type="button" onClick={onCancel} disabled={busy}>No, volver</button>
      <button className="danger-button" type="button" onClick={onConfirm} disabled={busy}>Sí, cancelar cita</button>
    </div>
  </dialog>;
}

function AppointmentCard({ appointment, headingRefs, readingId, setReadingId, onCancel }) {
  const when = `${dateLabel.format(new Date(appointment.startsAt))} · ${timeLabel.format(new Date(appointment.startsAt))} – ${timeLabel.format(new Date(appointment.endsAt))}`;
  const speechDate = dateLabel.format(new Date(appointment.startsAt));
  const speechTime = `${timeLabel.format(new Date(appointment.startsAt))} a ${timeLabel.format(new Date(appointment.endsAt))}`;
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
      <ListenButton
        text={appointmentSpeech(appointment, speechDate, speechTime)}
        active={readingId === appointment.id}
        onStart={() => setReadingId(appointment.id)}
        onStop={() => setReadingId(null)}
      />
      {appointment.upcoming && !cancelled && <div className="appointment-card-actions">
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

export default function OwnerAppointments() {
  const location = useLocation();
  const justBookedId = location.state?.justBookedId;
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [readingId, setReadingId] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelDialogError, setCancelDialogError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelToastVisible, setCancelToastVisible] = useState(false);
  const headingRefs = useRef(new Map());
  const openerRef = useRef(null);
  const cancelledAppointmentIdRef = useRef(null);
  const pageHeadingRef = useRef(null);
  const bookingToastShownRef = useRef(false);


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
    if (bookingToastShownRef.current || state !== 'ready' || !justBookedId || !appointments.some((appointment) => appointment.id === justBookedId)) return undefined;
    bookingToastShownRef.current = true;
    setToastVisible(true);
  }, [state, justBookedId, appointments]);

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timeout = window.setTimeout(() => setToastVisible(false), 5_000);
    return () => window.clearTimeout(timeout);
  }, [toastVisible]);

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

  useEffect(() => {
    if (state !== 'ready' || !justBookedId || !headingRefs.current.has(justBookedId)) return undefined;
    const frame = window.requestAnimationFrame(() => headingRefs.current.get(justBookedId)?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [state, justBookedId, appointments]);

  const upcoming = appointments.filter((appointment) => appointment.upcoming);
  const previous = appointments.filter((appointment) => !appointment.upcoming);
  const justBooked = appointments.find((appointment) => appointment.id === justBookedId);

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
      const saved = await apiFetch(`/api/owner/appointments/${appointment.id}/cancel`, { method: 'POST' });
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
    <section className="appointments-content" aria-labelledby="appointments-title">
      <h1 id="appointments-title" ref={pageHeadingRef} tabIndex={-1}>Mis citas</h1>
      {cancelError && <div className="form-alert" role="alert">{cancelError}</div>}
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
        {cancelToastVisible && <div className="appointment-toast success-alert" role="status">Cita cancelada.</div>}
        <section className="appointments-group" aria-labelledby="upcoming-title">
          <h2 id="upcoming-title">Próximas</h2>
          {upcoming.length
            ? <ul className="appointment-list">{upcoming.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} headingRefs={headingRefs} readingId={readingId} setReadingId={setReadingId} onCancel={openCancel} />)}</ul>
            : <p className="appointments-message">No tienes citas próximas.</p>}
        </section>
        <section className="appointments-group" aria-labelledby="previous-title">
          <h2 id="previous-title">Anteriores</h2>
          {previous.length
            ? <ul className="appointment-list">{previous.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} headingRefs={headingRefs} readingId={readingId} setReadingId={setReadingId} />)}</ul>
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
