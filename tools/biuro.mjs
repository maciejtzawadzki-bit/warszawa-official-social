// Wynik trybu do biura KMZ (jeden stan, D-111 biura, 15.10.2026): po każdym trybie 1, 2 i 3 automat zapisuje w panelu
// KMZ, co zrobił, zaraz po przebiegu (wcześniej panel i IGOR widzieli to dopiero rano, ze zbiórki o 8:53).
// Użycie (ostatni krok każdego trybu, zawsze, także gdy nic nie opublikowano albo był błąd):
//   node tools/biuro.mjs <publikacja|research|plan|rolki> <ok|blad|czeka> "jedno zdanie po polsku, z liczbami" [link https]
//     [--pytanie "pytanie tak/nie do Macieja"] [--krok "co Warszawa zrobi po »Tak«"]
// Od 28.10.2026 (karta decyzji w panelu KMZ, zgoda Macieja: „masz moja zgode”): przy `czeka` pytanie do Macieja i krok
// po „Tak” (jedno zdanie każde); z krokiem przycisk „Tak” w panelu zleca go działowi Warszawa. Podsumowanie do 2000 znaków
// (panel pokazuje całe), pytanie do 500, krok do 300.
// Klucz w KMZ_WARSZAWA_SEKRET (nigdy go nie wypisuj); bez niego, bez sieci albo przy złych argumentach skrypt tylko to
// zgłasza i kończy z kodem 0, żeby nie zatrzymać trybu. Bez danych osobowych w zdaniu.
import "./siec.mjs";

const ADRES = "https://mnpjvkieetcrqzswxwqt.supabase.co/functions/v1/panel?automat_wynik";
const ZADANIA = {
  publikacja: "warszawa_official: publikacja",
  research: "warszawa_official: research",
  plan: "warszawa_official: plan tygodnia",
  rolki: "warszawa_official: rolki",
};

// Flagi --pytanie i --krok w dowolnym miejscu po argumentach; reszta to argumenty jak dotąd.
const argumenty = process.argv.slice(2);
const flaga = (nazwa) => {
  const i = argumenty.indexOf(nazwa);
  if (i < 0) return null;
  const [, wartosc] = argumenty.splice(i, 2);
  return wartosc?.trim() || null;
};
const pytanie = flaga("--pytanie");
const krok = flaga("--krok");
const [co, status, podsumowanie, link] = argumenty;
if (!ZADANIA[co] || !["ok", "blad", "czeka"].includes(status) || !podsumowanie) {
  console.log('Biuro KMZ: użycie: node tools/biuro.mjs <publikacja|research|plan|rolki> <ok|blad|czeka> "zdanie" [link] [--pytanie "…"] [--krok "…"]; wyniku nie zapisano.');
  process.exit(0);
}
if (!process.env.KMZ_WARSZAWA_SEKRET) {
  console.log("Biuro KMZ: brak zmiennej KMZ_WARSZAWA_SEKRET, wyniku nie zapisano.");
  process.exit(0);
}
try {
  const r = await fetch(ADRES, {
    method: "POST",
    headers: { "x-kmz-warszawa": process.env.KMZ_WARSZAWA_SEKRET, "Content-Type": "application/json" },
    body: JSON.stringify({
      zadanie: ZADANIA[co], status, podsumowanie: podsumowanie.slice(0, 2000), link: link?.startsWith("https://") ? link : null,
      ...(pytanie ? { pytanie: pytanie.slice(0, 500) } : {}),
      ...(krok ? { krok: krok.slice(0, 300) } : {}),
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const d = await r.json().catch(() => ({}));
  console.log(r.ok ? "Biuro KMZ: wynik zapisany." : `Biuro KMZ: nie zapisano (HTTP ${r.status}${d.blad ? `, ${d.blad}` : ""}).`);
} catch (e) {
  console.log(`Biuro KMZ: nie zapisano (${String(e?.message ?? e).slice(0, 120)}).`);
}
