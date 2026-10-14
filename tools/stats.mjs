// Cotygodniowy raport statystyk @warszawa_official z Instagram Graph API (tylko odczyt).
// Użycie: node tools/stats.mjs [--days 7] [--write]
//   bez --write wypisuje raport, z --write dopisuje go na początku RAPORTY.md (najnowszy na górze).
// Liczby z API idą do tabel bez interpretacji; wnioski dopisuje człowiek albo agent pod tabelą.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { graph, igUserId } from "./publish.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = path.join(ROOT, "RAPORTY.md");

const args = process.argv.slice(2);
const days = Number(args.includes("--days") ? args[args.indexOf("--days") + 1] : 7);
const write = args.includes("--write");

const day = (d) => new Date(d).toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(2).replace(".", ",")}%` : "–");

// Każdy wskaźnik osobno: brak jednego (zmiany Meta, próg 100 osób) nie psuje całego raportu.
async function accountMetric(user, metric, extra = {}) {
  try {
    const { data = [] } = await graph("GET", `${user}/insights`, { metric, period: "day", metric_type: "total_value", ...extra });
    return data[0]?.total_value ?? null;
  } catch (error) {
    return { error: error.message.replace(/^Graph API [^:]+: /, "").slice(0, 160) };
  }
}

async function mediaMetrics(id) {
  const out = {};
  for (const metric of ["reach", "saved", "shares", "views", "total_interactions"]) {
    try {
      const { data = [] } = await graph("GET", `${id}/insights`, { metric });
      out[metric] = data[0]?.values?.[0]?.value ?? data[0]?.total_value?.value ?? null;
    } catch {
      out[metric] = null;
    }
  }
  return out;
}

// Zmiana liczby obserwujących względem poprzedniego raportu (pewniejsza niż follows_and_unfollows,
// którego wymiary FOLLOWER / NON_FOLLOWER Meta opisuje niejednoznacznie).
async function previousFollowers() {
  if (!existsSync(REPORT)) return null;
  const m = (await readFile(REPORT, "utf8")).match(/Obserwujący: \*\*(\d+)\*\*/);
  return m ? Number(m[1]) : null;
}

export async function buildReport() {
  const user = await igUserId();
  const until = Math.floor(Date.now() / 1000);
  const since = until - days * 86_400;
  const range = { since: String(since), until: String(until) };

  const account = await graph("GET", user, { fields: "username,followers_count,follows_count,media_count" });
  const totals = {};
  for (const metric of ["reach", "accounts_engaged", "total_interactions", "profile_views", "views"]) {
    const value = await accountMetric(user, metric, range);
    totals[metric] = value?.error ? `brak (${value.error})` : value?.value ?? "–";
  }
  const follows = await accountMetric(user, "follows_and_unfollows", { ...range, breakdown: "follow_type" });
  const byType = Object.fromEntries(
    (follows?.breakdowns?.[0]?.results ?? []).map((r) => [r.dimension_values?.[0], r.value]),
  );

  const { data: media = [] } = await graph("GET", `${user}/media`, {
    fields: "id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count",
    limit: "25",
  });
  const recent = media.filter((m) => Date.parse(m.timestamp) / 1000 >= since);
  const rows = [];
  for (const m of recent) {
    const ins = await mediaMetrics(m.id);
    const engaged = (m.like_count ?? 0) + (m.comments_count ?? 0);
    rows.push(
      `| ${day(m.timestamp)} | ${m.media_product_type === "REELS" ? "rolka" : m.media_type.toLowerCase()} | ` +
      `${(m.caption ?? "").split("\n")[0].replace(/\|/g, "/").slice(0, 50)} | ${m.like_count ?? "–"} | ${m.comments_count ?? "–"} | ` +
      `${ins.saved ?? "–"} | ${ins.shares ?? "–"} | ${ins.reach ?? "–"} | ${pct(engaged, account.followers_count)} | [link](${m.permalink}) |`,
    );
  }

  let audience = "niedostępna (Instagram pokazuje ją od 100 zaangażowanych osób)";
  try {
    const { data = [] } = await graph("GET", `${user}/insights`, {
      metric: "engaged_audience_demographics", period: "lifetime", timeframe: "this_month", metric_type: "total_value", breakdown: "city",
    });
    const cities = (data[0]?.total_value?.breakdowns?.[0]?.results ?? [])
      .sort((a, b) => b.value - a.value).slice(0, 5).map((r) => `${r.dimension_values[0]} ${r.value}`);
    if (cities.length) audience = `miasta (bieżący miesiąc): ${cities.join(", ")}`;
  } catch {
    // poniżej progu albo zmiana API: zostaje opis „niedostępna”
  }

  const prev = await previousFollowers();
  const delta = prev == null ? "pierwszy raport" : `${account.followers_count - prev >= 0 ? "+" : ""}${account.followers_count - prev} od poprzedniego raportu`;
  const from = day(since * 1000);
  const to = day(until * 1000);
  return [
    `## ${from} – ${to}`,
    "",
    `Obserwujący: **${account.followers_count}** (${delta}; API follows_and_unfollows: FOLLOWER ${byType.FOLLOWER ?? "–"}, NON_FOLLOWER ${byType.NON_FOLLOWER ?? "–"}), postów łącznie ${account.media_count}.`,
    "",
    "| Konto, ostatnie dni | wartość |",
    "|---|---|",
    `| zasięg (konta) | ${totals.reach} |`,
    `| wyświetlenia | ${totals.views} |`,
    `| konta zaangażowane | ${totals.accounts_engaged} |`,
    `| interakcje | ${totals.total_interactions} |`,
    `| wejścia na profil | ${totals.profile_views} |`,
    "",
    rows.length
      ? ["| data | typ | początek opisu | ❤️ | 💬 | zapisy | udost. | zasięg | ER | post |", "|---|---|---|---|---|---|---|---|---|---|", ...rows].join("\n")
      : "Brak postów w tym okresie.",
    "",
    `Publiczność zaangażowana: ${audience}.`,
    "",
    "ER = (polubienia + komentarze) / obserwujący. Wnioski dopisz pod tabelą, oddzielając je od liczb.",
    "",
  ].join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = await buildReport();
  if (!write) {
    console.log(report);
  } else {
    const head = "# Raporty @warszawa_official\n\nNajnowszy na górze. Liczby z Instagram Graph API (`node tools/stats.mjs --write`).\n\n";
    const old = existsSync(REPORT) ? (await readFile(REPORT, "utf8")).replace(head, "") : "";
    await writeFile(REPORT, head + report + "\n" + old);
    console.log(`Dopisano raport do ${path.relative(ROOT, REPORT)}`);
  }
}
