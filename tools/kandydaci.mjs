// Kandydaci z researchu dla panelu KMZ (dział Warszawa Official): właściciel wybiera albo skreśla ich, zanim powstanie plan.
// Decyzja właściciela 20.10.2026: „research w środę o 14:47, plan w czwartek o 14:47 z moimi wyborami”.
// Lista tygodnia leży w research/RRRR-MM-DD.json (data poniedziałku planowanego tygodnia), obok notatki .md.
// Użycie:
//   node tools/kandydaci.mjs sprawdz RRRR-MM-DD    tylko sprawdza plik (pola, wartości, długości), nic nie wysyła
//   node tools/kandydaci.mjs wgraj RRRR-MM-DD      tryb 2a (środa): sprawdza plik, uzupełnia klucze i wgrywa listę do panelu
//   node tools/kandydaci.mjs decyzje RRRR-MM-DD    tryb 2 (czwartek), przed układaniem planu: odbiera wybory właściciela,
//                                                  wypisuje WYBRANY/SKREŚLONY <klucz> i zapisuje je w pliku
//   node tools/kandydaci.mjs w-planie RRRR-MM-DD   tryb 2, po ułożeniu planu: kandydat, którego `zrodlo` jest w `source`
//                                                  posta z tego tygodnia, dostaje `w_planie`; zapis w pliku i w panelu
// Klucz w zmiennej KMZ_WARSZAWA_SEKRET (nigdy go nie wypisuj). Bez niej albo bez panelu skrypt tylko to zgłasza i kończy
// z kodem 0, żeby nie zatrzymać trybu; błędy w pliku kończą się kodem 1 (popraw plik i uruchom ponownie).
import "./siec.mjs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = path.join(ROOT, "queue");
const ADRES = "https://mnpjvkieetcrqzswxwqt.supabase.co/functions/v1/panel?warszawa_kandydaci";
const MAKS = 60;

const WARTOSCI = {
  dla_kogo: ["dorosli", "rodziny", "wszyscy"],
  rubryka: ["za_darmo", "z_dzieckiem", "weekend", "wieczor", "sport", "zapisy", "inne"],
  pewnosc: ["potwierdzone", "czesciowo", "niepotwierdzone"],
  ocena: ["do_planu", "rezerwa", "odrzucony"],
};
// pole: [czy wymagane, najwyżej znaków]
const TEKSTY = { co: [true, 120], kiedy: [true, 120], gdzie: [true, 160], cena: [false, 120], powod: [false, 160], zapisy: [false, 160] };

const plikTygodnia = (tydzien) => path.join(ROOT, "research", `${tydzien}.json`);

/** Klucz stały między wgraniami: nazwa bez polskich znaków i pierwszy dzień (decyzja właściciela trzyma się klucza). */
export function kluczZ(k) {
  const nazwa = String(k.co ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/Ł/g, "L")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
  return `${nazwa || "kandydat"}-${k.dzien}`;
}

/** Adres bez protokołu, „www.” i końcowego ukośnika: tak porównujemy `zrodlo` kandydata z `source` posta. */
export const adres = (u) => String(u ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");

/** Sprawdza listę tygodnia; zwraca listę błędów (pusta = w porządku) i uzupełnia brakujące klucze. */
export function sprawdz(dane, tydzien) {
  const bledy = [];
  if (dane?.tydzien !== tydzien) bledy.push(`pole tydzien ma być "${tydzien}" (poniedziałek planowanego tygodnia)`);
  if (new Date(`${tydzien}T12:00:00Z`).getUTCDay() !== 1) bledy.push(`${tydzien} to nie poniedziałek`);
  const lista = dane?.kandydaci;
  if (!Array.isArray(lista) || !lista.length) return [...bledy, "brak listy kandydaci"];
  if (lista.length > MAKS) bledy.push(`za dużo kandydatów: ${lista.length} (najwyżej ${MAKS})`);
  const klucze = new Set();
  lista.forEach((k, i) => {
    const gdzie = `kandydat ${i + 1}${k?.co ? ` („${String(k.co).slice(0, 40)}”)` : ""}`;
    if (!k || typeof k !== "object") return bledy.push(`${gdzie}: to nie obiekt`);
    for (const [pole, [wymagane, max]] of Object.entries(TEKSTY)) {
      const v = k[pole];
      if (v == null || v === "") {
        if (wymagane) bledy.push(`${gdzie}: brak pola ${pole}`);
      } else if (typeof v !== "string") bledy.push(`${gdzie}: ${pole} ma być tekstem`);
      else if (v.length > max) bledy.push(`${gdzie}: ${pole} dłuższe niż ${max} znaków`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(k.dzien ?? ""))) bledy.push(`${gdzie}: dzien ma być RRRR-MM-DD (pierwszy termin)`);
    for (const [pole, dozwolone] of Object.entries(WARTOSCI))
      if (!dozwolone.includes(k[pole])) bledy.push(`${gdzie}: ${pole} ma być jednym z: ${dozwolone.join(", ")}`);
    if (!/^https:\/\/\S+$/.test(String(k.zrodlo ?? "")) || String(k.zrodlo).length > 300)
      bledy.push(`${gdzie}: zrodlo ma być adresem https strony organizatora (do 300 znaków)`);
    if (k.ocena === "do_planu" && k.pewnosc !== "potwierdzone") bledy.push(`${gdzie}: do planu idzie tylko kandydat potwierdzony`);
    if (!k.klucz) k.klucz = kluczZ(k);
    if (!/^[a-z0-9-]{1,80}$/.test(k.klucz)) bledy.push(`${gdzie}: klucz tylko z małych liter, cyfr i „-”`);
    if (klucze.has(k.klucz)) bledy.push(`${gdzie}: klucz ${k.klucz} się powtarza`);
    klucze.add(k.klucz);
  });
  return bledy;
}

async function panel(method, { query = "", body } = {}) {
  const r = await fetch(`${ADRES}${query}`, {
    method,
    headers: { "x-kmz-warszawa": process.env.KMZ_WARSZAWA_SEKRET, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`HTTP ${r.status}${d.blad ? ` (${d.blad})` : ""}`);
  return d;
}

/** Wysyła do panelu albo zgłasza, dlaczego się nie dało; zwraca odpowiedź albo null (tryb idzie dalej). */
async function doPanelu(method, opcje, co) {
  if (!process.env.KMZ_WARSZAWA_SEKRET) {
    console.log(`Kandydaci w panelu KMZ: brak zmiennej KMZ_WARSZAWA_SEKRET, pomijam (${co}).`);
    return null;
  }
  try {
    return await panel(method, opcje);
  } catch (error) {
    console.log(`Kandydaci w panelu KMZ: panel niedostępny (${error.message}), pomijam (${co}); zgłoś to w wyniku.`);
    return null;
  }
}

const POLA = ["klucz", "co", "kiedy", "dzien", "gdzie", "cena", "dla_kogo", "rubryka", "zrodlo", "pewnosc", "ocena", "powod", "zapisy"];

async function wczytaj(tydzien) {
  const plik = plikTygodnia(tydzien);
  let dane;
  try {
    dane = JSON.parse(await readFile(plik, "utf8"));
  } catch (error) {
    console.log(`Nie mogę wczytać ${path.relative(ROOT, plik)}: ${error.message}`);
    process.exit(1);
  }
  const bledy = sprawdz(dane, tydzien);
  if (bledy.length) {
    console.log(`Błędy w ${path.relative(ROOT, plik)} (popraw i uruchom ponownie):\n- ${bledy.join("\n- ")}`);
    process.exit(1);
  }
  return { plik, dane };
}

const zapisz = (plik, dane) => writeFile(plik, `${JSON.stringify(dane, null, 2)}\n`);

/** Posty z kolejki z datą w tygodniu od poniedziałku `tydzien` (pon.–nd.). */
async function postyTygodnia(tydzien) {
  const koniec = new Date(Date.parse(`${tydzien}T12:00:00Z`) + 6 * 86_400_000).toISOString().slice(0, 10);
  const posty = [];
  for (const f of (await readdir(QUEUE)).filter((f) => f.endsWith(".json"))) {
    const post = JSON.parse(await readFile(path.join(QUEUE, f), "utf8"));
    if (post.date >= tydzien && post.date <= koniec && !post.usunieto) posty.push(post);
  }
  return posty;
}

async function main() {
  const [polecenie, tydzien] = process.argv.slice(2);
  if (!["sprawdz", "wgraj", "decyzje", "w-planie"].includes(polecenie) || !/^\d{4}-\d{2}-\d{2}$/.test(tydzien ?? "")) {
    console.log("Użycie: node tools/kandydaci.mjs <sprawdz|wgraj|decyzje|w-planie> RRRR-MM-DD (poniedziałek planowanego tygodnia)");
    process.exit(1);
  }
  const { plik, dane } = await wczytaj(tydzien);
  const ile = dane.kandydaci.length;

  if (polecenie === "sprawdz") {
    await zapisz(plik, dane);
    console.log(`Kandydaci ${tydzien}: plik w porządku (${ile}).`);
  } else if (polecenie === "wgraj") {
    await zapisz(plik, dane);
    const kandydaci = dane.kandydaci.map((k) => Object.fromEntries(POLA.map((p) => [p, k[p] ?? null])));
    const d = await doPanelu("POST", { body: { tydzien, kandydaci } }, "wgranie listy");
    if (d) console.log(`Kandydaci ${tydzien}: wgrani do panelu (${d.zapisane ?? ile}).`);
  } else if (polecenie === "decyzje") {
    const d = await doPanelu("GET", { query: `&tydzien=${tydzien}` }, "odbiór wyborów");
    if (!d) return console.log("Plan układasz bez wyborów właściciela; napisz to w wyniku.");
    const decyzje = new Map((d.kandydaci ?? []).filter((k) => k.decyzja).map((k) => [k.klucz, k]));
    for (const k of dane.kandydaci) {
      const x = decyzje.get(k.klucz);
      if (x) Object.assign(k, { decyzja: x.decyzja, decyzja_kiedy: x.decyzja_kiedy ?? null });
      else {
        delete k.decyzja;
        delete k.decyzja_kiedy;
      }
    }
    await zapisz(plik, dane);
    const z = dane.kandydaci.filter((k) => k.decyzja);
    if (!z.length) return console.log(`Kandydaci ${tydzien}: właściciel nic nie wybrał ani nie skreślił; wybierasz sam.`);
    for (const k of z) console.log(`${k.decyzja === "wybrany" ? "WYBRANY" : "SKREŚLONY"} ${k.klucz}: ${k.co} (${k.kiedy})`);
    const obce = [...decyzje.keys()].filter((kl) => !dane.kandydaci.some((k) => k.klucz === kl));
    if (obce.length) console.log(`Decyzje bez kandydata w pliku (zgłoś w wyniku): ${obce.join(", ")}`);
    console.log("WYBRANY idzie do planu, jeśli dalej jest potwierdzony i niewyprzedany (inaczej napisz w wyniku dlaczego); SKREŚLONY nie idzie nigdy.");
  } else {
    const posty = await postyTygodnia(tydzien);
    const w_planie = [];
    for (const k of dane.kandydaci) {
      const post = posty.find((p) => [p.source ?? []].flat().some((s) => adres(s) === adres(k.zrodlo)));
      if (post) {
        k.w_planie = post.id;
        w_planie.push({ klucz: k.klucz, post_id: post.id });
      } else delete k.w_planie;
    }
    await zapisz(plik, dane);
    const pominieci = dane.kandydaci.filter((k) => k.decyzja === "wybrany" && !k.w_planie);
    console.log(`Kandydaci ${tydzien}: w planie ${w_planie.length} z ${ile}.`);
    if (pominieci.length) console.log(`Wybrani przez właściciela, a nie w planie (napisz w wyniku dlaczego): ${pominieci.map((k) => k.klucz).join(", ")}`);
    const d = await doPanelu("POST", { body: { tydzien, w_planie } }, "zapis w_planie");
    if (d) console.log("Kandydaci: w_planie zapisane w panelu.");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
