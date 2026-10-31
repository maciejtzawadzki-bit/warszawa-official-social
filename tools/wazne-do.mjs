// Data ważności karty „czeka” w panelu KMZ (z:727 biura, 31.10.2026): chwila, po której decyzja Macieja nic już nie
// zmienia; po niej panel sam zamyka kartę. Automat podaje ją czasem polskim („RRRR-MM-DD HH:MM”), a ta funkcja zamienia ją
// na chwilę ISO w UTC (zima +1, lato +2, z bazy stref Node'a), żeby pomyłka o godzinę przy zmianie czasu była niemożliwa.
// Pełna chwila ISO ze strefą (np. 2026-11-01T15:00:00+01:00) przechodzi bez zmian. Zły zapis albo godzina, której w Polsce
// nie ma (przestawienie zegarów w marcu): null.

const czesci = (ms) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Warsaw", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
  );
const przesuniecie = (ms) => {
  const c = czesci(ms);
  return Date.UTC(+c.year, +c.month - 1, +c.day, +c.hour, +c.minute) - Math.floor(ms / 60_000) * 60_000;
};

export const naChwile = (tekst) => {
  const t = String(tekst ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(t)) {
    // Date.parse przesuwa 31.11 na 1.12 (atak Codexa 31.10): dzień i godzina muszą istnieć w kalendarzu.
    const [r, mies, d, g, min] = [t.slice(0, 4), t.slice(5, 7), t.slice(8, 10), t.slice(11, 13), t.slice(14, 16)].map(Number);
    const k = new Date(Date.UTC(r, mies - 1, d, g, min));
    if (k.getUTCMonth() !== mies - 1 || k.getUTCDate() !== d || k.getUTCHours() !== g || k.getUTCMinutes() !== min) return null;
    const ms = Date.parse(t);
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
  }
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
  if (!m) return null;
  const jakoUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let ms = jakoUtc - przesuniecie(jakoUtc);
  ms = jakoUtc - przesuniecie(ms);
  const c = czesci(ms);
  if (`${c.year}-${c.month}-${c.day} ${c.hour}:${c.minute}` !== `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}`) return null;
  return new Date(ms).toISOString();
};

// Ta sama granica co w panelu KMZ: nie wcześniej niż 10 minut temu, nie dalej niż 62 dni.
export const wGranicach = (iso, teraz = Date.now()) => {
  const ms = Date.parse(iso);
  return ms >= teraz - 10 * 60_000 && ms <= teraz + 62 * 86_400_000;
};

// Rolka bez --wazne-do (polecenie wyzwalacza może podawać starą komendę): rolki są o weekendzie, więc karta ważna do
// niedzieli po dacie katalogu rolki (reels/RRRR-MM-DD-…), 18:00 czasu polskiego. Bez daty w linku: null.
export const domyslnaRolki = (link) => {
  const m = String(link ?? "").match(/\/reels\/(\d{4})-(\d{2})-(\d{2})-/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7));
  return naChwile(`${d.toISOString().slice(0, 10)} 18:00`);
};
