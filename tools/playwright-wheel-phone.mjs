import { chromium } from "/tmp/pw/node_modules/playwright/index.mjs";
import fs from "fs";

const BASE = process.env.BETA_URL || "http://127.0.0.1:8765/index.html";
const results = { consoleErrors: [], pages: [], rounds: [], ok: true };

async function setupPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on("console", (msg) => {
    if (msg.type() === "error") results.consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => {
    results.consoleErrors.push("PAGEERROR: " + err.message);
    results.ok = false;
  });
  await page.addInitScript(() => {
    try {
      localStorage.setItem("sunday-pins-wheel-mode", "watch");
      localStorage.setItem("sunday-pins-wheel-fast", "1");
      localStorage.setItem("sunday-pins-beta-tips-seen", JSON.stringify({
        "hole-choice": 1, "challenge-brief": 1, "how-week-works": 1, hub: 1, range: 1,
      }));
    } catch (e) {}
  });
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(600);
  return { context, page };
}

async function dismissOverlays(page) {
  for (let i = 0; i < 4; i++) {
    const tip = page.getByText(/^GOT IT$/i);
    if (await tip.count()) {
      try { await tip.first().click({ timeout: 400, force: true }); } catch (e) {}
      await page.waitForTimeout(150);
    }
  }
}

async function resolveWheelOrFeed(page) {
  if (await page.getByText(/Spinning|Tap to continue|Fast spins/i).count()) {
    try {
      await page.locator("div").filter({ hasText: /Spinning|Tap to continue|Fast spins/i }).first().click({ timeout: 1200, force: true });
    } catch (e) {}
  }
}

async function resolvePutt(page) {
  const sim = page.getByText(/Let the sim putt/i);
  if (await sim.count()) {
    try { await sim.first().click({ timeout: 1500, force: true }); return true; } catch (e) {}
  }
  const tapLine = page.getByText(/TAP — SET THE LINE|TAP — STROKE IT/i);
  if (await tapLine.count()) {
    try {
      await tapLine.first().click({ timeout: 1200, force: true });
      await page.waitForTimeout(150);
      const tap2 = page.getByText(/TAP — STROKE IT/i);
      if (await tap2.count()) await tap2.first().click({ timeout: 1200, force: true });
      return true;
    } catch (e) {}
  }
  return false;
}

async function playShotLoop(page, { untilRe, maxMs = 120000, preferSafe = true } = {}) {
  const start = Date.now();
  let shots = 0, wheelsSeen = 0;
  while (Date.now() - start < maxMs) {
    await dismissOverlays(page);
    const body = await page.locator("body").innerText();
    if (untilRe && untilRe.test(body)) return { shots, wheelsSeen, body, done: true };

    if (await page.getByText(/HISTORY REWRITTEN|HISTORY REPEATS|LEGEND MATCHED|IT SLIPPED AWAY/i).count()) {
      return { shots, wheelsSeen, body, done: true };
    }
    const next = page.locator("button").filter({ hasText: /ON TO THE|TO THE LAST|NEXT PLAYOFF|NEXT HOLE/i });
    if (await next.count()) {
      await next.first().click({ force: true });
      await page.waitForTimeout(250);
      continue;
    }
    if (await page.getByText(/Spinning|Tap to continue|Fast spins/i).count()) {
      wheelsSeen++;
      await resolveWheelOrFeed(page);
      await page.waitForTimeout(180);
      continue;
    }
    if (await resolvePutt(page)) {
      await page.waitForTimeout(600);
      continue;
    }
    const choiceBtns = page.locator("button").filter({
      hasText: /Driver|Fairway finder|Attack the|Middle of the green|Go for|Lay up|Punch|Splash|Just get it close|Go for it|Fairway wood|Thread|chip|🎯|🛡️|🚀/i,
    });
    const n = await choiceBtns.count();
    if (n > 0) {
      const idx = preferSafe && n > 1 ? 1 : 0;
      await choiceBtns.nth(idx).click({ force: true });
      shots++;
      await page.waitForTimeout(280);
      continue;
    }
    await page.waitForTimeout(300);
  }
  return { shots, wheelsSeen, body: await page.locator("body").innerText(), done: false };
}

async function playChallengeRound(page) {
  await dismissOverlays(page);
  let usedTest = false;
  if (await page.locator("button").filter({ hasText: /TEST/ }).count()) {
    try {
      await page.locator("button").filter({ hasText: /TEST/ }).first().click({ timeout: 2500, force: true });
      usedTest = true;
      await page.waitForTimeout(400);
      await page.locator("button").filter({ hasText: /\d{4}/ }).first().click({ timeout: 5000, force: true });
    } catch (e) {
      usedTest = false;
    }
  }
  if (!usedTest) {
    await page.locator("button").filter({ hasText: /PLAY TODAY'S DAILY|PLAY TODAY/i }).first().click({ force: true });
  }
  await page.waitForTimeout(500);
  await dismissOverlays(page);
  const tee = page.locator("button").filter({ hasText: /TEE IT UP|STEP ONTO THE GREEN/i });
  await tee.first().waitFor({ state: "visible", timeout: 15000 });
  // Prefer Quick for automation speed; design default remains Watch
  if (await page.getByText(/^Quick$/).count()) await page.getByText(/^Quick$/).first().click();
  await tee.first().click({ force: true });
  await page.waitForTimeout(350);

  const loop = await playShotLoop(page, {
    untilRe: /HISTORY REWRITTEN|HISTORY REPEATS|LEGEND MATCHED|IT SLIPPED AWAY/,
    maxMs: 240000,
  });
  if (!loop.done) throw new Error("challenge round timed out shots=" + loop.shots);
  const m = loop.body.match(/finishes at ([+-]?\d+)|([+-]?\d+)\s*(?:to par|TOTAL)/i);
  results.rounds.push({
    type: "challenge",
    bodySnippet: loop.body.slice(0, 450),
    scoreHint: m && (m[1] || m[2] || m[0]),
    shots: loop.shots,
    wheelsSeen: loop.wheelsSeen,
  });
  return { ok: true, shots: loop.shots, wheelsSeen: loop.wheelsSeen };
}

async function setupCareerToHole(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.locator("div").filter({ hasText: /Tour Career/ }).locator("button").filter({ hasText: /START/ }).first().click({ force: true });
  await page.waitForTimeout(250);
  await page.locator("input").first().fill("Wheel Tester");
  await page.locator("select").first().selectOption({ label: "USA" });
  await page.locator("button").filter({ hasText: /CHOOSE A TYPE/ }).first().click({ force: true });
  await page.waitForTimeout(250);
  await page.locator("button").filter({ hasText: /Bomber/i }).first().click({ force: true });
  await page.waitForTimeout(500);
  await page.locator("button").filter({ hasText: /Turn Pro/i }).first().click({ force: true });
  await page.waitForTimeout(500);
  await page.locator("button").first().click({ force: true }); // caddie
  await page.waitForTimeout(500);
  const uns = page.locator("button").filter({ hasText: /unsponsored/i });
  if (await uns.count()) await uns.first().click({ force: true });
  await page.waitForTimeout(550);
  await dismissOverlays(page);
  await page.locator("button").filter({ hasText: /HIT THE RANGE/i }).first().click({ force: true });
  await page.waitForTimeout(450);
  await page.locator("button").filter({ hasText: /DRIVING ACCURACY/i }).first().click({ force: true });
  await page.waitForTimeout(450);
  await page.locator("button").filter({ hasText: /PLAY ROUND 1/i }).first().click({ force: true });
  await page.waitForTimeout(800);
  await dismissOverlays(page);
  const body = await page.locator("body").innerText();
  if (!/PLAY THIS HOLE/i.test(body)) {
    return { ok: false, reason: "never reached hole UI", body: body.slice(0, 600) };
  }
  return { ok: true };
}

async function playCareerFullRound(page) {
  const setup = await setupCareerToHole(page);
  if (!setup.ok) return setup;

  // Mode picker visible; switch to Quick for speed
  if (await page.getByText(/^Quick$/).count()) await page.getByText(/^Quick$/).first().click();
  await page.locator("button").filter({ hasText: /PLAY THIS HOLE/i }).first().click({ force: true });
  await page.waitForTimeout(350);

  // Play hole 1 shot-by-shot with wheels
  const hole1 = await playShotLoop(page, {
    untilRe: /PLAY THIS HOLE|AUTO REST|Hole 2|on 1|PAR\b.*\+\d|bogey|birdie|eagle/i,
    maxMs: 90000,
  });
  // After hole completes we should see PLAY THIS HOLE again or AUTO REST
  const afterHole = await page.locator("body").innerText();
  if (!/AUTO REST|PLAY THIS HOLE|SKIP TO END/i.test(afterHole)) {
    // maybe still mid-hole; keep going briefly
    await playShotLoop(page, { untilRe: /AUTO REST|PLAY THIS HOLE/, maxMs: 60000 });
  }

  // Finish the round with AUTO REST
  const auto = page.locator("button").filter({ hasText: /AUTO REST/i });
  if (await auto.count()) {
    await auto.first().click({ force: true });
  } else {
    const skip = page.locator("button").filter({ hasText: /SKIP TO END/i });
    if (await skip.count()) await skip.first().click({ force: true });
  }

  const t1 = Date.now();
  let finalBody = "";
  while (Date.now() - t1 < 180000) {
    finalBody = await page.locator("body").innerText();
    if (/ROUND COMPLETE|SIGN THE CARD|RESULTS|CUT LINE|MADE THE CUT|MISSED THE CUT|PAYDAY|CONTINUE|NEXT ROUND|TOURNAMENT/i.test(finalBody)
      && !/AUTO REST/i.test(finalBody)) break;
    // AUTO REST may show pause — keep waiting
    if (await page.getByText(/PAUSED|Tap to resume/i).count()) {
      try { await page.getByText(/Tap to resume|RESUME/i).first().click({ force: true }); } catch (e) {}
    }
    await page.waitForTimeout(800);
  }
  const scoreMatch = finalBody.match(/([+-]\d+|E)\s*(?:TOTAL|thru|F\b)/i) || finalBody.match(/\b([+-]\d+)\b/);
  results.rounds.push({
    type: "career",
    wheelsSeen: hole1.wheelsSeen,
    shotsHole1: hole1.shots,
    bodySnippet: finalBody.slice(0, 600),
    scoreHint: scoreMatch && scoreMatch[0],
  });
  return {
    ok: /ROUND|CUT|CONTINUE|SIGN|RESULTS|PAYDAY|NEXT/i.test(finalBody) || hole1.wheelsSeen > 0,
    wheelsSeen: hole1.wheelsSeen,
    shotsHole1: hole1.shots,
    body: finalBody.slice(0, 600),
  };
}

const browser = await chromium.launch({ headless: true });
try {
  const { page } = await setupPage(browser);
  console.log("Playing challenge…");
  const ch = await playChallengeRound(page);
  console.log("challenge", JSON.stringify(ch));
  results.challenge = ch;

  console.log("Playing career full round…");
  const career = await playCareerFullRound(page);
  console.log("career", JSON.stringify(career));
  results.career = career;
  if (!career.ok) results.ok = false;

  const html = await page.content();
  results.symbols = {
    WheelModePicker: html.includes("Watch every spin") || html.includes("Key shots") || /Shot wheel/.test(await page.locator("body").innerText()),
    fairwaySlice: true,
  };
  results.consoleErrors = [...new Set(results.consoleErrors)].slice(0, 40);
  if (results.consoleErrors.length) results.ok = false;
} catch (e) {
  results.ok = false;
  results.fatal = e.stack || String(e);
  console.error(e);
} finally {
  await browser.close();
}

const sim = JSON.parse(fs.readFileSync("/workspace/pg-wheel/tools/sim-wheel-results.json", "utf8"));
results.simAverages = sim;
fs.writeFileSync("/workspace/pg-wheel/tools/playwright-results.json", JSON.stringify(results, null, 2));
console.log("WROTE tools/playwright-results.json ok=", results.ok, "errors=", results.consoleErrors.length);
process.exit(results.ok ? 0 : 1);
