import { useEffect, useState } from 'react';
import { speak, stopSpeaking, synthesisSupported, toSpeech } from './speech.js';

export default function ListenButton({ text, label = 'Escuchar', active: controlledActive, onStart, onStop }) {
  const [localActive, setLocalActive] = useState(false);
  const active = controlledActive ?? localActive;

  useEffect(() => () => stopSpeaking(), []);

  if (!synthesisSupported()) return null;

  function stop() {
    stopSpeaking();
    setLocalActive(false);
    onStop?.();
  }

  function toggle() {
    if (active) {
      stop();
      return;
    }
    setLocalActive(true);
    onStart?.();
    speak(toSpeech(text), { onEnd: () => { setLocalActive(false); onStop?.(); } });
  }

  return <button type="button" className="button-secondary listen-button" aria-pressed={active} onClick={toggle}>
    <span aria-hidden="true">{active ? '■' : '🔊'}</span> {active ? 'Detener' : label}
  </button>;
}