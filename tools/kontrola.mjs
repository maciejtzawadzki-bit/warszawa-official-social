// Kontrola zgodności posta z zasadami konta (CLAUDE.md, docs/STRATEGIA.md): krótkie uwagi do pokazania w panelu KMZ
// przy postach z planu (Maciej 14.10: „będę w panelu zaglądał”). Tylko ostrzega, niczego nie blokuje. Sprawdza to, co
// da się zmierzyć; gustu i trafności doboru nie oceni.
// Użycie: node tools/kontrola.mjs   (uwagi dla wszystkich niepublikowanych postów z kolejki)
//         node tools/kontrola.mjs reels/<katalog>/rolka.json   (tylko podane pliki, np. rolka z trybu 3)
import "./siec.mjs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Dni uroczyste z docs/KALENDARZ_ZRODLA.md (MM-DD): bez korony, żartów i współautorstwa.
const UROCZYSTE = { "01-17": "17.01", "04-19": "19.04", "07-22": "22.07", "08-01": "1.08 (Godzina W)", "08-05": "5.08 (rzeź Woli)", "10-02": "2.10", "11-16": "16.11 (zamknięcie getta)", "11-01": "1.11", "11-02": "2.11" };
const ZARTOBLIWE = /👸|😂|🤣|😜|😉|🎉|🥳|🍾|😎|🤪|💃/u;
const ZAKAZANE = [
  [/link w bio/i, "„link w bio”"], [/udostępnij/i, "„udostępnij”"], [/\bzapisz(cie)?\b(?! się)/i, "„zapisz”"],
  [/słoik/i, "„słoiki” (bez wyśmiewania przyjezdnych)"], [/kliknij/i, "„kliknij”"],
  [/z klasą/i, "„z klasą” (zużyte, Maciej 27.10)"]
];
const PROMOCJE = /promocj|rabat|zniżk|wyprzedaż|-\d{2}\s?%|otwarcie (sklepu|marketu|galerii handlowej)/i;
const EMOTKA_NA_POCZATKU = /^\p{Extended_Pictographic}/u;
// Akapit po angielsku: więcej angielskich słów funkcyjnych niż polskich (nazwy własne jak Zachęta nie przeszkadzają).
const SLOWA_EN = /\b(the|and|of|in|for|with|at|this|a|an|is|to|on|from|kids|free)\b/gi;
const SLOWA_PL = /(^|[\s(„])(w|i|z|na|do|dla|się|nie|jest|oraz|od|po|we|ze|u)(?=[\s,.)!?”]|$)/gi;
const poAngielsku = (a) => {
  const en = (a.match(SLOWA_EN) ?? []).length;
  return en >= 3 && en > (a.match(SLOWA_PL) ?? []).length;
};

// Nagłówek i puenta mają być za każdym razem nowe (Maciej 27.10: „co chwila podobne opisy”): porównujemy pary słów
// z postami z ±3 tygodni. Pary z samych słów funkcyjnych („i w”, „a z”) się nie liczą.
const FUNKCYJNE = new Set("a i w z na do dla się nie jest o od po we ze u ale to ja mnie mi co już tak jak".split(" "));
const pary = (t) => {
  const s = t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  return s.slice(1).map((w, i) => [s[i], w]).filter(([a, b]) => !(FUNKCYJNE.has(a) && FUNKCYJNE.has(b))).map((x) => x.join(" "));
};
const wspolne = (a, b) => { const B = new Set(pary(b)); return pary(a).find((x) => B.has(x)); };
// Seria „Weekend u mnie” zaczyna się zawsze tak samo (Maciej 27.10: „to była jakby seria”); porównujemy to, co po niej.
const SERIA = /^co u mnie w weekend\?\s*/i;
// Puenta: ostatni akapit przed angielskim, który nie jest pozycją listy.
const puenta = (akapity, en) => akapity.slice(1, en < 0 ? undefined : en).filter((a) => !EMOTKA_NA_POCZATKU.test(a)).at(-1) ?? "";
const czesci = (p) => {
  const akapity = String(p.caption ?? "").split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean);
  const en = akapity.findIndex((a, i) => i > 0 && !a.startsWith("#") && poAngielsku(a));
  return { naglowek: String(p.caption ?? "").split("\n")[0].trim().replace(SERIA, ""), puenta: puenta(akapity, en) };
};

const krotko = (t, n = 40) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

export function uwagiPosta(post, wszystkie = []) {
  const uwagi = [];
  const opis = String(post.caption ?? "");
  const akapity = opis.split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean);
  const start = post.rubric === "Start konta";
  const feed = post.type !== "story";

  if (!start && !(post.source ?? []).length) uwagi.push("brak źródła u organizatora (pole source)");

  const naglowek = opis.split("\n")[0].trim();
  if (!naglowek) uwagi.push("opis bez nagłówka w pierwszej linii");
  else if (naglowek.length > 90) uwagi.push(`nagłówek za długi (${naglowek.length} znaków)`);
  const en = akapity.findIndex((a, i) => i > 0 && !a.startsWith("#") && poAngielsku(a));
  if (feed && en < 0) uwagi.push("brak 1–2 zdań po angielsku");
  if (!/#warszawa\s+#warszawaofficial/i.test(opis)) uwagi.push("brak hasztagów #warszawa #warszawaofficial");
  if (opis.length > 2200) uwagi.push(`opis za długi dla Instagrama (${opis.length}/2200)`);
  if ((opis.match(/#\w+/g) ?? []).length > 30) uwagi.push("ponad 30 hasztagów");
  if (post.type === "reel" && opis.length > 800) uwagi.push(`rolka: opis za długi (${opis.length}/800: nagłówek, 3–5 krótkich pozycji, EN)`);

  if (feed && !start) {
    const moje = czesci(post);
    const t0 = Date.parse(post.date);
    if (SERIA.test(naglowek) && !moje.naglowek.replace(/\p{Extended_Pictographic}/gu, "").trim()) uwagi.push("seria „Co u mnie w weekend?”: dopisz w tej linii, co w tym weekendzie najciekawsze");
    const sasiednie = wszystkie.filter((p) => p.id !== post.id && p.id !== post.zastepuje && p.zastapiony !== post.id && p.type !== "story" && p.rubric !== "Start konta" && ["planned", "published"].includes(p.status) && Math.abs(Date.parse(p.date) - t0) <= 21 * 86_400_000);
    for (const [co, tekst] of [["nagłówek", moje.naglowek], ["puenta", moje.puenta]]) {
      if (!tekst) continue;
      for (const p of sasiednie) {
        const inne = czesci(p);
        const zwrot = wspolne(tekst, inne.naglowek) ?? wspolne(tekst, inne.puenta);
        if (zwrot) { uwagi.push(`${co} powtarza „${zwrot}” z ${p.id}`); break; }
      }
    }
  }

  for (const [re, co] of ZAKAZANE) if (re.test(opis)) uwagi.push(`w opisie ${co}`);
  if (PROMOCJE.test(opis)) uwagi.push("promocje i otwarcia sklepów to nie nasz temat");
  if (/\bnie dla\b/i.test(opis)) uwagi.push("„nie dla…”: nie piszemy, dla kogo coś nie jest");
  if (/\bmecz/i.test(opis) && !/łazienkowsk|stadion(ie)? legii/i.test(opis)) uwagi.push("mecz: tylko domowe w Warszawie (brak Łazienkowskiej)");

  // Pozycje listy: akapity od emotki przed częścią angielską; każda z @organizatorem.
  const lista = akapity.slice(1, en < 0 ? undefined : en).filter((a) => EMOTKA_NA_POCZATKU.test(a));
  for (const a of lista) if (!a.includes("@")) uwagi.push(`pozycja bez @organizatora: ${krotko(a.replace(EMOTKA_NA_POCZATKU, "").trim())}`);
  // Rolka o 3–5 wydarzeniach (Maciej 30.10: „na jedno są wtedy nudne”): pozycje opisu i klatki po zapowiedzi.
  if (post.type === "reel") {
    const klatki = (post.slides ?? []).filter((s) => s.image || s.ig).length - 1;
    if (lista.length < 3 || lista.length > 5) uwagi.push(`rolka: wydarzenia w opisie: ${lista.length}, ma być 3–5`);
    else if (klatki !== lista.length) uwagi.push(`rolka: wydarzenia w opisie: ${lista.length}, klatki po zapowiedzi: ${Math.max(klatki, 0)}`);
  }

  const dzien = String(post.date ?? "").slice(5);
  if (UROCZYSTE[dzien]) {
    if (ZARTOBLIWE.test(opis)) uwagi.push(`dzień uroczysty ${UROCZYSTE[dzien]}: korona albo żartobliwe emotki`);
    if ((post.collab ?? []).length) uwagi.push(`dzień uroczysty ${UROCZYSTE[dzien]}: bez współautorstwa`);
  }
  if (dzien === "01-17" && /wyzwoleni/i.test(opis)) uwagi.push("17.01: bez słowa „wyzwolenie”");

  if ((post.collab ?? []).length > 3) uwagi.push(`współautorów ${post.collab.length}, Instagram przyjmie najwyżej 3`);
  if (post.type === "story" && (post.collab ?? []).length) uwagi.push("relacja nie może mieć współautorów");
  const slajdy = post.slides ?? [];
  if (slajdy.length > 10) uwagi.push(`${slajdy.length} slajdów, Instagram przyjmie najwyżej 10`);
  slajdy.forEach((s, i) => {
    if (s.layout === "repost" && (!s.credit || !(s.tags ?? []).length)) uwagi.push(`slajd ${i + 1}: grafika bez podpisu autora albo oznaczenia`);
    if (s.layout === "repost" && !String(s.title ?? "").trim()) uwagi.push(`slajd ${i + 1}: grafika bez czarnego podpisu (title: co to jest, sub: kiedy, gdzie, za ile)`);
  });

  if (feed && !start) {
    // Post zastępczy (pole `zastepuje`) i ten, który zastępuje, nie liczą się jako drugi post dnia.
    const tegoDnia = wszystkie.filter((p) => p.id !== post.id && p.id !== post.zastepuje && p.zastapiony !== post.id && p.date === post.date && p.type !== "story" && p.rubric !== "Start konta" && ["planned", "published"].includes(p.status));
    if (tegoDnia.length) uwagi.push(`drugi post w feedzie tego dnia (rytm: jeden), razem z ${tegoDnia[0].id}`);
  }
  const dni = (Date.now() - Date.parse(`${post.date}T${post.time ?? "12:00"}:00+02:00`)) / 86_400_000;
  if (post.status === "planned" && dni > 3) uwagi.push("termin minął ponad 3 dni temu, nie wyjdzie");

  // Najważniejsze najpierw: dni uroczyste, treść (zakazane, promocje, mecz), źródło i oznaczenia; potem forma.
  const waga = (u) => [/uroczyst|17\.01/, /w opisie|promocje|nie dla|mecz|powtarza/, /źródła|@organizatora/, /współaut|slajd|relacja/, /feedzie|termin/].findIndex((re) => re.test(u));
  return uwagi
    .map((u, i) => [u, i])
    .sort(([a, i], [b, j]) => ((waga(a) + 99) % 99) - ((waga(b) + 99) % 99) || i - j)
    .slice(0, 10)
    .map(([u]) => u.slice(0, 160));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const QUEUE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "queue");
  const posty = await Promise.all((await readdir(QUEUE)).filter((f) => f.endsWith(".json")).sort().map(async (f) => JSON.parse(await readFile(path.join(QUEUE, f), "utf8"))));
  // Z plikami w argumentach (np. rolka: reels/<katalog>/rolka.json) sprawdza tylko je, na tle kolejki.
  const pliki = process.argv.slice(2);
  const sprawdzane = pliki.length ? await Promise.all(pliki.map(async (f) => JSON.parse(await readFile(f, "utf8")))) : posty.filter((x) => x.status !== "published");
  for (const p of sprawdzane) {
    const u = uwagiPosta(p, posty);
    console.log(`${p.id}: ${u.length ? "" : "zgodny z zasadami"}`);
    for (const x of u) console.log(`  ⚠ ${x}`);
  }
}
