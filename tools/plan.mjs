// Spis kolejki dla panelu KMZ (dział Warszawa Official): plan.json w katalogu głównym repozytorium.
// Użycie: node tools/plan.mjs  (wywołują go run.mjs i tryb 2; panel KMZ czyta plik z raw.githubusercontent.com).
// Tylko pola do pokazania: id, data, godzina, typ, rubryka, status, pierwsza linia opisu, permalink.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = path.join(ROOT, "queue");

export async function writePlan() {
  const files = (await readdir(QUEUE)).filter((f) => f.endsWith(".json")).sort();
  const posty = [];
  for (const f of files) {
    const p = JSON.parse(await readFile(path.join(QUEUE, f), "utf8"));
    posty.push({
      id: p.id,
      date: p.date,
      time: p.time ?? null,
      type: p.type ?? null,
      rubric: p.rubric ?? null,
      status: p.status ?? null,
      naglowek: String(p.caption ?? "").split("\n")[0].slice(0, 160),
      permalink: p.permalink ?? null,
    });
  }
  posty.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const out = path.join(ROOT, "plan.json");
  await writeFile(out, `${JSON.stringify({ zaktualizowano: new Date().toISOString(), posty }, null, 2)}\n`);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(await writePlan());
