// Publikacja posta @warszawa_official na Instagramie przez oficjalne Instagram Graph API (Meta).
// Użycie: node publish.mjs <post.json> [--dry-run]
// Zmienne środowiskowe (nigdy w repo):
//   IG_USER_ID        — opcjonalnie; bez niej ustalany z tokena (jedyne konto albo IG_USERNAME, domyślnie warszawa_official),
//   IG_ACCESS_TOKEN   — token użytkownika systemowego Meta Business (nie wygasa),
//   IG_MEDIA_BASE_URL — publiczny adres katalogu z PNG (Instagram pobiera obraz z URL),
//   IG_VIDEO_BASE_URL — publiczny adres katalogu media/ dla wideo (typ video/mp4); bez niej IG_MEDIA_BASE_URL,
//   IG_GRAPH_VERSION  — opcjonalnie, domyślnie v23.0.
// Obsługiwane typy: feed (1 obraz), carousel (2–10 obrazów), story (1 obraz albo wideo),
// reel (wideo). Wideo: pole `video` = plik w media/video/ (MP4, H.264 + AAC, 9:16).
import { readFile } from "node:fs/promises";

const GRAPH = `https://graph.facebook.com/${process.env.IG_GRAPH_VERSION ?? "v23.0"}`;

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Brak zmiennej środowiskowej ${name}`);
  return value;
}

export async function graph(method, pathName, params) {
  const url = new URL(`${GRAPH}/${pathName}`);
  const body = new URLSearchParams({ ...params, access_token: env("IG_ACCESS_TOKEN") });
  const res =
    method === "GET"
      ? await fetch(`${url}?${body}`)
      : await fetch(url, { method, body });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`Graph API ${pathName}: ${JSON.stringify(json.error ?? json)}`);
  return json;
}

// Kontener musi mieć status FINISHED, zanim da się go opublikować.
// Wideo Instagram przetwarza dłużej — do 5 minut.
async function waitReady(containerId, { attempts = 30, intervalMs = 2000 } = {}) {
  for (let i = 0; i < attempts; i += 1) {
    const { status_code: status } = await graph("GET", containerId, { fields: "status_code" });
    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") throw new Error(`Kontener ${containerId}: ${status}`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Kontener ${containerId} nie jest gotowy po ${Math.round((attempts * intervalMs) / 1000)} s`);
}

const VIDEO_WAIT = { attempts: 60, intervalMs: 5000 };

// Konto Instagram powiązane ze stroną na Facebooku, do której token ma dostęp.
export async function igUserId() {
  if (process.env.IG_USER_ID) return process.env.IG_USER_ID;
  const username = (process.env.IG_USERNAME ?? "warszawa_official").toLowerCase();
  const { data = [] } = await graph("GET", "me/accounts", { fields: "instagram_business_account{id,username}" });
  const accounts = data.map((page) => page.instagram_business_account).filter(Boolean);
  // Jedno konto → bierzemy je (zmiana nazwy na Instagramie nie psuje publikacji).
  const account = accounts.length === 1 ? accounts[0] : accounts.find((ig) => ig.username?.toLowerCase() === username);
  if (!account) throw new Error(`Token nie ma dostępu do konta Instagram @${username}`);
  return account.id;
}

export function imageUrls(post) {
  const base = env("IG_MEDIA_BASE_URL").replace(/\/$/, "");
  return (post.slides ?? []).map((_, i) => `${base}/${post.id}-${String(i + 1).padStart(2, "0")}.png`);
}

/** Publiczne adresy plików posta: wideo (media/video/) albo wyrenderowane PNG. */
export function mediaUrls(post) {
  if (!post.video) return imageUrls(post);
  const base = (process.env.IG_VIDEO_BASE_URL ?? env("IG_MEDIA_BASE_URL")).replace(/\/$/, "");
  return [`${base}/video/${post.video}`];
}

/** Oznaczenia kont na zdjęciu (pole `tags` slajdu, np. ["@organizator"]); Instagram wymaga pozycji 0–1. */
export function userTags(slide) {
  const tags = (slide?.tags ?? []).map((t) => String(t).replace(/^@/, "")).filter(Boolean);
  if (!tags.length) return {};
  return { user_tags: JSON.stringify(tags.map((username, i) => ({ username, x: 0.5, y: Math.min(0.9, 0.5 + i * 0.08) }))) };
}

/** Zaproszenia do współautorstwa (pole `collab` posta): do 3 kont, tylko post, karuzela i rolka (nie relacja).
 *  Gdy konto nie przyjmie zaproszenia, post zostaje normalnie u nas. */
export function collaborators(post) {
  const names = (post.collab ?? []).map((t) => String(t).replace(/^@/, "")).filter(Boolean);
  if (names.length > 3) throw new Error(`Instagram przyjmuje najwyżej 3 współautorów, w poście ${post.id}: ${names.length}`);
  return names.length && post.type !== "story" ? { collaborators: JSON.stringify(names) } : {};
}

export async function publishPost(post, { dryRun = false } = {}) {
  if (post.type === "reel" && !post.video) throw new Error("Reel wymaga pola video");
  const urls = mediaUrls(post);
  if (dryRun) return { dryRun: true, type: post.type, urls, caption: post.caption, tags: (post.slides ?? []).map((s) => userTags(s).user_tags ?? null), ...collaborators(post) };
  const user = await igUserId();

  let creationId;
  if (post.type === "reel") {
    ({ id: creationId } = await graph("POST", `${user}/media`, {
      media_type: "REELS",
      video_url: urls[0],
      caption: post.caption,
      share_to_feed: "true",
      ...collaborators(post),
      thumb_offset: String(post.thumbOffsetMs ?? 1500),
    }));
    await waitReady(creationId, VIDEO_WAIT);
  } else if (post.type === "story" && post.video) {
    ({ id: creationId } = await graph("POST", `${user}/media`, { media_type: "STORIES", video_url: urls[0] }));
    await waitReady(creationId, VIDEO_WAIT);
  } else if (post.type === "story") {
    ({ id: creationId } = await graph("POST", `${user}/media`, { media_type: "STORIES", image_url: urls[0] }));
  } else if (post.type === "carousel") {
    if (urls.length < 2 || urls.length > 10) throw new Error("Karuzela wymaga 2–10 slajdów");
    const children = [];
    for (const [i, image_url] of urls.entries()) {
      const { id } = await graph("POST", `${user}/media`, { image_url, is_carousel_item: "true", ...userTags(post.slides[i]) });
      await waitReady(id);
      children.push(id);
    }
    ({ id: creationId } = await graph("POST", `${user}/media`, {
      media_type: "CAROUSEL",
      children: children.join(","),
      caption: post.caption,
      ...collaborators(post),
    }));
  } else {
    ({ id: creationId } = await graph("POST", `${user}/media`, { image_url: urls[0], caption: post.caption, ...userTags(post.slides?.[0]), ...collaborators(post) }));
  }
  await waitReady(creationId);
  const { id: mediaId } = await graph("POST", `${user}/media_publish`, { creation_id: creationId });
  const { permalink } = await graph("GET", mediaId, { fields: "permalink" });
  return { mediaId, permalink };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, flag] = process.argv.slice(2);
  if (!input) {
    console.error("Użycie: node publish.mjs <post.json> [--dry-run]");
    process.exit(1);
  }
  const post = JSON.parse(await readFile(input, "utf8"));
  console.log(JSON.stringify(await publishPost(post, { dryRun: flag === "--dry-run" }), null, 2));
}
