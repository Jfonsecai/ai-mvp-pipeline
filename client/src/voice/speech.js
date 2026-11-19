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
 * `{ transcript }` or rejects with an Error whose `kind` is one of:
 * - `not_allowed`: microphone permission denied (MSG-VOICE-DENIED, AC-123);
 * - `no_microphone`: no audio input device (`audio-capture`);
 * - `unavailable`: the browser's speech service cannot be used (`network`, `service-not-allowed`,
 *   unsupported language) — typical of Chromium-based browsers without Google's speech service;
 * - `no_speech`: nothing was recognized (MSG-VOICE-NOHEAR, AC-121).
 * The browser error code is written to the console as `[VetCare voz]` to diagnose real devices.
 * If `es-CO` is not supported, the session is retried once with `es-ES` (P05-ASM-021).
 */
const ERROR_KINDS = {
  'not-allowed': 'not_allowed',
  'audio-capture': 'no_microphone',
  network: 'unavailable',
  'service-not-allowed': 'unavailable',
  'language-not-supported': 'unavailable',
  'bad-grammar': 'unavailable',
  'no-speech': 'no_speech',
  aborted: 'no_speech',
};

export function listenOnce() {
  if (!Recognition) throw new Error('Voice input is not supported');
  let current = null;
  let stopped = false;

  const attempt = (lang) => new Promise((resolve, reject) => {
    const recognition = new Recognition();
    current = recognition;
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    let transcript = '';
    let errorCode = null;
    recognition.onresult = (event) => {
      transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(' ').trim();
    };
    recognition.onerror = (event) => {
      errorCode = event.error;
      console.warn('[VetCare voz] error del reconocimiento:', event.error, `(${lang})`);
    };
    recognition.onend = () => {
      if (transcript) return resolve({ transcript });
      if (errorCode === 'language-not-supported' && lang === LANG && !stopped) {
        return attempt('es-ES').then(resolve, reject);
      }
      const kind = ERROR_KINDS[errorCode] ?? 'no_speech';
      reject(Object.assign(new Error(kind), { kind, code: errorCode }));
    };
    try {
      recognition.start();
    } catch (error) {
      console.warn('[VetCare voz] no se pudo iniciar el reconocimiento:', error?.name ?? error);
      reject(Object.assign(new Error('unavailable'), { kind: 'unavailable', code: error?.name }));
    }
  });

  const promise = attempt(LANG);
  return { promise, stop: () => { stopped = true; current?.stop(); } };
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === LANG)
    ?? voices.find((voice) => voice.lang?.toLowerCase().startsWith('es'))
    ?? null; // P05-ASM-021: any Spanish voice, else the browser default
}

let speechRun = 0;
let punctuationTimer;

function punctuationPause(segment) {
  const ending = segment.trim().slice(-1);
  if (ending === ',') return 170;
  if (ending === ';' || ending === ':') return 250;
  if ('.?!…。'.includes(ending)) return 360;
  return 0;
}

/** Speaks text and exposes the natural punctuation gaps to screens with voice feedback. */
export function speak(text, { onStart, onPause, onEnd, onError } = {}) {
  if (!synthesisSupported() || !text) return;
  const run = ++speechRun;
  window.clearTimeout(punctuationTimer);
  window.speechSynthesis.cancel();
  const segments = onPause
    ? (text.match(/[^,.;:!?]+[,.;:!?]?/g) ?? [text]).map((part) => part.trim()).filter(Boolean)
    : [text];
  let index = 0;
  let finished = false;

  const finish = (error) => {
    if (run !== speechRun || finished) return;
    finished = true;
    window.clearTimeout(punctuationTimer);
    if (error) onError?.(error);
    onEnd?.();
  };

  const playNext = () => {
    if (run !== speechRun || finished) return;
    if (index >= segments.length) {
      finish();
      return;
    }
    const segment = segments[index++];
    const utterance = new window.SpeechSynthesisUtterance(segment);
    utterance.lang = LANG;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => { if (run === speechRun) onStart?.(); };
    utterance.onend = () => {
      if (run !== speechRun) return;
      const pause = punctuationPause(segment);
      if (index < segments.length && pause) {
        onPause?.();
        punctuationTimer = window.setTimeout(playNext, pause);
      } else playNext();
    };
    utterance.onerror = (event) => finish(event);
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      finish(error);
    }
  };

  playNext();
}

export function stopSpeaking() {
  speechRun += 1;
  window.clearTimeout(punctuationTimer);
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

/** Formats symbols and prices for Spanish speech without changing the displayed text. */
export function toSpeech(text) {
  return text
    .replace(/#/g, 'numeral')
    .replace(/\$\s?([\d.]+)/g, '$1 pesos');
}
