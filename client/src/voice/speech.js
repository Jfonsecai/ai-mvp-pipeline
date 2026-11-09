// COMP-014 Voice I/O (ARCHITECTURE_V4 §6.3; ADR-022). Browser Web Speech API only: no audio ever
// reaches VetCare; only the recognized text is sent to the API (CR-027). Built once and shared by
// COMP-UX-023 (voice input), COMP-UX-026 (voice replies) and COMP-UX-027 (listen).

const LANG = 'es-CO'; // NFR-008, TD-25
const PREFERENCE_KEY = 'vetcare.voiceReplies'; // BR-049: remembered on this device only

const Recognition = typeof window === 'undefined' ? undefined : (window.SpeechRecognition || window.webkitSpeechRecognition);

export const recognitionSupported = () => Boolean(Recognition);
export const synthesisSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

/**
 * One recognition session (one tap). Returns `{ promise, stop }`. The promise resolves with
 * `{ transcript }` or rejects with an Error whose `kind` is `not_allowed` (permission denied,
 * MSG-VOICE-DENIED) or `no_speech` (nothing recognized or any other failure, MSG-VOICE-NOHEAR).
 */
export function listenOnce() {
  if (!Recognition) throw new Error('Voice input is not supported');
  const recognition = new Recognition();
  recognition.lang = LANG;
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  const promise = new Promise((resolve, reject) => {
    let transcript = '';
    let failure = null;
    recognition.onresult = (event) => {
      transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(' ').trim();
    };
    recognition.onerror = (event) => {
      failure = event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'not_allowed' : 'no_speech';
    };
    recognition.onend = () => {
      if (transcript) resolve({ transcript });
      else reject(Object.assign(new Error(failure ?? 'no_speech'), { kind: failure ?? 'no_speech' }));
    };
  });
  recognition.start();
  return { promise, stop: () => recognition.stop() };
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === LANG)
    ?? voices.find((voice) => voice.lang?.toLowerCase().startsWith('es'))
    ?? null; // P05-ASM-021: any Spanish voice, else the browser default
}

/** Speaks `text` (cancelling any current reading). Calls `onEnd` when it finishes or is stopped. */
export function speak(text, { onEnd } = {}) {
  if (!synthesisSupported() || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = LANG;
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (synthesisSupported()) window.speechSynthesis.cancel();
}

/** Voice replies are on by default (AC-152) and the choice is remembered on this device (BR-049). */
export function getVoiceReplies() {
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setVoiceReplies(on) {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, on ? 'on' : 'off');
  } catch {
    // storage unavailable: the choice lasts for this screen only
  }
}

/** Formats prices for speech: "$ 45.000" is read as "45.000 pesos" (P04-ASM-032). */
export function toSpeech(text) {
  return text.replace(/\$\s?([\d.]+)/g, '$1 pesos');
}
