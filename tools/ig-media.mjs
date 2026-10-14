// Grafiki i zdjęcia organizatorów z Instagrama przez Business Discovery (oficjalne API, token konta).
// Służą do slajdów `repost` (grafika organizatora na białym tle z podpisem) i do okładek.
// Użycie:
//   node tools/ig-media.mjs <konto> [ile]   → ostatnie posty konta: data, typ, pierwsza linia opisu, ref, media_url
// W pliku posta slajd może mieć pole `ig`: "@konto/SKRÓT" albo "@konto/SKRÓT#2" (drugi slajd karuzeli), gdzie SKRÓT
// to fragment adresu posta (instagram.com/p/SKRÓT/). Renderer zamienia go na aktualny `media_url` (adresy CDN
// wygasają po kilku dniach, więc nie zapisujemy ich w kolejce).
// Sieć środowiska musi przepuszczać graph.facebook.com oraz CDN Instagrama (*.cdninstagram.com, *.fbcdn.net).
import { graph, igUserId } from "./publish.mjs";

const FIELDS = "id,caption,media_type,timestamp,permalink,media_url,thumbnail_url,children{media_type,media_url,thumbnail_url}";

export async function recentMedia(username, limit = 12) {
  const user = await igUserId();
  const name = username.replace(/^@/, "");
  const res = await graph("GET", user, { fields: `business_discovery.username(${name}){media.limit(${limit}){${FIELDS}}}` });
  return res.business_discovery?.media?.data ?? [];
}

const shortcode = (permalink) => permalink?.match(/\/(?:p|reel|tv)\/([^/?#]+)/)?.[1];
const pick = (m) => m?.media_url && m.media_type !== "VIDEO" ? m.media_url : m?.thumbnail_url ?? m?.media_url;

/** "@konto/SKRÓT#n" → adres obrazu (dla wideo: miniatura). */
export async function resolveIg(ref) {
  const m = String(ref).match(/^@?([\w.]+)\/([\w-]+)(?:#(\d+))?$/);
  if (!m) throw new Error(`Zły format pola ig: ${ref} (oczekiwane "@konto/SKRÓT" albo "@konto/SKRÓT#2")`);
  const [, username, code, nth] = m;
  const media = await recentMedia(username, 50);
  const post = media.find((p) => shortcode(p.permalink) === code);
  if (!post) throw new Error(`Nie znaleziono posta ${code} wśród 50 ostatnich postów @${username}`);
  const item = nth ? post.children?.data?.[Number(nth) - 1] : post.children?.data?.[0] ?? post;
  const url = pick(item ?? post);
  if (!url) throw new Error(`Post ${ref} nie udostępnia obrazu przez API`);
  return url;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [username, limit] = process.argv.slice(2);
  if (!username) {
    console.error("Użycie: node tools/ig-media.mjs <konto> [ile]");
    process.exit(1);
  }
  for (const p of await recentMedia(username, Number(limit ?? 12))) {
    const n = p.children?.data?.length;
    console.log(`${p.timestamp.slice(0, 10)}  ${p.media_type}${n ? ` (${n})` : ""}  @${username.replace(/^@/, "")}/${shortcode(p.permalink)}`);
    console.log(`  ${(p.caption ?? "").split("\n")[0].slice(0, 110)}`);
    console.log(`  ${pick(p.children?.data?.[0] ?? p) ?? "(brak obrazu)"}`);
  }
}
