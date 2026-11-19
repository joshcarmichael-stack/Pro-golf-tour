import { chromium } from "/tmp/pw/node_modules/playwright/index.mjs";
import fs from "fs";
const BASE = process.env.BASE_URL || "http://127.0.0.1:8765/index.html";
const TAG = process.env.TAG || "career";
const MISSING = process.env.MISSING === "1";
const VIEW = process.env.VIEW || "mobile";
const R = { tag: TAG, errs: [], steps: [] };
const b = await chromium.launch();
const ctx = await b.newContext(VIEW === "desktop" ? { viewport: { width: 1366, height: 900 } } : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage(); page.setDefaultTimeout(12000);
page.on("pageerror", (e) => R.errs.push("PAGEERROR " + e.message)); page.on("console", (m) => { if (m.type() === "error") R.errs.push(m.text()); });
page.on("dialog", (d) => d.accept());
await page.addInitScript(() => { try { localStorage.setItem("sunday-pins-wheel-mode", "watch"); localStorage.setItem("sunday-pins-wheel-fast", "1");
  localStorage.setItem("sunday-pins-beta-tips-seen", JSON.stringify({ "hole-choice": 1, "challenge-brief": 1, "how-week-works": 1, hub: 1, range: 1 })); } catch (e) {} });
const dismiss = async () => { for (let i = 0; i < 4; i++) { const t = page.getByText(/^GOT IT$/i); if (await t.count()) { try { await t.first().click({ timeout: 400, force: true }); } catch (e) {} } } };
const stripNames = async () => {
  {
    // strip the current event's name from the save, then reload so the game runs with a nameless event
    const info = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter((k) => /golf-career-sim-v4/.test(k));
      const out = [];
      for (const k of keys) {
        let v = localStorage.getItem(k); let o; try { o = JSON.parse(v); } catch (e) { out.push(k + ":notjson"); continue; }
        let n = 0;
        const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === "object") { if (typeof x.e === "string" && (x.type || x.c || x.purse != null)) { delete x.e; n++; } Object.values(x).forEach(walk); } };
        walk(o); localStorage.setItem(k, JSON.stringify(o)); out.push(k + ":stripped " + n);
      }
      return out;
    });
    R.strip = info;
    await page.reload(); await page.waitForTimeout(1000); await dismiss();
    const cont = page.locator("button").filter({ hasText: /CONTINUE|RESUME/i });
    if (await cont.count()) await cont.first().click({ force: true });
    await page.waitForTimeout(600); await dismiss();
  }
};
const injectPlayoff = async () => page.evaluate(() => {
  const out = [];
  for (const k of Object.keys(localStorage).filter((k) => /golf-career-sim-v4/.test(k))) {
    let o; try { o = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
    const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === "object") {
      if (x.finishers && Array.isArray(x.finishers) && x.finishers.length > 2) { const me = x.finishers.find((r) => r.isYou); const names = [x.finishers[0].name, me ? me.name : x.finishers[1].name]; x.playoff = { winner: x.finishers[0].name, holesPlayed: 2, names }; out.push(k + ":playoff " + names.join("/")); }
      Object.values(x).forEach(walk); } };
    walk(o); localStorage.setItem(k, JSON.stringify(o));
  }
  return out;
});
const btn = (re) => page.locator("button").filter({ hasText: re }).first();
try {
  await page.goto(BASE, { waitUntil: "domcontentloaded" }); await page.waitForTimeout(800);
  await page.locator("div").filter({ hasText: /Tour Career/ }).locator("button").filter({ hasText: /START/ }).first().click({ force: true });
  await page.waitForTimeout(250);
  await page.locator("input").first().fill("Crash Tester");
  await page.locator("select").first().selectOption({ label: "USA" });
  await btn(/CHOOSE A TYPE/).click({ force: true }); await page.waitForTimeout(250);
  await btn(/Bomber/i).click({ force: true }); await page.waitForTimeout(400);
  await btn(/Turn Pro/i).click({ force: true }); await page.waitForTimeout(400);
  await page.locator("button").first().click({ force: true }); await page.waitForTimeout(400);
  const uns = page.locator("button").filter({ hasText: /unsponsored/i }); if (await uns.count()) await uns.first().click({ force: true });
  await page.waitForTimeout(500); await dismiss();
  R.steps.push("hub");
  if (process.env.BOOST === "1") {
    R.boost = await page.evaluate(() => { const out = [];
      for (const k of Object.keys(localStorage).filter((k) => /golf-career-sim-v4/.test(k))) { let o; try { o = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
        let n = 0; const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === "object") { if (x.attrs && x.name === "Crash Tester") { for (const a in x.attrs) if (typeof x.attrs[a] === "number") { x.attrs[a] = 99; n++; } } Object.values(x).forEach(walk); } };
        walk(o); localStorage.setItem(k, JSON.stringify(o)); out.push(k + ":" + n); } return out; });
    await page.reload(); await page.waitForTimeout(1000); await dismiss();
    const cont = page.locator("button").filter({ hasText: /CONTINUE|RESUME/i }); if (await cont.count()) await cont.first().click({ force: true });
    await page.waitForTimeout(600); await dismiss();
  }
  await page.screenshot({ path: `/tmp/${TAG}-hub.png` });
  await btn(/HIT THE RANGE/i).click({ force: true }); await page.waitForTimeout(400);
  await btn(/DRIVING ACCURACY/i).click({ force: true }); await page.waitForTimeout(400);
  // Prefer simming the whole event
  for (let g = 0; g < 40; g++) {
    await dismiss();
    const body = await page.locator("body").innerText();
    if (/YOU FINISHED|YOU ARE THE CHAMPION|MISSED CUT/i.test(body)) break;
    const sim = page.locator("button").filter({ hasText: /SIM TO THE FINISH/i });
    if (await sim.count() && MISSING && !R.stripped) { R.stripped = true; await stripNames(); await page.screenshot({ path: `/tmp/${TAG}-afterstrip.png` }); R.afterStrip = (await page.locator("body").innerText()).slice(0, 300); continue; }
    if (await sim.count()) { await sim.first().click({ force: true }); await page.waitForTimeout(800); continue; }
    const simR = page.locator("button").filter({ hasText: /SIM (THE )?ROUND|SIM ROUND|SIM ALL/i });
    if (await simR.count()) { await simR.first().click({ force: true }); await page.waitForTimeout(800); continue; }
    const pr = page.locator("button").filter({ hasText: /PLAY ROUND 1/i });
    if (await pr.count()) { await pr.first().click({ force: true }); await page.waitForTimeout(800);
      // find a sim option on hole screen
      const s2 = page.locator("button").filter({ hasText: /SIM|AUTO/i }); R.holeButtons = await page.locator("button").allInnerTexts(); continue; }
    const auto = page.locator("button").filter({ hasText: /SIM THE REST|SIM REST|FINISH THE ROUND|AUTO/i });
    if (await auto.count()) { await auto.first().click({ force: true }); await page.waitForTimeout(800); continue; }
    const c = page.locator("button").filter({ hasText: /^CONTINUE|NEXT|LEADERBOARD/i });
    if (await c.count()) { await c.first().click({ force: true }); await page.waitForTimeout(600); continue; }
    R.stuck = (await page.locator("button").allInnerTexts()).slice(0, 20); await page.waitForTimeout(600);
  }
  const body = await page.locator("body").innerText();
  R.final = body.slice(0, 500);
  R.resultsShown = /YOU FINISHED|YOU ARE THE CHAMPION|MISSED CUT/i.test(body);
  await page.screenshot({ path: `/workspace/invitational/shots-final/${TAG}-event-final.png` });
  if (R.resultsShown && process.env.PLAYOFF === "1") { R.inject = await injectPlayoff(); await page.reload(); await page.waitForTimeout(1200); await dismiss();
    const cont = page.locator("button").filter({ hasText: /CONTINUE|RESUME/i }); if (await cont.count()) { await cont.first().click({ force: true }); await page.waitForTimeout(800); }
    R.afterPlayoffReload = (await page.locator("body").innerText()).slice(0, 400); await page.screenshot({ path: `/workspace/invitational/shots-final/${TAG}-playoff.png` }); }
  if (R.resultsShown && /YOU FINISHED|CHAMPION|MISSED CUT/i.test(await page.locator("body").innerText())) { await btn(/^CONTINUE$/).click({ force: true }); await page.waitForTimeout(800); R.afterContinue = (await page.locator("body").innerText()).slice(0, 200); }
} catch (e) { R.fatal = String(e).slice(0, 500); try { R.lastButtons = (await page.locator("button").allInnerTexts()).slice(0, 20); } catch (x) {} }
fs.writeFileSync(`/workspace/invitational/qa-${TAG}.json`, JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 1).slice(0, 2500)); await b.close();
