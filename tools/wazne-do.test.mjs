// Uruchomienie: node --test tools/*.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";

import { domyslnaRolki, naChwile, wGranicach } from "./wazne-do.mjs";

test("czas polski na UTC: zima +1, lato +2, dzień zmiany czasu", () => {
  assert.equal(naChwile("2026-11-01 15:00"), "2026-11-01T14:00:00.000Z");
  assert.equal(naChwile("2026-07-04T18:00"), "2026-07-04T16:00:00.000Z");
  assert.equal(naChwile("2026-10-25 01:30"), "2026-10-24T23:30:00.000Z"); // jeszcze czas letni
  assert.equal(naChwile("2026-10-25 04:00"), "2026-10-25T03:00:00.000Z"); // już zimowy
  assert.equal(naChwile("2027-03-28 02:30"), null); // tej godziny w Polsce nie ma
});

test("pełna chwila ze strefą bez zmian; zły zapis: null", () => {
  assert.equal(naChwile("2026-11-01T15:00:00+01:00"), "2026-11-01T14:00:00.000Z");
  assert.equal(naChwile("2026-11-01T14:00Z"), "2026-11-01T14:00:00.000Z");
  assert.equal(naChwile("2026-11-31T18:00:00+01:00"), null); // nie 1 grudnia
  assert.equal(naChwile("2026-11-01T24:30:00+01:00"), null);
  for (const zly of ["", null, "jutro", "1.11 15:00", "2026-11-31 10:00", "2026-11-01 25:00", "2026-11-01"]) assert.equal(naChwile(zly), null, String(zly));
});

test("granice jak w panelu: od 10 minut temu do 62 dni", () => {
  const teraz = Date.parse("2026-10-31T17:00:00Z");
  assert.ok(wGranicach("2026-10-31T16:55:00Z", teraz));
  assert.ok(!wGranicach("2026-10-31T16:40:00Z", teraz));
  assert.ok(wGranicach("2026-12-31T16:00:00Z", teraz));
  assert.ok(!wGranicach("2027-01-15T10:00:00Z", teraz));
});

test("rolka bez daty: niedziela po dacie katalogu, 18:00", () => {
  const raw = "https://raw.githubusercontent.com/maciejtzawadzki-bit/warszawa-official-social/main/reels";
  assert.equal(domyslnaRolki(`${raw}/2026-10-30-4-pomysly-na-weekend/rolka.mp4`), "2026-11-01T17:00:00.000Z"); // pt → nd
  assert.equal(domyslnaRolki(`${raw}/2026-11-01-niedziela/rolka.mp4`), "2026-11-01T17:00:00.000Z"); // nd → ta sama nd
  assert.equal(domyslnaRolki("https://example.com/rolka.mp4"), null);
  assert.equal(domyslnaRolki(null), null);
});
