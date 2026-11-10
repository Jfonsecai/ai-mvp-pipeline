import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const fake = `
  window.__voice = { byLang: {} };
  class FakeRecognition {
    start() { const lang = this.lang; setTimeout(() => {
      const r = window.__voice.byLang[lang] ?? window.__voice.byLang['*'];
      if (r?.error) this.onerror?.({ error: r.error });
      else if (r?.transcript) this.onresult?.({ results: [[{ transcript: r.transcript }]] });
      this.onend?.();
    }, 100); }
    stop() {}
  }
  window.SpeechRecognition = FakeRecognition; window.webkitSpeechRecognition = FakeRecognition;`;
const b = await chromium.launch(); const ctx = await b.newContext();
await ctx.addCookies([{ name: 'vetcare_session', value: process.argv[2], domain: 'localhost', path: '/' }]);
await ctx.addInitScript(fake);
const p = await ctx.newPage(); const warnings = []; p.on('console', (m) => { if (m.text().includes('[VetCare voz]')) warnings.push(m.text()); });
await p.goto('http://localhost:5173/owner/home'); await p.waitForSelector('#search-title');
async function run(label, byLang) {
  await p.evaluate((x) => { window.__voice.byLang = x; }, byLang);
  await p.click('button[aria-label="Buscar por voz"]'); await p.waitForTimeout(700);
  const alert = await p.locator('.info-alert, .warning-alert').allTextContents();
  console.log(JSON.stringify([label, alert[0] ?? null, await p.inputValue('#offering-query')]));
}
await run('network', { '*': { error: 'network' } });
await run('audio-capture', { '*': { error: 'audio-capture' } });
await run('service-not-allowed', { '*': { error: 'service-not-allowed' } });
await run('not-allowed', { '*': { error: 'not-allowed' } });
await run('no-speech', { '*': { error: 'no-speech' } });
await run('es-CO unsupported → es-ES works', { 'es-CO': { error: 'language-not-supported' }, 'es-ES': { transcript: 'busco baño para mi gato' } });
console.log(JSON.stringify(['console', warnings]));
await b.close();
