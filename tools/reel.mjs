// Rolka w półautomacie (tryb 3 w CLAUDE.md): post (JSON) → pionowe wideo 1080×1920 bez dźwięku.
// Każdy slajd ze zdjęciem: powolne przybliżenie zdjęcia (ffmpeg) i napis szeryfem na środku (układ `place` z render.mjs),
// slajdy łączone przenikaniem. Modny utwór dodaje właściciel w aplikacji Instagram przy publikacji.
// Użycie: node tools/reel.mjs <post.json> [katalog-wyjściowy]  →  rolka.mp4, okladka.jpg, opis.txt
import "./siec.mjs";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { slideHtml, chromiumPath, slideImage } from "./render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1080, H = 1920, FPS = 30, FADE = 0.6;
const UA = { "User-Agent": "warszawa-official-social/0.1 (github.com/maciejtzawadzki-bit/warszawa-official-social)" };

async function photoFile(src, dir, i) {
  if (!/^https?:\/\//.test(src)) return path.resolve(ROOT, src);
  const res = await fetch(src, { headers: UA });
  if (!res.ok) throw new Error(`Nie pobrano zdjęcia (${res.status}): ${src}`);
  const file = path.join(dir, `foto-${i}.jpg`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "ignore", "inherit"] });

export async function renderReel(post, outDir) {
  const slides = post.slides.filter((s) => s.image || s.ig);
  if (!slides.length) throw new Error("Rolka wymaga co najmniej jednego slajdu ze zdjęciem");
  const tmp = path.join(os.tmpdir(), `rolka-${post.id}`);
  await mkdir(tmp, { recursive: true });
  await mkdir(outDir, { recursive: true });
  const seconds = post.reelSeconds ?? (slides.length === 1 ? 10 : 3.2);

  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const clips = [];
  for (const [i, slide] of slides.entries()) {
    await page.setContent(slideHtml(slide, "story", i, slides.length, null, { overlay: true }), { waitUntil: "load" });
    await page.evaluate(async () => { await document.fonts.ready; window.__fit?.(); });
    const layer = path.join(tmp, `napis-${i}.png`);
    await page.screenshot({ path: layer, omitBackground: true });
    const photo = await photoFile(await slideImage(slide), tmp, i);
    const frames = Math.round(seconds * FPS);
    const clip = path.join(tmp, `klip-${i}.mp4`);
    // Zdjęcie skalowane z zapasem (płynniejsze przybliżenie), kadr wg pola `focus` uproszczony do środka.
    ff("-i", photo, "-loop", "1", "-i", layer, "-filter_complex",
      `[0:v]scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},` +
      `zoompan=z='min(1+0.10*on/${frames},1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS}[bg];` +
      `[bg][1:v]overlay=0:0:shortest=1,format=yuv420p[v]`,
      "-map", "[v]", "-frames:v", String(frames), "-c:v", "libx264", "-preset", "medium", "-crf", "20", clip);
    clips.push(clip);
  }
  await browser.close();

  const out = path.join(outDir, "rolka.mp4");
  if (clips.length === 1) {
    ff("-i", clips[0], "-c", "copy", "-movflags", "+faststart", out);
  } else {
    const inputs = clips.flatMap((c) => ["-i", c]);
    let chain = "";
    let last = "[0:v]";
    for (let i = 1; i < clips.length; i += 1) {
      const offset = (seconds - FADE) * i;
      const label = i === clips.length - 1 ? "[v]" : `[x${i}]`;
      chain += `${last}[${i}:v]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(2)}${label};`;
      last = label;
    }
    ff(...inputs, "-filter_complex", chain.replace(/;$/, ""), "-map", "[v]", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out);
  }
  ff("-i", out, "-frames:v", "1", "-q:v", "3", path.join(outDir, "okladka.jpg"));
  const tags = (post.tags ?? []).join(" ");
  await writeFile(path.join(outDir, "opis.txt"), `${post.caption ?? ""}\n${tags ? `\nOznacz: ${tags}\n` : ""}`);
  await rm(tmp, { recursive: true, force: true });
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, out] = process.argv.slice(2);
  if (!input) {
    console.error("Użycie: node tools/reel.mjs <post.json> [katalog-wyjściowy]");
    process.exit(1);
  }
  const post = JSON.parse(await readFile(input, "utf8"));
  console.log(await renderReel(post, out ?? path.join(ROOT, "reels", post.id)));
}
