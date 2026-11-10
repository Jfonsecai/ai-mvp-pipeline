// COMP-UX-023 Voice Input Button (UX_SPEC_V3 §5). Not rendered when the browser has no voice input
// (NFR-006, AC-122). Calls onTranscript with the recognized text, or onError with `not_allowed` /
// `no_speech`. Stops listening when the screen unmounts.
import { useEffect, useRef, useState } from 'react';
import { listenOnce, recognitionSupported } from './speech.js';

export default function VoiceInputButton({ label, disabled = false, onTranscript, onError }) {
  const [state, setState] = useState('idle'); // idle | listening
  const session = useRef(null);

  useEffect(() => () => session.current?.stop(), []);

  if (!recognitionSupported()) return null;

  async function toggle() {
    if (state === 'listening') {
      session.current?.stop();
      return;
    }
    let current;
    try {
      current = listenOnce();
    } catch {
      onError?.('no_speech');
      return;
    }
    session.current = current;
    setState('listening');
    try {
      const { transcript } = await current.promise;
      setState('idle');
      onTranscript(transcript);
    } catch (error) {
      setState('idle');
      onError?.(error.kind ?? 'no_speech');
    } finally {
      session.current = null;
    }
  }

  const listening = state === 'listening';
  return <span className="voice-input">
    <button
      type="button"
      className={`voice-button${listening ? ' voice-button-listening' : ''}`}
      aria-label={label}
      aria-pressed={listening}
      title="Hablar"
      disabled={disabled && !listening}
      onClick={() => void toggle()}
    >
      <span aria-hidden="true">{listening ? '■' : '🎤'}</span>
    </button>
    <span className="voice-status" role="status" aria-live="polite">
      {listening ? 'Escuchando… toca para detener' : ''}
    </span>
  </span>;
}
