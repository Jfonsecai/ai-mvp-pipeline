// SCR-UX-018 Asistente (UX_SPEC_V3 v3.1; US-036 to US-041). Questions by text or voice (COMP-014,
// COMP-UX-023/025), answers from IF-042 shown as a conversation (COMP-UX-024) and read aloud when
// voice replies are on (COMP-UX-026, FR-049). The conversation lives only in this screen: leaving,
// reloading or signing out ends it (AC-127, BR-050).
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import VoiceInputButton from '../voice/VoiceInputButton.jsx';
import { getVoiceReplies, setVoiceReplies, speak, stopSpeaking, synthesisSupported, toSpeech } from '../voice/speech.js';

const MAX_QUESTION = 200;
const GREETING = 'Hola, soy el asistente de VetCare. Puedes preguntarme, por ejemplo: «¿Qué veterinarias hay?», «¿Quién ofrece vacunación para gatos?», «¿Cuánto cuesta una consulta?», «¿Cuál es el horario de [veterinaria]?» o «¿Cuándo es mi próxima cita?».';
const MSG_NET = 'No pudimos completar la acción. Revisa tu conexión e inténtalo de nuevo.';
const VOICE_ERRORS = {
  not_allowed: 'No tenemos permiso para usar el micrófono. Puedes escribir, o permitir el micrófono en la configuración del navegador.',
  no_microphone: 'No encontramos un micrófono. Conecta uno o escribe tu pregunta.',
  unavailable: 'El reconocimiento de voz no está disponible en este navegador. Prueba en Google Chrome o escribe tu pregunta.',
  no_speech: 'No te escuchamos. Intenta de nuevo o escribe tu pregunta.',
};
const LINKS = {
  search: { to: '/owner/home', label: 'Ir a Buscar' },
  owner_appointments: { to: '/owner/appointments', label: 'Ir a Mis citas' },
};

function itemPath(target) {
  return target.screen === 'provider_profile' ? `/owner/providers/${target.providerId}` : '/owner/appointments';
}

/** The text read aloud: the sentence and the item labels, without link labels (UX_SPEC_V3 §8). */
export function spokenText(answer) {
  const rows = answer.items.map((item) => item.label).join('. ');
  if (!rows) return toSpeech(answer.text);
  return toSpeech(`${answer.text}${answer.text.endsWith(':') ? ' ' : '. '}${rows}.`);
}

function AssistantMessage({ message, reading }) {
  const { answer } = message;
  return <li className="chat-message chat-assistant">
    <span className="visually-hidden">Asistente: </span>
    <p>{answer.text}</p>
    {answer.items.length > 0 && <ul className="chat-items">
      {answer.items.map((item, index) => <li key={index}><Link to={itemPath(item.target)}>{item.label}</Link></li>)}
    </ul>}
    {answer.searchLink && <Link className="chat-link" to={`/owner/home?q=${encodeURIComponent(answer.searchLink.q)}&species=${answer.searchLink.species}`}>Ver todos en Buscar</Link>}
    {answer.linkTo && LINKS[answer.linkTo] && <Link className="chat-link" to={LINKS[answer.linkTo].to}>{LINKS[answer.linkTo].label}</Link>}
    {reading && <p className="chat-reading" aria-hidden="true">🔊 Leyendo…</p>}
  </li>;
}

export default function OwnerAssistant() {
  const [messages, setMessages] = useState([{ id: 0, role: 'assistant', answer: { text: GREETING, items: [] } }]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { question, viaVoice } to retry
  const [voiceAlert, setVoiceAlert] = useState('');
  const [voiceOn, setVoiceOn] = useState(getVoiceReplies);
  const [readingId, setReadingId] = useState(null);
  const nextId = useRef(1);
  const endRef = useRef(null);
  const canSpeak = synthesisSupported();

  // Leaving the screen stops any reading (AC-127, UX_SPEC_V3 §5 COMP-UX-026).
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'end' }); }, [messages, loading]);

  function read(message) {
    if (!canSpeak || !voiceOn) return;
    setReadingId(message.id);
    speak(spokenText(message.answer), { onEnd: () => setReadingId((current) => (current === message.id ? null : current)) });
  }

  async function ask(question, viaVoice = false) {
    const clean = question.trim().slice(0, MAX_QUESTION); // A5-VAL-004: long transcripts are cut
    if (!clean || loading) return;
    stopSpeaking(); // a new question stops the current reading (AC-153)
    setReadingId(null);
    setVoiceAlert('');
    setError(null);
    setMessages((list) => [...list, { id: nextId.current++, role: 'owner', text: clean, viaVoice }]);
    setText('');
    setLoading(true);
    try {
      const answer = await apiFetch('/api/assistant/messages', { method: 'POST', body: { text: clean, viaVoice } });
      const message = { id: nextId.current++, role: 'assistant', answer };
      setMessages((list) => [...list, message]);
      read(message); // AC-149
    } catch {
      setError({ question: clean, viaVoice });
    } finally {
      setLoading(false);
    }
  }

  function retry() {
    const pending = error;
    setMessages((list) => list.slice(0, -1)); // the failed question is sent again
    setError(null);
    void ask(pending.question, pending.viaVoice);
  }

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    setVoiceReplies(next); // BR-049: remembered on this device
    if (!next) {
      stopSpeaking();
      setReadingId(null);
    }
  }

  function submit(event) {
    event.preventDefault();
    void ask(text);
  }

  return <main className="page-shell assistant-page">
    <section className="assistant-card" aria-labelledby="assistant-title">
      <div className="assistant-header">
        <div>
          <h1 id="assistant-title">Asistente</h1>
          <p className="search-subtitle">Pregúntame por veterinarias, servicios, precios, horarios o tus citas.</p>
        </div>
        {canSpeak && <div className="voice-reply-controls">
          <button type="button" className="button-secondary" aria-pressed={voiceOn} onClick={toggleVoice}>
            <span aria-hidden="true">{voiceOn ? '🔊 ' : '🔇 '}</span>{voiceOn ? 'Voz activada' : 'Voz desactivada'}
          </button>
          {readingId !== null && <button type="button" className="button-secondary" onClick={() => { stopSpeaking(); setReadingId(null); }}>Detener lectura</button>}
        </div>}
      </div>

      <ol className="chat-log" role="log" aria-live="polite" aria-label="Conversación con el asistente">
        {messages.map((message) => (message.role === 'owner'
          ? <li key={message.id} className="chat-message chat-owner">
              <span className="visually-hidden">Tú: </span>
              <p>{message.text}</p>
              {message.viaVoice && <p className="chat-meta">Por voz</p>}
            </li>
          : <AssistantMessage key={message.id} message={message} reading={readingId === message.id} />))}
        {loading && <li className="chat-message chat-assistant" role="status">Cargando…</li>}
      </ol>
      {error && <div className="form-alert" role="alert">
        {MSG_NET}{' '}
        <button className="link-button" type="button" onClick={retry}>Reintentar</button>
      </div>}
      <div ref={endRef} />

      {voiceAlert && <div className={voiceAlert === VOICE_ERRORS.no_speech ? 'info-alert' : 'warning-alert'} role="status">{voiceAlert}</div>}
      <form className="assistant-composer" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="assistant-question">Pregunta para el asistente</label>
        <input
          id="assistant-question"
          type="text"
          value={text}
          maxLength={MAX_QUESTION}
          autoComplete="off"
          placeholder="Escribe tu pregunta"
          onChange={(event) => setText(event.target.value)}
        />
        <VoiceInputButton
          label="Preguntar por voz"
          disabled={loading}
          onTranscript={(transcript) => void ask(transcript, true)}
          onError={(kind) => setVoiceAlert(VOICE_ERRORS[kind] ?? VOICE_ERRORS.no_speech)}
        />
        <button className="primary-button" type="submit" disabled={loading || !text.trim()}>Enviar</button>
      </form>
    </section>
  </main>;
}
