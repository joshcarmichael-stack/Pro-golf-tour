import { chromium } from "/tmp/pw/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";

const BASE = process.env.BETA_URL || "http://127.0.0.1:8765/index.html";
const SHOTS = process.env.SHOTS_DIR || "/workspace/invitational/shots-live";
fs.mkdirSync(SHOTS, { recursive: true });

const results = { ok: true, steps: [], consoleErrors: [], screenshots: [] };

async function shot(page, name) {
  const fp = path.join(SHOTS, name + ".png");
  await page.screenshot({ path: fp, fullPage: false });
  results.screenshots.push(fp);
  results.steps.push("shot:" + name);
}

async function clickText(page, re, opts = {}) {
  const loc = page.getByText(re).first();
  await loc.waitFor({ timeout: opts.timeout || 10000 });
  await loc.click({ force: true });
}

async function dismiss(page) {
  for (let i = 0; i < 3; i++) {
    const tip = page.getByText(/^GOT IT$/i);
    if (await tip.count()) { try { await tip.first().click({ timeout: 300, force: true }); } catch (e) {} }
  }
}

async function skipWheel(page, times = 4) {
  for (let t = 0; t < times; t++) {
    try {
      await page.locator("div").filter({ hasText: /Spinning|tap to skip|WHO PICKS|ELITE|SCRAMBLE|ALT SHOT|WHERE DO YOU LAND/i }).first().click({ timeout: 800, force: true });
    } catch (e) {}
    await page.waitForTimeout(350);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", (err) => { results.consoleErrors.push(err.message); results.ok = false; });
  page.on("console", (msg) => { if (msg.type() === "error") results.consoleErrors.push(msg.text()); });

  await page.addInitScript(() => {
    try {
      localStorage.setItem("sunday-pins-wheel-mode", "watch");
      localStorage.setItem("sunday-pins-wheel-fast", "1");
      localStorage.setItem("sunday-pins-beta-tips-seen", JSON.stringify({ hub: 1, train: 1 }));
      localStorage.removeItem("sunday-pins-invitational-v1");
    } catch (e) {}
  });

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);
  await dismiss(page);

  await page.getByText(/INTERNET INVITATIONAL/i).first().waitFor({ timeout: 10000 });
  await shot(page, "01-home-invitational-card");
  results.steps.push("home-card");

  await clickText(page, /ENTER THE INVITATIONAL/i);
  await page.waitForTimeout(400);
  await shot(page, "02-intro");

  await clickText(page, /START INVITATIONAL/i);
  await page.waitForTimeout(300);

  // Channel
  await page.locator('input[placeholder*="Channel"]').fill("Sunday Pins TV");
  await clickText(page, /Comedy Golf/i);
  await shot(page, "03-channel-comedy");
  await clickText(page, /WHERE DO YOU LAND/i);
  await page.waitForTimeout(300);

  // Land wheel
  await page.getByText(/Where do you land/i).first().waitFor();
  await shot(page, "03b-land-prompt");
  await clickText(page, /^SPIN$/i);
  await page.waitForTimeout(400);
  await skipWheel(page, 6);
  await page.getByText(/LOCK IT IN|Elite|Middle of the pack|Underdog/i).first().waitFor({ timeout: 12000 });
  await shot(page, "03c-land-result-spin");
  // if still on spinning result with LOCK IT IN
  if (await page.getByText(/LOCK IT IN/i).count()) {
    await clickText(page, /LOCK IT IN/i);
  }
  await page.waitForTimeout(400);
  await page.getByText(/ANYONE CAN WIN|YOU LANDED/i).first().waitFor({ timeout: 10000 });
  await shot(page, "03d-land-anyone-can-win");
  const landBody = await page.locator("body").innerText();
  results.landedUnderdog = /Underdog/i.test(landBody);
  results.anyoneWinsVisible = /Your overall picks your rivals/i.test(landBody);
  if (!results.anyoneWinsVisible) { results.ok = false; results.steps.push("FAIL-anyone-wins-copy"); }
  else results.steps.push("land-wheel");

  await clickText(page, /CONTINUE TO COMBINE/i);
  await page.waitForTimeout(300);

  // Combine 4 drills
  for (let i = 0; i < 4; i++) {
    await clickText(page, /TAKE THE SHOT/i);
    await page.waitForTimeout(1100);
  }
  await page.getByText(/COMBINE COMPLETE/i).waitFor();
  await shot(page, "04-combine-complete");
  results.steps.push("combine");

  await clickText(page, /SEE THE FIELD/i);
  await page.waitForTimeout(400);
  await page.getByText(/Four captains/i).waitFor();
  await shot(page, "05-captains");
  const capBody = await page.locator("body").innerText();
  results.captainsAnyoneWins = /Your overall picks your rivals|ANYONE CAN WIN/i.test(capBody);
  if (!results.captainsAnyoneWins) { results.ok = false; results.steps.push("FAIL-captains-anyone-wins"); }
  else results.steps.push("captains");

  await clickText(page, /SPIN FOR DRAFT ORDER/i);
  await page.waitForTimeout(200);
  await clickText(page, /SPIN THE WHEEL/i);
  await page.waitForTimeout(400);
  await skipWheel(page, 6);
  await page.getByText(/Snake draft locked|DRAFT ORDER/i).first().waitFor({ timeout: 10000 });
  await shot(page, "06-draft-order");
  await clickText(page, /START DRAFT/i);

  let guard = 0;
  while (guard++ < 80) {
    await page.waitForTimeout(400);
    const body = await page.locator("body").innerText();
    if (/DRAFT COMPLETE|Squads are set/i.test(body)) break;
    if (/YOUR PICK/i.test(body)) {
      const rows = page.locator("button.w-full.mb-1");
      if (await rows.count()) {
        await rows.first().click({ force: true });
        await page.waitForTimeout(100);
        await clickText(page, /DRAFT PLAYER/i);
      } else {
        await page.getByRole("button").nth(2).click({ force: true }).catch(() => {});
        await clickText(page, /DRAFT PLAYER/i).catch(() => {});
      }
    }
  }
  await page.getByText(/DRAFT COMPLETE/i).first().waitFor({ timeout: 60000 });
  await shot(page, "07-draft-complete");
  results.steps.push("draft");

  // Post-draft chip contest (sets Day 1 matchups; $5k to winning team)
  await clickText(page, /CHIP CONTEST/i);
  await page.waitForTimeout(500);
  await page.getByText(/CAPTAINS CHIP|Closest to the hole|POST-DRAFT/i).first().waitFor({ timeout: 15000 });
  await shot(page, "07b-chip-intro");

  // Play through chip: player aims when YOUR CHIP; AI auto
  let chipGuard = 0;
  while (chipGuard++ < 40) {
    await page.waitForTimeout(400);
    const body = await page.locator("body").innerText();
    if (/CHIP CONTEST RESULTS|Pick your Day 1|chooses|LOCK MATCHUPS/i.test(body)) break;
    if (/SET AIM|POWER METER/i.test(body)) {
      // tap green center-ish then set aim
      const svg = page.locator("svg").first();
      if (await svg.count()) {
        const box = await svg.boundingBox();
        if (box) await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.55);
      }
      await clickText(page, /SET AIM|POWER METER/i).catch(() => {});
      await page.waitForTimeout(200);
    }
    if (/TAP — SET POWER|1 · POWER/i.test(body) && await page.getByText(/TAP — SET POWER/i).count()) {
      await clickText(page, /TAP — SET POWER/i);
      await page.waitForTimeout(250);
    }
    if (/TAP — STRIKE/i.test(body)) {
      await clickText(page, /TAP — STRIKE/i);
      await page.waitForTimeout(1600);
      await shot(page, "07c-chip-fly");
    }
    if (/RE-CHIP/i.test(body)) {
      await clickText(page, /RE-CHIP/i);
      await page.waitForTimeout(300);
    }
  }
  await shot(page, "07d-chip-results");
  results.steps.push("chip");

  // Results → choose matchups (player) or lock (AI)
  if (await page.getByText(/CHOOSE DAY 1 MATCHUPS/i).count()) {
    await clickText(page, /CHOOSE DAY 1 MATCHUPS/i);
    await page.waitForTimeout(300);
  }
  await shot(page, "07e-chip-pick");
  if (await page.getByText(/Pick your Day 1 opponent/i).count()) {
    await page.getByText(/^Play /i).first().click({ force: true });
  } else if (await page.getByText(/LOCK MATCHUPS/i).count()) {
    await clickText(page, /LOCK MATCHUPS/i);
  }
  await page.waitForTimeout(500);

  await page.getByText(/TEE IT UP|FRONT 9 · SCRAMBLE/i).first().waitFor({ timeout: 15000 });
  await shot(page, "08-brief");
  results.steps.push("brief");
  await clickText(page, /TEE IT UP/i);

  // Play front 9
  for (let h = 0; h < 9; h++) {
    await page.getByText(/PLAY SCRAMBLE HOLE|PLAY ALT-SHOT HOLE|PLAY YOUR SHOT/i).waitFor({ timeout: 10000 });
    if (h === 0) await shot(page, "09-play-front-hole1");
    await clickText(page, /PLAY SCRAMBLE HOLE|PLAY ALT-SHOT HOLE|PLAY YOUR SHOT/i);
    await page.waitForTimeout(500);
    await skipWheel(page, 5);
    if (h === 0) {
      await page.waitForTimeout(400);
      const b = await page.locator("body").innerText();
      results.shotLogVisible = /SHOT LOG/i.test(b);
      if (/tops it|bunker|chunks|shanks|bombs|ripping|drains|still in the bunker/i.test(b)) {
        results.flavourSeen = true;
      }
      await shot(page, "09b-shot-log-front");
    }
  }
  await page.getByText(/Front 9 done|TURN/i).first().waitFor({ timeout: 20000 });
  await shot(page, "10-nine-break");
  results.steps.push("front9");

  await clickText(page, /BACK 9/i);
  for (let h = 0; h < 9; h++) {
    await page.getByText(/PLAY SCRAMBLE HOLE|PLAY ALT-SHOT HOLE|PLAY YOUR SHOT/i).waitFor({ timeout: 10000 });
    if (h === 0) await shot(page, "11-play-back-hole1");
    await clickText(page, /PLAY SCRAMBLE HOLE|PLAY ALT-SHOT HOLE|PLAY YOUR SHOT/i);
    await page.waitForTimeout(500);
    await skipWheel(page, 5);
    if (h === 0) {
      await page.waitForTimeout(400);
      await shot(page, "11b-shot-log-alt");
      const b = await page.locator("body").innerText();
      if (/SHOT LOG/i.test(b)) results.altShotLogVisible = true;
    }
  }
  // May hit Day 1 sudden death first
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(500);
    const body = await page.locator("body").innerText();
    if (/DAY 1 FINAL/i.test(body)) break;
    if (/SUDDEN DEATH|Best pairings/i.test(body)) {
      await shot(page, "11c-day1-tiebreak");
      if (await page.getByText(/CONTINUE TO RESULTS/i).count()) await clickText(page, /CONTINUE TO RESULTS/i);
      results.steps.push("day1-tiebreak");
    }
  }
  await page.getByText(/DAY 1 FINAL/i).first().waitFor({ timeout: 30000 });
  await shot(page, "12-results");
  results.steps.push("results");

  // Day 2 if through
  if (await page.getByText(/CONTINUE TO DAY 2/i).count()) {
    await clickText(page, /CONTINUE TO DAY 2/i);
    await page.waitForTimeout(400);
    await shot(page, "13-day2-brief");
    await clickText(page, /PLAY SCRAMBLE/i);
    for (let h = 0; h < 9; h++) {
      await page.getByText(/PLAY HOLE/i).first().waitFor({ timeout: 10000 });
      if (h === 0) await shot(page, "14-day2-scramble-h1");
      await clickText(page, /PLAY HOLE/i);
      await page.waitForTimeout(350);
    }
    await page.getByText(/SCRAMBLE COMPLETE/i).waitFor({ timeout: 20000 });
    await shot(page, "15-day2-scramble-done");
    await clickText(page, /PLAY SINGLES/i);
    for (let h = 0; h < 18; h++) {
      await page.getByText(/PLAY HOLE/i).first().waitFor({ timeout: 10000 });
      if (h === 0) await shot(page, "16-day2-singles-h1");
      await clickText(page, /PLAY HOLE/i);
      await page.waitForTimeout(250);
    }
    // captain SD or results or chip-off
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(400);
      const body = await page.locator("body").innerText();
      if (/DAY 2 FINAL|FINAL DAY|Coming soon/i.test(body)) break;
      if (/CAPTAINS SUDDEN DEATH/i.test(body)) {
        await shot(page, "17-day2-captain-sd");
        if (await page.getByText(/^CONTINUE$/i).count()) await clickText(page, /^CONTINUE$/i);
      }
      if (/CHIP FOR THE POT|SKIN CHIP-OFF|chip-off/i.test(body)) {
        await shot(page, "17b-skin-chipoff");
        if (await page.getByText(/CHIP FOR THE POT/i).count()) await clickText(page, /CHIP FOR THE POT/i);
        // play money chip quickly
        for (let c = 0; c < 20; c++) {
          await page.waitForTimeout(300);
          const b2 = await page.locator("body").innerText();
          if (/wins the pot|CONTINUE/i.test(b2) && await page.getByText(/^CONTINUE$/i).count()) {
            await shot(page, "17c-skin-paid");
            await clickText(page, /^CONTINUE$/i);
            break;
          }
          if (/SET AIM|POWER METER/i.test(b2)) {
            const svg = page.locator("svg").first();
            if (await svg.count()) {
              const box = await svg.boundingBox();
              if (box) await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.55);
            }
            await clickText(page, /SET AIM|POWER METER/i).catch(() => {});
          }
          if (await page.getByText(/TAP — SET POWER/i).count()) await clickText(page, /TAP — SET POWER/i);
          if (await page.getByText(/TAP — STRIKE/i).count()) {
            await clickText(page, /TAP — STRIKE/i);
            await page.waitForTimeout(1500);
          }
        }
      }
      if (/FINAL DAY/i.test(body) && await page.getByText(/^FINAL DAY$/i).count()) {
        await clickText(page, /^FINAL DAY$/i);
      }
    }
    await shot(page, "18-day2-end");
    results.steps.push("day2");
  }

  const range = await page.evaluate(() => {
    const r = window.invRosterRaw || [];
    const ovrs = r.map((p) => p.overall);
    return {
      min: Math.min(...ovrs), max: Math.max(...ovrs), n: r.length,
      badges: (window.INV_BADGES || []).map((b) => b.id),
      lands: (window.INV_LAND_BANDS || []).map((b) => b.id),
    };
  });
  results.rosterRange = range;
  if (range.min > 45 || range.max < 85 || range.n !== 64) {
    results.ok = false;
    results.steps.push("FAIL-roster-range");
  } else results.steps.push("roster-range-ok");
  if (!range.lands || range.lands.length !== 3) {
    results.ok = false;
    results.steps.push("FAIL-land-bands");
  }

  // Load calib if present
  try {
    results.calibration = JSON.parse(fs.readFileSync("/workspace/invitational/alt-calib.json", "utf8")).rows;
  } catch (e) {}

  fs.writeFileSync("/workspace/invitational/playwright-inv-live-results.json", JSON.stringify(results, null, 2));
  fs.writeFileSync("/workspace/invitational/playwright-inv-v2-results.json", JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
  process.exit(results.ok && results.steps.includes("results") && results.steps.includes("chip") ? 0 : 1);
})().catch((e) => {
  console.error(e);
  results.ok = false;
  results.fatal = String(e);
  fs.writeFileSync("/workspace/invitational/playwright-inv-live-results.json", JSON.stringify(results, null, 2));
  fs.writeFileSync("/workspace/invitational/playwright-inv-v2-results.json", JSON.stringify(results, null, 2));
  process.exit(1);
});
