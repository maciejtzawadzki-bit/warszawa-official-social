import { chromium } from "../../tools/node_modules/playwright-core/index.mjs";
import { chromiumPath } from "../../tools/render.mjs";
import { readFileSync } from "node:fs";
const D = "../../tools/fonts";
const f64 = (n) => `data:font/ttf;base64,${readFileSync(`${D}/${n}`).toString("base64")}`;
const img64 = (sciezka) => `data:image/png;base64,${readFileSync(sciezka).toString("base64")}`;
const OUT = process.argv[2];
const fonty = `
@font-face { font-family: "League Gothic"; src: url("${f64("LeagueGothic.ttf")}"); }
@font-face { font-family: "Newsreader"; src: url("${f64("Newsreader.ttf")}"); font-weight: 200 800; }
*{margin:0;padding:0;box-sizing:border-box} body{width:1080px;height:1080px;overflow:hidden}
.k{width:1080px;height:1080px;display:grid;place-items:center;position:relative}`;
// Korona: cienka linia, trzy zęby z kulkami (bez emotki, bez logo miasta).
const korona = (kolor, szer = 300, y = 0) => `<svg width="${szer}" viewBox="0 0 120 70" style="position:absolute;left:50%;top:${y}px;transform:translateX(-50%)"><path fill="${kolor}" d="M16 62 L8 22 L36 42 L60 12 L84 42 L112 22 L104 62 Z"/><rect x="16" y="58" width="88" height="8" rx="2" fill="${kolor}"/><circle cx="8" cy="17" r="7" fill="${kolor}"/><circle cx="60" cy="7" r="7" fill="${kolor}"/><circle cx="112" cy="17" r="7" fill="${kolor}"/></svg>`;
const warianty = {
  "1-w-korona-czarne": `<div class="k" style="background:#111"><div style="font:560 600px/1 Newsreader;font-variation-settings:'opsz' 72;color:#fff;letter-spacing:-0.02em;transform:translateY(95px)">W</div>${korona("#fff", 240, 170)}</div>`,
  "2-wwa-gothic": `<div class="k" style="background:#111"><div style="font:400 600px/0.8 'League Gothic';color:#fff;letter-spacing:0.01em;transform:translateY(30px)">wwa</div></div>`,
  "3-w-korona-jasne": `<div class="k" style="background:#f3eee6"><div style="font:560 600px/1 Newsreader;font-variation-settings:'opsz' 72;color:#141414;letter-spacing:-0.02em;transform:translateY(95px)">W</div>${korona("#141414", 240, 170)}</div>`,
  "4-w-korona-bordo": `<div class="k" style="background:#7a1426"><div style="font:560 600px/1 Newsreader;font-variation-settings:'opsz' 72;color:#fff;letter-spacing:-0.02em;transform:translateY(95px)">W</div>${korona("#f2d48a", 240, 170)}</div>`,
};
const b = await chromium.launch({ executablePath: chromiumPath() });
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
for (const [n, html] of Object.entries(warianty)) {
  await p.setContent(`<style>${fonty}</style>${html}`, { waitUntil: "load" });
  await p.evaluate(async () => { await document.fonts.load("560 100px Newsreader"); await document.fonts.load("100px 'League Gothic'"); await document.fonts.ready; });
  await p.screenshot({ path: `${OUT}/${n}.png` });
}
// Arkusz porównania: duży kwadrat, kółko jak na profilu (150 px) i w komentarzach (40 px), na jasnym i ciemnym tle.
const nazwy = Object.keys(warianty);
const wiersz = (n) => { const u = img64(`${OUT}/${n}.png`); return `<div class="w"><img class="duzy" src="${u}"><div class="tla">
  <div class="tlo" style="background:#fff"><img class="kolo" style="width:150px" src="${u}"><img class="kolo" style="width:40px" src="${u}"><span style="color:#111">warszawa_official</span></div>
  <div class="tlo" style="background:#000"><img class="kolo" style="width:150px" src="${u}"><img class="kolo" style="width:40px" src="${u}"><span style="color:#eee">warszawa_official</span></div>
  </div><div class="n">${n.split("-")[0]}</div></div>`; };
await p.setViewportSize({ width: 1100, height: 420 * nazwy.length + 40 });
await p.setContent(`<style>body{margin:0;padding:20px;background:#ddd;font:20px system-ui}.w{display:flex;gap:20px;align-items:center;margin-bottom:24px}.duzy{width:280px;height:280px}.tla{display:flex;flex-direction:column;gap:12px}.tlo{display:flex;align-items:center;gap:24px;padding:14px 20px;border-radius:12px;width:620px}.kolo{border-radius:50%;aspect-ratio:1}.n{font:700 48px system-ui;color:#333}</style>${nazwy.map(wiersz).join("")}`, { waitUntil: "load" });
await p.screenshot({ path: `${OUT}/porownanie.png`, fullPage: true });
await b.close();
