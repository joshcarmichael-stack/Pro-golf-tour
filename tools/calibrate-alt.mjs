import fs from "fs";
import vm from "vm";

const W = { driving: 0.19, longApproach: 0.13, shortApproach: 0.18, chipping: 0.12, putting: 0.13, paceControl: 0.07, shotShaping: 0.05, courseManagement: 0.05, recovery: 0.04, bunker: 0.04 };
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
const calcOverall = (a) => {
  const g = (k) => (a && typeof a[k] === "number" && !isNaN(a[k])) ? a[k] : 75;
  const driving = Math.round(0.45 * g("drivingAccuracy") + 0.55 * g("drivingDistance"));
  return Math.round(driving * W.driving + g("longApproach") * W.longApproach + g("shortApproach") * W.shortApproach +
    g("chipping") * W.chipping + g("putting") * W.putting + g("recovery") * W.recovery + g("bunker") * W.bunker +
    g("paceControl") * W.paceControl + g("shotShaping") * W.shotShaping + g("courseManagement") * W.courseManagement);
};

const code = fs.readFileSync("/workspace/pg-inv-v2/beta/invitational.js", "utf8");
const sandbox = {
  console, Math, Date, JSON, parseInt, isNaN, undefined,
  React: { useState: () => [null, () => {}], useEffect: () => {}, useRef: () => ({ current: null }), createElement: () => null },
  clampN, calcOverall, COURSES: undefined,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.runInNewContext(code, sandbox);

const rows = sandbox.calibrateAltPairs(120);
console.log("PAR", rows[0].par);
console.log("PAIRING | AVG | VS PAR | bunk-stuck events | tops");
rows.forEach((r) => {
  console.log(`${r.label.padEnd(8)} | ${String(r.avg).padStart(5)} | ${String(r.vsPar).padStart(6)} | ${String(r.bunkStuck).padStart(5)} | ${r.tops}`);
});

const p88 = { name: "Ace", shortName: "Ace", overall: 88, attrs: sandbox.makeAttrsAtOvr(88) };
const p40 = { name: "Duke", shortName: "Duke", overall: 40, attrs: sandbox.makeAttrsAtOvr(40) };
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const sample = sandbox.playAltHole(p88, p40, [4, 410, 3, 1, {}], 0, mulberry32(42));
console.log("\nSAMPLE 88+40 alt hole:");
sample.log.forEach((l) => console.log(" -", l.text));
console.log("score", sample.score);

fs.mkdirSync("/workspace/invitational", { recursive: true });
fs.writeFileSync("/workspace/invitational/alt-calib.json", JSON.stringify({ rows, sample }, null, 2));
