// Prognoza dla Warszawy na najbliższe dni (Open-Meteo, bez klucza) i kontekst sezonu do planu tygodnia.
// Użycie: node tools/pogoda.mjs [dni=7]
// Wynik: dzień po dniu temperatura, opady i ocena „pod dachem / na zewnątrz”, a na końcu sezon.
// Sieć środowiska musi przepuszczać api.open-meteo.com.

const days = Number(process.argv[2] ?? 7);
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
function verdict(d) {
  if (d.rainProb >= 60 || d.rain >= 2 || d.max < 5 || d.wind >= 45) return "pod dachem";
  if (d.rainProb <= 30 && d.max >= 15) return "na zewnątrz";
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

const res = await fetch(URL_);
if (!res.ok) throw new Error(`Open-Meteo: HTTP ${res.status}`);
const { daily } = await res.json();
console.log("Prognoza Warszawa (Open-Meteo):");
daily.time.forEach((t, i) => {
  const d = {
    max: Math.round(daily.temperature_2m_max[i]), min: Math.round(daily.temperature_2m_min[i]),
    rainProb: daily.precipitation_probability_max[i] ?? 0, rain: daily.precipitation_sum[i] ?? 0,
    wind: Math.round(daily.wind_speed_10m_max[i] ?? 0), code: daily.weather_code[i],
  };
  const date = new Date(`${t}T12:00:00`);
  console.log(`- ${DOW[date.getDay()]} ${t.slice(8, 10)}.${t.slice(5, 7)}: ${d.min}–${d.max}°C, ${sky(d.code)}, opady ${d.rainProb}% (${d.rain} mm), wiatr do ${d.wind} km/h → ${verdict(d)}`);
});
console.log(`Sezon: ${season(new Date())}`);
