// Reakcje właściciela z panelu KMZ (dział Warszawa Official): „Wstrzymaj”, „Wznów” i „Zmień…” przy postach z planu.
// Użycie (na początku trybów 1–3, zawsze przed run.mjs):
//   node tools/reakcje.mjs                         odbiera reakcje: wstrzymaj → vetoed, wznów → planned (tylko z vetoed),
//                                                  commit i push kolejki, potwierdza w panelu; „zmień” wypisuje jako
//                                                  ZMIEŃ #nr <post>: <uwaga> do wykonania przez agenta
//   node tools/reakcje.mjs --potwierdz 12 "opis"   po wykonaniu „zmień”: potwierdza reakcję nr 12 krótkim opisem
//   node tools/reakcje.mjs --dry-run               tylko wypisuje, nic nie zmienia
// run.mjs wywołuje odbierzReakcje() sam przed publikacją i nie publikuje posta, przy którym czeka „zmień”.
// Klucz w zmiennej KMZ_WARSZAWA_SEKRET (nigdy go nie wypisuj); bez niej albo bez sieci skrypt tylko to zgłasza i kończy
// z kodem 0, żeby nie zatrzymać publikacji.
import "./siec.mjs";
import { execFileSync } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writePlan } from "./plan.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = path.join(ROOT, "queue");
const ADRES = "https://mnpjvkieetcrqzswxwqt.supabase.co/functions/v1/panel?instagram_reakcje";

async function panel(method, body) {
  const r = await fetch(ADRES, {
    method,
    headers: { "x-kmz-warszawa": process.env.KMZ_WARSZAWA_SEKRET, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`HTTP ${r.status}${d.blad ? ` (${d.blad})` : ""}`);
  return d;
}

function git(...cmd) {
  return execFileSync("git", ["-C", ROOT, ...cmd], { encoding: "utf8" }).trim();
}

function pushWithRetry() {
  for (const wait of [0, 2, 4, 8, 16]) {
    if (wait) execFileSync("sleep", [String(wait)]);
    try {
      git("pull", "--rebase", "-q", "origin", "main");
      git("push", "-q", "origin", "HEAD:main");
      return;
    } catch (error) {
      if (wait === 16) throw error;
    }
  }
}

function dzisWarszawa() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(new Date());
}

/** Odbiera reakcje z panelu i stosuje wstrzymaj/wznów; zwraca reakcje „zmień” czekające na agenta. */
export async function odbierzReakcje({ dryRun = false } = {}) {
  if (!process.env.KMZ_WARSZAWA_SEKRET) {
    console.log("Reakcje z panelu KMZ: brak zmiennej KMZ_WARSZAWA_SEKRET, pomijam.");
    return [];
  }
  let reakcje;
  try {
    ({ reakcje = [] } = await panel("GET"));
  } catch (error) {
    console.log(`Reakcje z panelu KMZ: panel niedostępny (${error.message}). Publikuję bez nich; zgłoś to w odpowiedzi.`);
    return [];
  }
  if (!reakcje.length) {
    console.log("Reakcje z panelu KMZ: brak nowych.");
    return [];
  }

  const kolejka = new Map();
  for (const f of (await readdir(QUEUE)).filter((f) => f.endsWith(".json"))) {
    const post = JSON.parse(await readFile(path.join(QUEUE, f), "utf8"));
    kolejka.set(post.id, { file: path.join(QUEUE, f), post });
  }

  const dzis = dzisWarszawa();
  const zastosowane = [];
  const doZmiany = [];
  const zmienione = new Set();
  for (const r of reakcje) {
    const item = kolejka.get(r.post_id);
    if (!item) {
      zastosowane.push({ id: r.id, wynik: "nie ma takiego posta w kolejce" });
      continue;
    }
    const { post } = item;
    if (post.status === "published") {
      zastosowane.push({ id: r.id, wynik: "już opublikowany; usunąć albo poprawić można tylko w aplikacji Instagram" });
    } else if (r.reakcja === "wstrzymaj") {
      if (post.status === "planned" || post.status === "error") {
        post.status = "vetoed";
        zmienione.add(post.id);
        zastosowane.push({ id: r.id, wynik: "wstrzymany" });
      } else zastosowane.push({ id: r.id, wynik: `bez zmian (status ${post.status})` });
    } else if (r.reakcja === "wznow") {
      if (post.status === "vetoed") {
        post.status = "planned";
        zmienione.add(post.id);
        zastosowane.push({ id: r.id, wynik: post.date < dzis ? "wznowiony; termin minął, wyjdzie przy najbliższym uruchomieniu (do 3 dni wstecz)" : "wznowiony" });
      } else zastosowane.push({ id: r.id, wynik: `bez zmian (status ${post.status})` });
    } else {
      doZmiany.push(r);
    }
  }

  for (const r of reakcje) {
    const z = zastosowane.find((x) => x.id === r.id);
    console.log(`Reakcja z panelu #${r.id} ${r.reakcja} ${r.post_id}: ${z ? z.wynik : "do zrobienia przez agenta"}`);
  }

  if (!dryRun && zmienione.size) {
    for (const id of zmienione) {
      const item = kolejka.get(id);
      await writeFile(item.file, `${JSON.stringify(item.post, null, 2)}\n`);
    }
    await writePlan();
    git("add", "queue", "plan.json", "media");
    git("commit", "-q", "-m", `panel KMZ: reakcje właściciela (${[...zmienione].join(", ")})`);
    pushWithRetry();
  }
  if (!dryRun && zastosowane.length) await panel("POST", { zastosowane });

  for (const r of doZmiany) console.log(`ZMIEŃ #${r.id} ${r.post_id}: ${r.uwaga}`);
  if (doZmiany.length)
    console.log('Każdą zmianę wykonaj przed publikacją (CLAUDE.md, „Weto”), potem: node tools/reakcje.mjs --potwierdz <nr> "co zrobiono".');
  return doZmiany;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes("--potwierdz")) {
    const [nr, ...opis] = args.slice(args.indexOf("--potwierdz") + 1);
    if (!/^\d+$/.test(nr ?? "")) throw new Error('Użycie: node tools/reakcje.mjs --potwierdz <nr> "co zrobiono"');
    if (!process.env.KMZ_WARSZAWA_SEKRET) throw new Error("Brak zmiennej KMZ_WARSZAWA_SEKRET.");
    const d = await panel("POST", { zastosowane: [{ id: Number(nr), wynik: opis.join(" ").slice(0, 300) || "zmienione" }] });
    console.log(`Potwierdzono reakcję #${nr} (${d.potwierdzone ?? 0}).`);
  } else {
    await odbierzReakcje({ dryRun: args.includes("--dry-run") });
  }
}
