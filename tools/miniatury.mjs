// Miniatury slajdów dla panelu KMZ: media/mini/<id>-NN-<skrót>.jpg (360 px szerokości, kilkadziesiąt KB zamiast 1–2 MB PNG).
// Skrót treści PNG w nazwie: po „Zmień” i nowym renderze panel od razu dostaje nową miniaturę, mimo pamięci CDN.
// Pełny slajd panel wylicza z nazwy miniatury: media/mini/<id>-NN-<skrót>.jpg → media/<id>-NN.png.
// Wywołuje go plan.mjs; Chromium uruchamia tylko wtedy, gdy jakiejś miniatury brakuje.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";

const SZEROKOSC = 360;

export function nazwaMiniatury(png) {
  const skrot = createHash("sha1").update(readFileSync(png)).digest("hex").slice(0, 8);
  return `${path.basename(png, ".png")}-${skrot}.jpg`;
}

export async function miniatury(pngi, katalog) {
  mkdirSync(katalog, { recursive: true });
  const pary = pngi.map((png) => ({ png, mini: path.join(katalog, nazwaMiniatury(png)) }));
  // Miniatury starszych wersji tych samych slajdów.
  const obecne = readdirSync(katalog);
  for (const { png, mini } of pary) {
    const baza = `${path.basename(png, ".png")}-`;
    for (const f of obecne)
      if (f.startsWith(baza) && /^[0-9a-f]{8}\.jpg$/.test(f.slice(baza.length)) && path.join(katalog, f) !== mini) unlinkSync(path.join(katalog, f));
  }
  const brak = pary.filter((p) => !existsSync(p.mini));
  if (brak.length) {
    const { chromium } = await import("playwright-core");
    const { chromiumPath } = await import("./render.mjs");
    const browser = await chromium.launch({ executablePath: chromiumPath() });
    try {
      const page = await browser.newPage({ viewport: { width: SZEROKOSC, height: SZEROKOSC * 2 }, deviceScaleFactor: 1 });
      for (const { png, mini } of brak) {
        const dane = readFileSync(png).toString("base64");
        await page.setContent(`<body style="margin:0"><img id="s" style="display:block;width:${SZEROKOSC}px" src="data:image/png;base64,${dane}"></body>`, { waitUntil: "load" });
        await page.locator("#s").screenshot({ path: mini, type: "jpeg", quality: 72 });
      }
    } finally {
      await browser.close();
    }
  }
  return pary.map((p) => p.mini);
}
