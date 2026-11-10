// US-036 to US-041 browser walk-through (SCR-UX-018) with simulated speech recognition and synthesis.
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const token = process.argv[2]; // owner session token of a local demo account const out = process.argv[3];
const voice = `
  window.__voice = { transcript: '', error: null }; window.__spoken = []; window.__cancels = 0;
  class FakeRecognition { start() { setTimeout(() => {
    if (window.__voice.error) this.onerror?.({ error: window.__voice.error });
    else this.onresult?.({ results: [[{ transcript: window.__voice.transcript }]] });
    this.onend?.(); }, 200); } stop() {} }
  window.SpeechRecognition = FakeRecognition; window.webkitSpeechRecognition = FakeRecognition;
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    speak(u) { window.__spoken.push({ text: u.text, lang: u.lang }); setTimeout(() => u.onend?.(), 1500); },
    cancel() { window.__cancels += 1; }, getVoices() { return []; } } });`;
const noVoice = `window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined }); window.SpeechSynthesisUtterance = undefined;`;
const b = await chromium.launch();
async function open(script) {
  const ctx = await b.newContext({ viewport: { width: 1000, height: 1100 } });
  await ctx.addCookies([{ name: 'vetcare_session', value: token, domain: 'localhost', path: '/' }]);
  await ctx.addInitScript(script);
  const p = await ctx.newPage();
  await p.goto('http://localhost:5173/owner/assistant'); await p.waitForSelector('#assistant-title');
  return p;
}
const rows = [];
const lastAnswer = (p) => p.locator('.chat-assistant').last();
async function type(p, q) { await p.fill('#assistant-question', q); await p.click('button:has-text("Enviar")'); await p.waitForTimeout(700); }
const p = await open(voice);
rows.push(['AC-124/148 greeting + controls', (await p.locator('.chat-assistant').first().textContent()).slice(0, 40), await p.locator('button[aria-label="Preguntar por voz"]').count(), await p.locator('button:has-text("Voz activada")').count()]);
await type(p, '¿Quién ofrece vacunación para perros?');
rows.push(['AC-125/136 typed offering', await lastAnswer(p).locator('p').first().textContent(), await lastAnswer(p).locator('.chat-items a').first().textContent()]);
rows.push(['AC-149 spoken + reading state', await p.evaluate(() => window.__spoken.at(-1)), await p.locator('.chat-reading').count(), await p.locator('button:has-text("Detener lectura")').count()]);
await p.click('button:has-text("Detener lectura")');
rows.push(['AC-150 stop keeps text', await p.locator('button:has-text("Detener lectura")').count(), await lastAnswer(p).locator('p').first().isVisible()]);
await p.evaluate(() => { window.__voice.transcript = '¿Qué veterinarias hay?'; });
await p.click('button[aria-label="Preguntar por voz"]'); await p.waitForTimeout(900);
rows.push(['AC-126/130 voice question', await p.locator('.chat-owner').last().textContent(), await lastAnswer(p).locator('p').first().textContent()]);
await type(p, '¿Cuándo es mi próxima cita?');
rows.push(['AC-141 next appointment', await lastAnswer(p).locator('p').first().textContent()]);
await type(p, '¿Cuál es el horario de Ana Pérez?');
rows.push(['AC-132 hours', await lastAnswer(p).locator('p').first().textContent()]);
await type(p, 'cancela mi cita');
rows.push(['AC-129 action', await lastAnswer(p).locator('p').first().textContent(), await lastAnswer(p).locator('.chat-link').textContent()]);
await p.click('button:has-text("Voz activada")');
const spokenBefore = await p.evaluate(() => window.__spoken.length);
await type(p, 'ayuda');
rows.push(['AC-151 muted → no speech; AC-145 help', (await p.evaluate(() => window.__spoken.length)) - spokenBefore, (await lastAnswer(p).locator('p').first().textContent()).slice(0, 40)]);
await type(p, 'mi perro vomita');
rows.push(['AC-146/147 fallback', (await lastAnswer(p).locator('p').first().textContent()).slice(0, 60)]);
await p.screenshot({ path: `${out}/us036-assistant.png`, fullPage: true });
await p.click('a:has-text("Buscar")'); await p.waitForTimeout(300); await p.click('a:has-text("Asistente")'); await p.waitForTimeout(400);
rows.push(['AC-127 leaving ends conversation', await p.locator('.chat-message').count(), await p.locator('button:has-text("Voz desactivada")').count()]);
const q = await open(noVoice);
rows.push(['AC-154/EDGE-033 no voice support', await q.locator('button[aria-label="Preguntar por voz"]').count(), await q.locator('.voice-reply-controls').count()]);
for (const row of rows) console.log(JSON.stringify(row));
await b.close();
