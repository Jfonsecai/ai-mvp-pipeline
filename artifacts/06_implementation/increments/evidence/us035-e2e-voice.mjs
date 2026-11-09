import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const token = process.argv[2] /* owner session token of a local demo account */;
const out = process.argv[3];
const fake = `
  /* no voice support variant handled separately */
  window.__voice = { transcript: '', error: null };
  class FakeRecognition {
    start() { setTimeout(() => {
      if (window.__voice.error) { this.onerror?.({ error: window.__voice.error }); }
      else if (window.__voice.transcript) { this.onresult?.({ results: [[{ transcript: window.__voice.transcript }]] }); }
      this.onend?.();
    }, 300); }
    stop() {}
  }
  window.webkitSpeechRecognition = FakeRecognition; window.SpeechRecognition = FakeRecognition;`;
const browser = await chromium.launch();
const results = [];
async function page(withVoice) {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addCookies([{ name: 'vetcare_session', value: token, domain: 'localhost', path: '/' }]);
  await ctx.addInitScript(withVoice ? fake : 'delete window.SpeechRecognition; delete window.webkitSpeechRecognition; window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined;');
  const p = await ctx.newPage();
  await p.goto('http://localhost:5173/owner/home');
  await p.waitForSelector('#search-title');
  return p;
}
async function say(p, transcript, error = null) {
  await p.evaluate(([t, e]) => { window.__voice.transcript = t; window.__voice.error = e; }, [transcript, error]);
  await p.click('button[aria-label="Buscar por voz"]');
  await p.waitForTimeout(900);
}
const p = await page(true);
await say(p, 'busco vacunación para mi perro');
results.push(['AC-115/117', await p.inputValue('#offering-query'), await p.isChecked('input[value="dog"]'), await p.textContent('.voice-heard'), await p.textContent('.search-summary')]);
await p.screenshot({ path: `${out}/us035-voice-search.png`, fullPage: true });
await say(p, 'alimento para gato adulto');
results.push(['AC-159', await p.inputValue('#offering-query'), await p.isChecked('input[value="cat"]'), await p.textContent('.search-summary')]);
await say(p, 'para mi gato');
results.push(['AC-120', await p.textContent('.info-alert')]);
await say(p, '', 'no-speech');
results.push(['AC-121', await p.textContent('.info-alert')]);
await say(p, '', 'not-allowed');
results.push(['AC-123', await p.textContent('.warning-alert')]);
await p.screenshot({ path: `${out}/us035-voice-denied.png`, fullPage: true });
// AC-118: edit the voice-filled text and search again by typing
await p.fill('#offering-query', 'baño');
await p.click('button.search-submit');
await p.waitForTimeout(600);
results.push(['AC-118', await p.textContent('.search-summary')]);
const q = await page(false);
results.push(['AC-122 no mic without voice support', await q.locator('button[aria-label="Buscar por voz"]').count()]);
// Assistant hand-off ?q=&species=
const r = await (await browser.newContext()).newPage();
await r.context().addCookies([{ name: 'vetcare_session', value: token, domain: 'localhost', path: '/' }]);
await r.goto('http://localhost:5173/owner/home?q=vacunaci%C3%B3n&species=cat');
await r.waitForSelector('.search-summary');
results.push(['?q= hand-off', await r.inputValue('#offering-query'), await r.isChecked('input[value="cat"]'), await r.textContent('.search-summary')]);
for (const row of results) console.log(JSON.stringify(row));
await browser.close();
