// Renderer grafik Instagrama @warszawa_official: plik posta (JSON) → PNG dla każdego slajdu.
// Użycie: node render.mjs <post.json> [katalog-wyjściowy]
// Wymaga playwright-core i Chromium (PLAYWRIGHT_BROWSERS_PATH albo CHROMIUM_PATH).
// Styl konta (ustalenia z Maciejem 14.10.2026, wzór: @projekt.miejski): zdjęcie na cały ekran, przyciemnienie od dołu,
// duży biały napis Instrument Serif, pod nim mała linijka z datą i miejscem; tylko biel, bez kolorowych akcentów.
// Układy slajdu (`layout`):
//   photo  — zdjęcie + tytuł + linijka (domyślny, gdy jest `image`),
//   text   — sam tekst na ciemnym tle (dni uroczyste, slajdy bez zdjęcia; bez korony i ozdobników),
//   list   — ciemne tło, tytuł i lista pozycji [tytuł, opis] (np. ostatni slajd z biletami i godzinami).
// Zdjęcie: adres https albo ścieżka w repozytorium (np. media/zrodla/plik.jpg); pobierane przez Node i wklejane
// do strony, więc Chromium nie potrzebuje sieci. `credit` (np. „fot. @autor”) trafia w prawy dolny róg.
import { readFile, mkdir } from "node:fs/promises";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_DIR = path.join(ROOT, "tools", "fonts");
const FONTS = [
  ["Instrument Sans", 400, "InstrumentSans-Regular.ttf"],
  ["Instrument Sans", 600, "InstrumentSans-SemiBold.ttf"],
  ["Instrument Serif", 400, "InstrumentSerif-Regular.ttf"],
]
  .map(([family, weight, file]) => {
    const data = readFileSync(path.join(FONT_DIR, file)).toString("base64");
    return `@font-face { font-family: "${family}"; font-weight: ${weight}; src: url(data:font/ttf;base64,${data}) format("truetype"); }`;
  })
  .join("\n");

const SIZES = { feed: [1080, 1350], story: [1080, 1920] };
const HANDLE = "warszawa_official";
const UA = { "User-Agent": "warszawa-official-social/0.1 (github.com/maciejtzawadzki-bit/warszawa-official-social)" };

// Polska typografia: krótkie przyimki i spójniki nie zostają na końcu wiersza.
const GLUE = /(^|[\s(])(w|z|i|o|u|a|we|ze|na|do|po|od|bez|dla|że|to|—)\s+/giu;
const typo = (text) => String(text ?? "").replace(GLUE, (_, pre, word) => `${pre}${word} `);
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

// `overlay`: sama warstwa napisu z przyciemnieniem na przezroczystym tle (do rolek: zdjęcie dokłada ffmpeg).
export function slideHtml(slide, format, index, total, image, { overlay = false } = {}) {
  const [W, H] = SIZES[format];
  const story = format === "story";
  const layout = slide.layout ?? (image || overlay ? "photo" : "text");
  const pad = 80;
  const bottom = story ? 330 : 120;
  const size = slide.size ?? (layout === "photo" ? (story ? 132 : 118) : layout === "list" ? (story ? 96 : 84) : story ? 104 : 92);
  const counter = total > 1 && !overlay ? `<div class="counter">${index + 1}/${total}</div>` : "";
  const credit = slide.credit ? `<div class="credit">${esc(slide.credit)}</div>` : "";
  const sub = slide.sub ? `<div class="sub">${rich(slide.sub)}</div>` : "";
  const items = (slide.items ?? [])
    .map((item) => {
      const [title, text] = Array.isArray(item) ? item : [item, ""];
      return `<li><b>${rich(title)}</b>${text ? `<span>${rich(text)}</span>` : ""}</li>`;
    })
    .join("");
  const body =
    layout === "list"
      ? `<div class="block top"><h1 style="font-size:${size}px">${rich(slide.title)}</h1>${sub}<ol>${items}</ol></div>`
      : layout === "text"
        ? `<div class="block center"><h1 style="font-size:${size}px">${rich(slide.title)}</h1>${sub}</div>`
        : `<div class="block bottom"><h1 style="font-size:${size}px">${rich(slide.title)}</h1>${sub}</div>`;
  const bg = overlay
    ? `<div class="shade"></div>`
    : image
      ? `<div class="photo" style="background-image:url('${image}');background-position:${esc(slide.focus ?? "center")}"></div><div class="shade"></div>`
      : "";
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<style>
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; }
  body { background: ${overlay ? "transparent" : "#0D0D0F"}; color: #FFFFFF; font-family: "Instrument Sans", sans-serif; position: relative; overflow: hidden; }
  .photo { position: absolute; inset: 0; background-size: cover; }
  .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.30) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 42%, rgba(0,0,0,.55) 68%, rgba(0,0,0,.86) 100%); }
  .block { position: absolute; left: ${pad}px; right: ${pad}px; }
  .bottom { bottom: ${bottom}px; }
  .center { top: 50%; transform: translateY(-50%); text-align: left; }
  .top { top: ${story ? 300 : 170}px; }
  h1 { font-family: "Instrument Serif", serif; font-weight: 400; line-height: 0.98; letter-spacing: -1px; text-shadow: 0 2px 24px rgba(0,0,0,.25); }
  .sub { margin-top: 30px; font: 400 ${story ? 36 : 32}px/1.35 "Instrument Sans"; color: rgba(255,255,255,.88); letter-spacing: .2px; }
  ol { list-style: none; margin-top: 56px; display: grid; gap: ${story ? 34 : 28}px; }
  li { border-top: 1px solid rgba(255,255,255,.22); padding-top: ${story ? 26 : 22}px; display: grid; gap: 6px; }
  li b { font: 600 ${story ? 38 : 34}px/1.2 "Instrument Sans"; }
  li span { font: 400 ${story ? 32 : 29}px/1.35 "Instrument Sans"; color: rgba(255,255,255,.78); }
  .handle { position: absolute; top: 56px; left: ${pad}px; font: 600 22px "Instrument Sans"; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.78); }
  .counter { position: absolute; top: 56px; right: ${pad}px; font: 600 22px "Instrument Sans"; letter-spacing: 2px; color: rgba(255,255,255,.78); }
  .credit { position: absolute; right: 28px; bottom: ${story ? 250 : 26}px; font: 400 17px "Instrument Sans"; color: rgba(255,255,255,.62); }
</style></head><body>
${bg}
<div class="handle">${HANDLE}</div>
${counter}
${body}
${credit}
</body></html>`;
}

export function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  const dir = existsSync(base) ? readdirSync(base).find((d) => /^chromium-\d+$/.test(d)) : null;
  return dir ? path.join(base, dir, "chrome-linux", "chrome") : undefined;
}

export async function renderPost(post, outDir) {
  const format = post.type === "story" ? "story" : "feed";
  const [W, H] = SIZES[format];
  await mkdir(outDir, { recursive: true });
  const images = await Promise.all(post.slides.map((slide) => imageData(slide.image)));
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const files = [];
  for (const [i, slide] of post.slides.entries()) {
    await page.setContent(slideHtml(slide, format, i, post.slides.length, images[i]), { waitUntil: "load" });
    const missing = await page.evaluate(async () => {
      const specs = ['16px "Instrument Sans"', '600 16px "Instrument Sans"', '16px "Instrument Serif"'];
      await Promise.all(specs.map((spec) => document.fonts.load(spec, "Ąż")));
      await document.fonts.ready;
      return specs.filter((spec) => !document.fonts.check(spec, "Ąż"));
    });
    if (missing.length) throw new Error(`Nie wczytano fontów: ${missing.join(", ")}`);
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
