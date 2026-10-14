// Renderer grafik Instagrama @warszawa_official: plik posta (JSON) → PNG dla każdego slajdu.
// Użycie: node render.mjs <post.json> [katalog-wyjściowy]
// Wymaga playwright-core i Chromium (PLAYWRIGHT_BROWSERS_PATH albo CHROMIUM_PATH).
// Styl konta (Maciej 14.10.2026, wzór @projekt.miejski, zmierzony na ich slajdach): zdjęcie „z telefonu” na cały
// kadr, biały napis bez ramek i bez przyciemnienia od dołu, bez nazwy konta i numeracji na obrazie.
// Układy (`layout`):
//   cover  — okładka: wąski grotesk (League Gothic), małe litery, blok wyrównany do lewej na wysokości środka;
//            z polem `num` duża liczba po lewej i tekst obok („7 miejsc na listopad z dzieckiem”),
//   place  — jedno miejsce lub wydarzenie (też klatki rolek): szeryf (Newsreader) na środku kadru,
//   repost — grafika lub zdjęcie organizatora w całości na białym tle, pod spodem szary podpis `credit`
//            (tak wyglądają środkowe slajdy przeglądów u wzoru); `crop: "3/2"` kadruje zbyt szerokie grafiki,
//   text   — sam napis na ciemnym tle (dni uroczyste),
//   list   — ciemne tło, tytuł i lista pozycji [tytuł, opis] (rzadko; szczegóły zwykle idą do opisu).
// Domyślnie: pierwszy slajd ze zdjęciem to `cover`, kolejne `repost`; bez zdjęcia `text`.
// Zdjęcie: adres https albo ścieżka w repozytorium (np. media/zrodla/plik.jpg); pobierane przez Node i wklejane
// do strony, więc Chromium nie potrzebuje sieci. `tags` slajdu (np. ["@organizator"]) publikator dodaje jako
// oznaczenia na zdjęciu; na obrazie nie są rysowane.
import "./siec.mjs";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_DIR = path.join(ROOT, "tools", "fonts");
const FONTS = [
  ["League Gothic", "400", "LeagueGothic.ttf"],
  ["Newsreader", "200 800", "Newsreader.ttf"],
  ["Instrument Sans", "400", "InstrumentSans-Regular.ttf"],
  ["Instrument Sans", "600", "InstrumentSans-SemiBold.ttf"],
]
  .map(([family, weight, file]) => {
    const data = readFileSync(path.join(FONT_DIR, file)).toString("base64");
    return `@font-face { font-family: "${family}"; font-weight: ${weight}; src: url(data:font/ttf;base64,${data}) format("truetype"); }`;
  })
  .join("\n");
const FONT_CHECK = ['16px "League Gothic"', '400 16px "Newsreader"', '16px "Instrument Sans"', '600 16px "Instrument Sans"'];

const SIZES = { feed: [1080, 1350], story: [1080, 1920] };
const UA = { "User-Agent": "warszawa-official-social/0.1 (github.com/maciejtzawadzki-bit/warszawa-official-social)" };

// Polska typografia: krótkie przyimki i spójniki nie zostają na końcu wiersza.
const GLUE = /(^|[\s(])(w|z|i|o|u|a|we|ze|na|do|po|od|bez|dla|że|to|—)\s+/giu;
const typo = (text) => String(text ?? "").replace(GLUE, (_, pre, word) => `${pre}${word}\u00a0`);
const esc = (text) => String(text ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const rich = (text) => esc(typo(text)).replace(/\n/g, "<br>");

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const cache = new Map();

async function imageData(src) {
  if (!src) return null;
  if (cache.has(src)) return cache.get(src);
  let buf;
  let type;
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src, { headers: UA });
    if (!res.ok) throw new Error(`Nie pobrano zdjęcia (${res.status}): ${src}`);
    buf = Buffer.from(await res.arrayBuffer());
    type = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  } else {
    const file = path.resolve(ROOT, src);
    buf = await readFile(file);
    type = MIME[path.extname(file).toLowerCase()] ?? "image/jpeg";
  }
  const uri = `data:${type};base64,${buf.toString("base64")}`;
  cache.set(src, uri);
  return uri;
}

export function slideLayout(slide, index, image, overlay = false) {
  if (slide.layout) return slide.layout;
  if (overlay) return "place";
  if (!image) return "text";
  return index === 0 ? "cover" : "repost";
}

// `overlay`: sama warstwa napisu na przezroczystym tle (do rolek: zdjęcie dokłada ffmpeg).
export function slideHtml(slide, format, index, total, image, { overlay = false } = {}) {
  const [W, H] = SIZES[format];
  const story = format === "story";
  const layout = slideLayout(slide, index, image, overlay);
  const sub = slide.sub ? `<div class="sub">${rich(slide.sub)}</div>` : "";
  const title = rich(slide.title);
  let body;
  let size;
  // Okładki i pojedyncze miejsca: rozmiar dobierany w przeglądarce (window.__fit), tak żeby najdłuższa linijka
  // tytułu zajęła prawie całą szerokość kadru (Maciej 14.10: „napisy mogą być sporo większe”). `size` wyłącza dopasowanie.
  const fit = (target, maxH, maxS) => (slide.size ? "" : ` data-fit="${target}" data-maxh="${Math.round(H * maxH)}" data-maxs="${maxS}"`);
  if (layout === "cover" && slide.num) {
    size = slide.size ?? 120;
    body = `<div class="block left"><div class="fit"${fit(W - 64 - 48, story ? 0.42 : 0.56, 220)} style="font-size:${size}px"><div class="numrow"><div class="num">${esc(slide.num)}</div><div class="numtext"><h1>${title}</h1></div></div>${sub}</div></div>`;
  } else if (layout === "cover") {
    size = slide.size ?? 168;
    body = `<div class="block left"><div class="fit"${fit(W - 64 - 48, story ? 0.5 : 0.62, 330)} style="font-size:${size}px"><h1>${title}</h1>${sub}</div></div>`;
  } else if (layout === "repost") {
    // `crop` (np. "3/2") kadruje zbyt szerokie albo wysokie grafiki; `focus` wskazuje, który fragment zostaje.
    const crop = slide.crop ? ` style="aspect-ratio:${esc(slide.crop)};object-fit:cover;object-position:${esc(slide.focus ?? "center")}"` : "";
    body = `<div class="frame"><img src="${image}" alt=""${crop}>${slide.credit ? `<div class="credit">${esc(slide.credit)}</div>` : ""}</div>`;
  } else if (layout === "list") {
    size = slide.size ?? 120;
    const items = (slide.items ?? [])
      .map((item) => {
        const [name, text] = Array.isArray(item) ? item : [item, ""];
        return `<li><b>${rich(name)}</b>${text ? `<span>${rich(text)}</span>` : ""}</li>`;
      })
      .join("");
    body = `<div class="block top"><div class="fit" style="font-size:${size}px"><h1>${title}</h1>${sub}</div><ol>${items}</ol></div>`;
  } else if (layout === "place") {
    size = slide.size ?? 124;
    body = `<div class="block center"><div class="fit serif"${fit(Math.round(W * 0.88), story ? 0.4 : 0.5, 300)} style="font-size:${size}px"><h1>${title}</h1>${sub}</div></div>`;
  } else {
    size = slide.size ?? 96;
    body = `<div class="block center"><div class="fit serif" style="font-size:${size}px"><h1>${title}</h1>${sub}</div></div>`;
  }
  const photo = image && layout !== "repost" && !overlay
    ? `<div class="photo" style="background-image:url('${image}');background-position:${esc(slide.focus ?? "center")}"></div>`
    : "";
  // Zdjęcie to tło, treść jest najważniejsza (Maciej 14.10): lekkie przyciemnienie całości (`wash`)
  // i poświata za napisem (`glow`); 0 wyłącza.
  const glowAt = layout === "cover" ? "32% 50%" : "50% 50%";
  const glow = (photo || overlay) && layout !== "repost" ? `<div class="glow"></div>` : "";
  const bg = overlay ? "transparent" : layout === "repost" ? "#FFFFFF" : "#121214";
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<style>
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; }
  body { background: ${bg}; color: #FFFFFF; position: relative; overflow: hidden; }
  .photo { position: absolute; inset: 0; background-size: cover; }
  .glow { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 34% at ${glowAt}, rgba(0,0,0,${slide.glow ?? 0.22}) 0%, rgba(0,0,0,0) 100%), rgba(0,0,0,${slide.wash ?? 0.14}); }
  .fit { display: inline-block; }
  h1 { display: inline-block; white-space: nowrap; font: 400 1em/0.98 "League Gothic"; letter-spacing: 0.005em; text-shadow: 0 0 36px rgba(0,0,0,.22); }
  .serif h1 { font-family: "Newsreader"; font-variation-settings: "opsz" 72; line-height: 0.96; letter-spacing: -0.025em; }
  .sub { margin-top: 0.12em; font: 400 0.5em/1.0 "League Gothic"; letter-spacing: 0.005em; text-shadow: 0 0 30px rgba(0,0,0,.25); max-width: ${W - 112}px; }
  .serif .sub { font: 400 max(0.3em, 46px)/1.2 "Newsreader"; letter-spacing: -0.01em; margin: 0.45em auto 0; }
  .block { position: absolute; left: 64px; right: 48px; }
  .left { top: ${slide.y ?? 47}%; transform: translateY(-50%); }
  .center { left: 40px; right: 40px; top: ${slide.y ?? 50}%; transform: translateY(-50%); text-align: center; }
  .top { top: ${story ? 300 : 150}px; }
  .numrow { display: flex; align-items: flex-start; gap: 0.18em; }
  .num { font-family: "League Gothic"; line-height: 0.8; letter-spacing: -0.02em; text-shadow: 0 0 40px rgba(0,0,0,.22); }
  .numtext h1 { line-height: 1.0; }
  .frame { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; }
  .frame img { width: ${W - 180}px; height: auto; max-height: ${H - 330}px; object-fit: contain; display: block; }
  .credit { max-width: ${W - 180}px; text-align: center; font: 400 26px/1.3 "Instrument Sans"; color: #BDBDBD; }
  ol { list-style: none; margin-top: 56px; display: grid; gap: ${story ? 34 : 28}px; }
  li { border-top: 1px solid rgba(255,255,255,.22); padding-top: ${story ? 26 : 22}px; display: grid; gap: 6px; }
  li b { font: 400 ${story ? 58 : 52}px/1.05 "League Gothic"; letter-spacing: 0.5px; }
  li span { font: 400 ${story ? 32 : 29}px/1.35 "Instrument Sans"; color: rgba(255,255,255,.80); }
</style>
<script>
// Dopasowanie: tytuł (z liczbą) zajmuje data-fit px szerokości, cały blok najwyżej data-maxh px wysokości.
window.__fit = () => {
  for (const el of document.querySelectorAll("[data-fit]")) {
    const target = +el.dataset.fit, maxH = +el.dataset.maxh, maxS = +el.dataset.maxs;
    const h1 = el.querySelector("h1"), num = el.querySelector(".num");
    for (let i = 0; i < 5; i += 1) {
      if (num) num.style.fontSize = (h1.offsetHeight / 0.74) + "px";
      const width = num ? el.querySelector(".numrow").scrollWidth : h1.offsetWidth;
      const k = Math.min(target / width, maxH / el.offsetHeight);
      el.style.fontSize = Math.min(parseFloat(el.style.fontSize) * k, maxS) + "px";
    }
  }
};
</script></head><body>
${photo}
${glow}
${body}
</body></html>`;
}

export function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  const dir = existsSync(base) ? readdirSync(base).find((d) => /^chromium-\d+$/.test(d)) : null;
  return dir ? path.join(base, dir, "chrome-linux", "chrome") : undefined;
}

// Pole `ig` slajdu (grafika organizatora z Instagrama) zamieniane na aktualny adres obrazu przez API.
export async function slideImage(slide) {
  if (slide.image || !slide.ig) return slide.image;
  const { resolveIg } = await import("./ig-media.mjs");
  return resolveIg(slide.ig);
}

export async function renderPost(post, outDir) {
  const format = post.type === "story" ? "story" : "feed";
  const [W, H] = SIZES[format];
  await mkdir(outDir, { recursive: true });
  const images = await Promise.all(post.slides.map(async (slide) => imageData(await slideImage(slide))));
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const files = [];
  for (const [i, slide] of post.slides.entries()) {
    await page.setContent(slideHtml(slide, format, i, post.slides.length, images[i]), { waitUntil: "load" });
    const missing = await page.evaluate(async (specs) => {
      await Promise.all(specs.map((spec) => document.fonts.load(spec, "Ąż")));
      await document.fonts.ready;
      return specs.filter((spec) => !document.fonts.check(spec, "Ąż"));
    }, FONT_CHECK);
    if (missing.length) throw new Error(`Nie wczytano fontów: ${missing.join(", ")}`);
    await page.evaluate(() => window.__fit?.());
    const file = path.join(outDir, `${post.id}-${String(i + 1).padStart(2, "0")}.png`);
    await page.screenshot({ path: file });
    files.push(file);
  }
  await browser.close();
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, out] = process.argv.slice(2);
  if (!input) {
    console.error("Użycie: node render.mjs <post.json> [katalog-wyjściowy]");
    process.exit(1);
  }
  const post = JSON.parse(await readFile(input, "utf8"));
  const files = await renderPost(post, out ?? path.join(ROOT, "rendered"));
  console.log(files.join("\n"));
}
