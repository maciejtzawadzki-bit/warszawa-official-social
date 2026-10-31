// Nieaktualna informacja w poście, który już wyszedł (z:727 biura KMZ, 31.10.2026; księga C.20: korekta po publikacji to
// osobne działanie za zgodą Macieja): automat nie poprawia posta i nie zostawia samej uwagi w wyniku, tylko zakłada zadanie
// działu Warszawa „przygotuj korektę do zgody Macieja”. Dział (dyżur w biurze) sprawdza stan u organizatora i daje Maciejowi
// kartę z gotowym zdaniem do podmiany w aplikacji. Biuro samo łączy zgłoszenia: ta sama informacja raz, nowa informacja
// w tym samym poście do jego otwartego zadania; tylko post z planu konta, najwyżej 3 zadania na post i 5 dziennie.
// Użycie:
//   node tools/korekta.mjs <id posta z queue/> "co jest nieaktualne i jak jest teraz, jedno zdanie" [adres źródła https]
//     [--do RRRR-MM-DD]   (ostatni dzień, w którym korekta ma sens, np. dzień wydarzenia; bez niego biuro daje 2 dni)
// Klucz w KMZ_WARSZAWA_SEKRET (nigdy go nie wypisuj); bez niego, bez sieci albo przy złych argumentach skrypt tylko to
// zgłasza i kończy z kodem 0, żeby nie zatrzymać trybu. Wypisuje „KOREKTA: …”: przepisz to zdanie do wyniku trybu.
import "./siec.mjs";
import { readFile } from "node:fs/promises";

const ADRES = "https://mnpjvkieetcrqzswxwqt.supabase.co/functions/v1/panel?warszawa_korekta";

const argumenty = process.argv.slice(2);
const i = argumenty.indexOf("--do");
const termin = i >= 0 ? argumenty.splice(i, 2)[1]?.trim() || null : null;
const [post, co, zrodlo] = argumenty;
const nie = (powod, dalej = "zgłoś ją w wyniku jako pytanie do Macieja (zasady w CLAUDE.md)") => {
  console.log(`KOREKTA: nie założono zadania (${powod}); ${dalej}.`);
  process.exit(0);
};
if (!post || !/^20\d{2}-\d{2}-\d{2}-[a-z0-9-]{1,80}$/.test(post) || !co || co.trim().length < 10) {
  nie('użycie: node tools/korekta.mjs <id posta> "co jest nieaktualne i jak jest teraz" [źródło https] [--do RRRR-MM-DD]');
}
if (zrodlo && !/^https:\/\/\S{4,300}$/.test(zrodlo)) nie("źródło musi być adresem https");
if (termin && !/^20\d{2}-\d{2}-\d{2}$/.test(termin)) nie("--do musi mieć postać RRRR-MM-DD");
let wpis;
try {
  wpis = JSON.parse(await readFile(new URL(`../queue/${post}.json`, import.meta.url), "utf8"));
} catch {
  nie(`nie ma posta queue/${post}.json`);
}
if (wpis.status !== "published") nie(`post ${post} nie jest opublikowany (status ${wpis.status})`, "przed publikacją poprawki należą do trybu 2, co najmniej 12 godzin przed postem");
if (!process.env.KMZ_WARSZAWA_SEKRET) nie("brak zmiennej KMZ_WARSZAWA_SEKRET");
const link = typeof wpis.permalink === "string" && /^https:\/\/www\.instagram\.com\/(p|reel)\/[A-Za-z0-9_-]{5,40}\/?$/.test(wpis.permalink)
  ? wpis.permalink : null;
try {
  const r = await fetch(ADRES, {
    method: "POST",
    headers: { "x-kmz-warszawa": process.env.KMZ_WARSZAWA_SEKRET, "Content-Type": "application/json" },
    body: JSON.stringify({ post, link, co: co.trim().slice(0, 800), zrodlo: zrodlo || null, termin }),
    signal: AbortSignal.timeout(20_000),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) nie(`HTTP ${r.status}${d.blad ? `, ${d.blad}` : ""}`);
  if (d.nowe) console.log(`KOREKTA: założono zadanie działu z:${d.zadanie} (${post}).`);
  else if (d.zadanie) console.log(`KOREKTA: zadanie z:${d.zadanie} już jest (${d.powod ?? "ten sam post"}); nowego nie trzeba.`);
  else console.log(`KOREKTA: bez zadania (${d.powod ?? "biuro nie podało powodu"}).`);
} catch (e) {
  nie(String(e?.message ?? e).slice(0, 120));
}
