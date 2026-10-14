// Prognoza dla Warszawy na najbliższe dni i kontekst sezonu do planu tygodnia. Źródła bez klucza: Open-Meteo (z
// prawdopodobieństwem opadów), a gdy nie odpowiada, met.no (Norweski Instytut Meteorologiczny). Open-Meteo bywa
// niedostępne ze współdzielonych adresów chmury (14.10: limit czasu w automacie, HTTP 429), met.no odpowiada.
// Użycie: node tools/pogoda.mjs [dni=7] [--metno]   (--metno: od razu drugie źródło, do sprawdzenia)
// Wynik: dzień po dniu temperatura, opady i ocena „pod dachem / na zewnątrz”, a na końcu sezon.
import "./siec.mjs";

const days = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) ?? 7);
const tylkoMetno = process.argv.includes("--metno");
const URL_ =
  "https://api.open-meteo.com/v1/forecast?latitude=52.23&longitude=21.01&timezone=Europe%2FWarsaw" +
  `&forecast_days=${days}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max`;

// Kody WMO w skrócie (https://open-meteo.com/en/docs).
const WMO = [
  [[0], "słońce"], [[1, 2], "częściowe zachmurzenie"], [[3], "pochmurno"], [[45, 48], "mgła"],
  [[51, 53, 55, 56, 57], "mżawka"], [[61, 63, 65, 66, 67, 80, 81, 82], "deszcz"],
  [[71, 73, 75, 77, 85, 86], "śnieg"], [[95, 96, 99], "burza"],
];
const sky = (code) => WMO.find(([codes]) => codes.includes(code))?.[1] ?? `kod ${code}`;
const DOW = ["nd.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];

// Prosta ocena do doboru propozycji (wniosek, nie prognoza): deszcz, zimno albo wiatr → pod dachem.
// met.no nie podaje prawdopodobieństwa opadów (rainProb = null): wtedy liczą się same milimetry.
function verdict(d) {
  if ((d.rainProb ?? 0) >= 60 || d.rain >= 2 || d.max < 5 || d.wind >= 45) return "pod dachem";
  if ((d.rainProb ?? (d.rain < 0.5 ? 0 : 100)) <= 30 && d.max >= 15) return "na zewnątrz";
  return "mieszanie (pod dachem + krótko na zewnątrz)";
}

// Sezony i ich typowe atrakcje (do doboru tematów; daty konkretnych wydarzeń zawsze u źródła).
function season(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const md = m * 100 + d;
  if (md >= 1001 && md <= 1031) return "Halloween i dynie (pola dyniowe, warsztaty, parady); 1–2.11 spokojnie";
  if (md >= 1101 && md <= 1102) return "Wszystkich Świętych i Zaduszki: ton spokojny";
  if (md >= 1115 || md <= 106) return "sezon świąteczny: iluminacje i pokazy świateł, jarmarki, lodowiska, świąteczne koncerty i warsztaty";
  if (md >= 107 && md <= 228) return "zima: atrakcje pod dachem (parki trampolin, sale zabaw, centra nauki, baseny, ścianki), ferie (połowa lutego)";
  if (md >= 301 && md <= 531) return "wiosna: parki, ogrody, pierwsze plenery i pikniki, Wielkanoc (jarmarki, warsztaty)";
  if (md >= 601 && md <= 831) return "lato: plenery, bulwary, food trucki i targi na zewnątrz, kina plenerowe, kąpieliska, festiwale";
  return "jesień: muzea i wystawy, teatr, warsztaty; przy słońcu parki i spacery";
}

async function openMeteo() {
  const res = await fetch(URL_, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { daily } = await res.json();
  return daily.time.map((t, i) => ({
    dzien: t, max: Math.round(daily.temperature_2m_max[i]), min: Math.round(daily.temperature_2m_min[i]),
    rainProb: daily.precipitation_probability_max[i] ?? 0, rain: daily.precipitation_sum[i] ?? 0,
    wind: Math.round(daily.wind_speed_10m_max[i] ?? 0), niebo: sky(daily.weather_code[i]),
  }));
}

// met.no: prognoza co godzinę (ok. 2,5 dnia), potem co 6 godzin (do 10 dni); składamy dni czasu polskiego.
const NIEBO_METNO = [
  [/thunder/, "burza"], [/snow/, "śnieg"], [/sleet/, "deszcz ze śniegiem"], [/rain/, "deszcz"], [/fog/, "mgła"],
  [/^cloudy/, "pochmurno"], [/fair|partlycloudy/, "częściowe zachmurzenie"], [/clearsky/, "słońce"],
];
async function metNo() {
  const res = await fetch("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=52.23&lon=21.01", {
    headers: { "User-Agent": "warszawa-official-social github.com/maciejtzawadzki-bit/warszawa-official-social" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const dzienPL = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(new Date(iso));
  const dni = new Map();
  for (const { time, data } of (await res.json()).properties.timeseries) {
    const k = dzienPL(time);
    const d = dni.get(k) ?? { dzien: k, temp: [], rain: 0, wind: 0, symbole: {} };
    d.temp.push(data.instant.details.air_temperature);
    d.wind = Math.max(d.wind, data.instant.details.wind_speed ?? 0);
    const okres = data.next_1_hours ?? data.next_6_hours;
    d.rain += okres?.details?.precipitation_amount ?? 0;
    const sym = okres?.summary?.symbol_code?.replace(/_(day|night|polartwilight)$/, "");
    if (sym) d.symbole[sym] = (d.symbole[sym] ?? 0) + 1;
    dni.set(k, d);
  }
  // Dziś po południu met.no ma już tylko resztę dnia (min i max z kilku godzin): pomijamy, plan dotyczy kolejnych dni.
  const dzis = dzienPL(new Date().toISOString());
  const poPoludniu = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Warsaw", hour: "2-digit", hourCycle: "h23" }).format(new Date())) >= 12;
  return [...dni.values()].filter((d) => d.temp.length >= 3 && !(d.dzien === dzis && poPoludniu)).slice(0, days).map((d) => {
    const sym = Object.entries(d.symbole).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    return {
      dzien: d.dzien, max: Math.round(Math.max(...d.temp)), min: Math.round(Math.min(...d.temp)),
      rainProb: null, rain: Math.round(d.rain * 10) / 10, wind: Math.round(d.wind * 3.6),
      niebo: NIEBO_METNO.find(([re]) => re.test(sym))?.[1] ?? sym,
    };
  });
}

// Bez prognozy plan i tak powstaje (wtedy dobór tylko według sezonu).
let prognoza = null;
let zrodlo = null;
const bledy = [];
for (const [nazwa, pobierz] of tylkoMetno ? [["met.no", metNo]] : [["Open-Meteo", openMeteo], ["met.no", metNo]]) {
  try {
    prognoza = await pobierz();
    zrodlo = nazwa;
    break;
  } catch (error) {
    bledy.push(`${nazwa}: ${error.message}`);
  }
}
if (!prognoza) {
  console.log(`Prognoza niedostępna (${bledy.join("; ")}). Dobór według sezonu.`);
  console.log(`Sezon: ${season(new Date())}`);
  process.exit(0);
}
console.log(`Prognoza Warszawa (${zrodlo}${bledy.length ? `; ${bledy.join("; ")}` : ""}):`);
for (const d of prognoza) {
  const date = new Date(`${d.dzien}T12:00:00`);
  const opady = d.rainProb == null ? `opady ${d.rain} mm` : `opady ${d.rainProb}% (${d.rain} mm)`;
  console.log(`- ${DOW[date.getDay()]} ${d.dzien.slice(8, 10)}.${d.dzien.slice(5, 7)}: ${d.min}–${d.max}°C, ${d.niebo}, ${opady}, wiatr do ${d.wind} km/h → ${verdict(d)}`);
}
console.log(`Sezon: ${season(new Date())}`);
