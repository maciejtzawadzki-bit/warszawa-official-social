// Spis kolejki dla panelu KMZ (dział Warszawa Official): plan.json w katalogu głównym repozytorium.
// Użycie: node tools/plan.mjs  (wywołują go run.mjs, reakcje.mjs i tryb 2; panel KMZ czyta plik z raw.githubusercontent.com).
// Tylko pola do pokazania: id, data, godzina, typ, rubryka, status, pierwsza linia i pełny opis, adresy miniatur
// wyrenderowanych slajdów (media/mini/, tools/miniatury.mjs; tylko slajdy, które już leżą w media/), permalink oraz uwagi
// z kontroli zgodności z zasadami (tools/kontrola.mjs; tylko przy postach jeszcze nieopublikowanych).
import "./siec.mjs";
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uwagiPosta } from "./kontrola.mjs";
import { miniatury } from "./miniatury.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = path.join(ROOT, "queue");
const MEDIA = path.join(ROOT, "media");
const RAW = "https://raw.githubusercontent.com/maciejtzawadzki-bit/warszawa-official-social/main/media";

// Panel pokazuje plan od wczoraj do 3 tygodni naprzód; starszym postom miniatur nie robimy.
const OD = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

async function obrazy(p) {
  if (p.video || !(p.date >= OD)) return [];
  const pngi = (p.slides ?? [])
    .map((_, i) => path.join(MEDIA, `${p.id}-${String(i + 1).padStart(2, "0")}.png`))
    .filter((f) => existsSync(f));
  if (!pngi.length) return [];
  try {
    return (await miniatury(pngi, path.join(MEDIA, "mini"))).map((f) => `${RAW}/mini/${path.basename(f)}`);
  } catch (error) {
    // Bez Chromium (np. bez npm install) panel dostaje pełne PNG: cięższe, ale działa.
    console.error(`Miniatury ${p.id}: ${error.message}`);
    return pngi.map((f) => `${RAW}/${path.basename(f)}`);
  }
}

export async function writePlan() {
  const files = (await readdir(QUEUE)).filter((f) => f.endsWith(".json")).sort();
  const kolejka = await Promise.all(files.map(async (f) => JSON.parse(await readFile(path.join(QUEUE, f), "utf8"))));
  const posty = [];
  for (const p of kolejka) {
    posty.push({
      id: p.id,
      date: p.date,
      time: p.time ?? null,
      type: p.type ?? null,
      rubric: p.rubric ?? null,
      status: p.status ?? null,
      naglowek: String(p.caption ?? "").split("\n")[0].slice(0, 160),
      podpis: String(p.caption ?? "").slice(0, 2400),
      obrazy: await obrazy(p),
      permalink: p.permalink ?? null,
      uwagi: p.status === "published" ? [] : uwagiPosta(p, kolejka),
    });
  }
  posty.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const out = path.join(ROOT, "plan.json");
  await writeFile(out, `${JSON.stringify({ zaktualizowano: new Date().toISOString(), posty }, null, 2)}\n`);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(await writePlan());
