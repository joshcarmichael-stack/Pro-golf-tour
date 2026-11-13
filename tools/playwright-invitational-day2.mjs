// Full Invitational QA run incl. Day 2. Uses the test-only switch (localStorage "sunday-pins-inv-test").
// env: BASE_URL, VIEW=mobile|desktop, INV_TEST='{"day1":"win","day2":"win","skin":"roll"}', TAG=name, SHOTS_DIR
import { chromium } from "/tmp/pw/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";
const BASE = process.env.BASE_URL || "http://127.0.0.1:8765/index.html";
const VIEW = process.env.VIEW || "mobile";
const TAG = process.env.TAG || VIEW;
const TEST = process.env.INV_TEST || "";
const SHOTS = process.env.SHOTS_DIR || "/workspace/invitational/shots-final";
fs.mkdirSync(SHOTS, { recursive: true });
const R = { tag: TAG, base: BASE, view: VIEW, test: TEST, ok: true, steps: [], consoleErrors: [], shots: [], facts: {} };
const shot = async (page, name) => { const fp = path.join(SHOTS, TAG + "-" + name + ".png"); await page.screenshot({ path: fp }); R.shots.push(fp); };
const body = (page) => page.locator("body").innerText();
const has = async (page, re) => (await page.getByText(re).count()) > 0;
async function click(page, re, t = 10000) { const l = page.getByText(re).first(); await l.waitFor({ timeout: t }); await l.click({ force: true }); }
async function skipWheel(page, n = 4) { for (let i = 0; i < n; i++) { try { await page.locator("div").filter({ hasText: /Spinning|tap to skip|WHO PICKS|ELITE|SCRAMBLE ·|ALT SHOT ·|WHERE DO YOU LAND/i }).first().click({ timeout: 600, force: true }); } catch (e) {} await page.waitForTimeout(250); } }
async function playChip(page, doneRe, name) {
  for (let g = 0; g < 80; g++) {
    await page.waitForTimeout(350);
    const b = await body(page);
    if (doneRe.test(b)) return true;
    if (/Dead level — re-chip|Tie at .* re-chip/i.test(b) && !R.facts[name + "Rechip"]) { R.facts[name + "Rechip"] = true; await shot(page, name + "-rechip"); }
    if (/RE-CHIP$/m.test(b) && await has(page, /^RE-CHIP$/)) { await click(page, /^RE-CHIP$/); continue; }
    if (/SET AIM|POWER METER/i.test(b)) {
      const svg = page.locator("svg").first();
      if (await svg.count()) { const bx = await svg.boundingBox(); if (bx) await page.mouse.click(bx.x + bx.width * 0.5, bx.y + bx.height * 0.5); }
      await click(page, /SET AIM|POWER METER/i).catch(() => {});
    }
    if (await has(page, /TAP — SET POWER/i)) { await click(page, /TAP — SET POWER/i).catch(() => {}); await page.waitForTimeout(200); }
    if (await has(page, /TAP — STRIKE/i)) { await click(page, /TAP — STRIKE/i).catch(() => {}); await page.waitForTimeout(1200); if (!R.facts[name + "Fly"]) { R.facts[name + "Fly"] = 1; await shot(page, name + "-fly"); } }
  }
  return false;
}
let page;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(VIEW === "desktop" ? { viewport: { width: 1366, height: 900 } } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page = await ctx.newPage(); page.setDefaultTimeout(15000);
  page.on("pageerror", (e) => { R.consoleErrors.push("PAGEERROR " + e.message); R.ok = false; });
  page.on("console", (m) => { if (m.type() === "error") R.consoleErrors.push(m.text()); });
  page.on("dialog", (d) => d.accept());
  await page.addInitScript((T) => { try {
    localStorage.setItem("sunday-pins-wheel-mode", "watch"); localStorage.setItem("sunday-pins-wheel-fast", "1");
    localStorage.setItem("sunday-pins-beta-tips-seen", JSON.stringify({ hub: 1, train: 1 }));
    if (!sessionStorage.getItem("qa-init")) { sessionStorage.setItem("qa-init", "1"); localStorage.removeItem("sunday-pins-invitational-v1"); if (T) localStorage.setItem("sunday-pins-inv-test", T); else localStorage.removeItem("sunday-pins-inv-test"); }
  } catch (e) {} }, TEST);
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1200);
  for (let i = 0; i < 3; i++) if (await has(page, /^GOT IT$/i)) await click(page, /^GOT IT$/i).catch(() => {});
  await click(page, /ENTER THE INVITATIONAL/i); await page.waitForTimeout(300);
  await click(page, /START INVITATIONAL/i);
  await page.locator('input[placeholder*="Channel"]').fill("Dad Golf Pod");
  await click(page, /WHERE DO YOU LAND/i); await page.waitForTimeout(300);
  await click(page, /^SPIN$/i); await page.waitForTimeout(300); await skipWheel(page, 6);
  if (await has(page, /LOCK IT IN/i)) await click(page, /LOCK IT IN/i);
  await click(page, /CONTINUE TO COMBINE/i);
  for (let i = 0; i < 4; i++) { await click(page, /TAKE THE SHOT/i); await page.waitForTimeout(1050); }
  await click(page, /SEE THE FIELD/i); await click(page, /SPIN FOR DRAFT ORDER/i); await click(page, /SPIN THE WHEEL/i); await page.waitForTimeout(300); await skipWheel(page, 6);
  await click(page, /START DRAFT/i);
  for (let g = 0; g < 120; g++) { await page.waitForTimeout(300); const b = await body(page); if (/DRAFT COMPLETE/i.test(b)) break;
    if (/YOUR PICK/i.test(b)) { const rows = page.locator("button.w-full.mb-1"); if (await rows.count()) { await rows.first().click({ force: true }); await click(page, /DRAFT PLAYER/i); } } }
  R.steps.push("draft");
  await click(page, /CHIP CONTEST/i);
  await playChip(page, /CHIP CONTEST RESULTS|Pick your Day 1|chooses/i, "chip");
  if (await has(page, /CHOOSE DAY 1 MATCHUPS/i)) await click(page, /CHOOSE DAY 1 MATCHUPS/i);
  if (await has(page, /Pick your Day 1 opponent/i)) await page.getByText(/^Play /i).first().click({ force: true }); else await click(page, /LOCK MATCHUPS/i);
  R.steps.push("chip");
  await click(page, /TEE IT UP/i);
  for (const nine of ["front", "back"]) {
    if (nine === "back") await click(page, /BACK 9 · ALTERNATE SHOT/i, 20000);
    for (let hI = 0; hI < 9; hI++) { await click(page, /PLAY SCRAMBLE HOLE|PLAY ALT-SHOT HOLE/i); await page.waitForTimeout(350); await skipWheel(page, 4); }
    if (nine === "front") { await page.getByText(/Front 9 done/i).waitFor({ timeout: 20000 }); R.facts.front = (await body(page)).match(/(\d+(?:\.5)?) – (\d+(?:\.5)?)/)?.[0]; }
  }
  await page.waitForTimeout(800);
  if (await has(page, /DAY 1 · SUDDEN DEATH/i)) { R.facts.day1Tiebreak = true; await shot(page, "day1-tiebreak"); R.facts.day1TiebreakText = (await body(page)).slice(0, 600); await click(page, /CONTINUE TO RESULTS/i); }
  await page.getByText(/DAY 1 FINAL/i).first().waitFor({ timeout: 20000 });
  await shot(page, "day1-final"); R.facts.day1 = (await body(page)).slice(0, 300); R.steps.push("day1");
  if (!(await has(page, /CONTINUE TO DAY 2/i))) { R.facts.day1Lost = true; return finish(); }
  await click(page, /CONTINUE TO DAY 2/i); await shot(page, "day2-brief");
  await click(page, /PLAY SCRAMBLE/i);
  for (let hI = 0; hI < 9; hI++) { await page.getByText(/PLAY HOLE/i).first().waitFor(); if (hI === 0 || hI === 8) await shot(page, "day2-betterball-h" + (hI + 1)); await click(page, /PLAY HOLE/i); await page.waitForTimeout(250); }
  await page.getByText(/SCRAMBLE COMPLETE/i).waitFor({ timeout: 20000 }); await shot(page, "day2-betterball-done-skins");
  await page.mouse.wheel(0, 900); await page.waitForTimeout(200); await shot(page, "day2-betterball-done-scrolled");
  R.facts.scrambleDone = (await body(page)).slice(0, 1800); R.steps.push("day2-scramble");
  await click(page, /PLAY SINGLES/i);
  for (let hI = 0; hI < 18; hI++) { await page.getByText(/PLAY HOLE/i).first().waitFor(); if (hI === 0 || hI === 10) await shot(page, "day2-singles-h" + (hI + 1)); await click(page, /PLAY HOLE/i); await page.waitForTimeout(200); }
  R.steps.push("day2-singles");
  for (let g = 0; g < 30; g++) {
    await page.waitForTimeout(400); const b = await body(page);
    if (/CAPTAINS SUDDEN DEATH/i.test(b)) { R.facts.captainSD = b.slice(0, 500); await shot(page, "day2-12-12-captains-sd"); await click(page, /^CONTINUE$/); continue; }
    if (/HOLE-9 SKIN NEVER WON/i.test(b)) { R.facts.chipoff = true; await shot(page, "day2-skin-chipoff-intro"); await click(page, /CHIP FOR THE POT/i); await playChip(page, /wins the pot/i, "chipoff"); await page.waitForTimeout(400); await shot(page, "day2-skin-chipoff-paid"); R.facts.chipoffPaid = (await body(page)).slice(0, 1500); await click(page, /^CONTINUE$/); continue; }
    if (/DAY 2 FINAL/i.test(b)) break;
  }
  await page.getByText(/DAY 2 FINAL/i).first().waitFor({ timeout: 10000 });
  await shot(page, "day2-final"); await page.mouse.wheel(0, 700); await page.waitForTimeout(200); await shot(page, "day2-final-money"); await page.mouse.wheel(0, 900); await page.waitForTimeout(200); await shot(page, "day2-final-lists");
  R.facts.day2Final = (await body(page)).slice(0, 3000); R.steps.push("day2-final");
  if (await has(page, /^FINAL DAY$/)) { await click(page, /^FINAL DAY$/); await page.getByText(/Coming soon/i).waitFor(); await shot(page, "final-day-stub"); R.facts.finalDay = (await body(page)).slice(0, 1200); R.steps.push("final-day"); }
  // reload resume check
  await page.reload(); await page.waitForTimeout(1500); R.facts.afterReload = (await body(page)).slice(0, 200);
  return finish();
  async function finish() { fs.writeFileSync(`/workspace/invitational/qa-${TAG}.json`, JSON.stringify(R, null, 2)); console.log(JSON.stringify({ tag: TAG, ok: R.ok, steps: R.steps, errs: R.consoleErrors.slice(0, 5), facts: Object.keys(R.facts) })); await browser.close(); process.exit(R.ok ? 0 : 1); }
})().catch(async (e) => { try { await page.screenshot({ path: `/tmp/fatal-${TAG}.png` }); R.lastBody = (await page.locator("body").innerText()).slice(0, 1500); } catch (x) {} R.ok = false; R.fatal = String(e).slice(0, 800); fs.writeFileSync(`/workspace/invitational/qa-${TAG}.json`, JSON.stringify(R, null, 2)); console.log("FATAL", TAG, R.fatal, R.steps); process.exit(1); });
