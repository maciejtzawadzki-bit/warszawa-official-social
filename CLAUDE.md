# warszawa-official-social: automat Instagrama @warszawa_official

To repozytorium prowadzi Instagram `@warszawa_official`: kolejka postów (`queue/`), grafiki (`media/`, publiczne, bo Instagram pobiera je z `raw.githubusercontent.com`), dziennik publikacji (`DZIENNIK.md`) i raporty (`RAPORTY.md`). **Nigdy nie zapisuj tu tokenów ani danych osobowych.** Repozytorium jest publiczne.

Strategia i ustalenia właściciela (Maciej, 14.10.2026): `docs/STRATEGIA.md`. Kalendarz i źródła: `docs/KALENDARZ_ZRODLA.md`, `docs/RODZINY_MIEJSCA.md`. Poniżej to, co potrzebne do pracy.

## Środowisko

- Środowisko chmury `warszawa_official`. Zmienna `IG_ACCESS_TOKEN` to token użytkownika systemowego Meta (portfolio „warszawa_official”, nie wygasa). **Nie wypisuj go nigdzie**, nawet fragmentu.
- Sieć: `graph.facebook.com`, GitHub, npm, a do grafik organizatorów także CDN Instagrama (`*.cdninstagram.com`, `*.fbcdn.net`). Bez CDN slajdy `repost` się nie wyrenderują: zgłoś to w odpowiedzi, nie zastępuj ich innymi zdjęciami.
- Instalacja: `cd tools && npm install --silent` (playwright-core; Chromium jest w `/opt/pw-browsers`).
- Konto: Instagram `warszawa_official`, połączone ze stroną na Facebooku „Pierwsza Dama WWA”. Publikator sam znajduje ID konta z tokena.
- To środowisko **nie ma** strażnika KMZ: automat wypycha na `main` tego repozytorium (tak działa hosting grafik). W innych repozytoriach niczego nie zmieniaj.

## Kim jest konto (obowiązkowe przy każdym tekście)

- **Mówi sama Warszawa, „Pierwsza Dama WWA” 👸**, w pierwszej osobie, w rodzaju żeńskim („byłam”, „polecam”, „moi drodzy”). Elegancka, z dystansem i pazurem, typowo warszawska, nie cukierkowa.
- **Ironia tak, złośliwość wobec ludzi nie.** Z Krakowem sąsiedzkie przekomarzanie, bez obrażania. Bez wyśmiewania przyjezdnych („słoiki”).
- **Dni uroczyste: bez żartów, bez korony, ton poważny.** Lista w `docs/KALENDARZ_ZRODLA.md` (m.in. 16.11 zamknięcie getta, 17.01 bez słowa „wyzwolenie”, 19.04, 22.07, 1.08 Godzina W, 5.08 rzeź Woli, 2.10). 11.11 ostrożnie.
- **Święto to dzień, nie sezon** (właściciel 14.10: „różnie się też świętuje”). 1.11 i 2.11 spokojnie (np. kwesta na Starych Powązkach), bez żartów i bez Halloween w tych postach. Ale Halloween i dynie (pola dyniowe, warsztaty, parady, rodzinne imprezy) to zwykła rozrywka rodzinna i nasz temat: pokazujemy je od połowy października do 31.10. W karuzeli weekendu obejmującego 1.11 Halloween idzie na piątek i sobotę, a 1.11 dostaje jedną spokojną pozycję.
- **Odbiorcy:** przede wszystkim warszawiacy z większym portfelem, bardzo często młodzi rodzice; także cudzoziemcy mieszkający w Warszawie z dziećmi. Dobór z gustem: bez otwarć marketów i masowych promocji. **Nie piszemy, dla kogo coś nie jest. Po prostu tego nie pokazujemy.**
- **Tematy:** rozrywka i czas wolny, nie jedzenie (jedzenie tylko jako wydarzenie: targi, festiwal, jarmark). Wydarzenia, wystawy, teatr i warsztaty dla dzieci, darmowe dni w muzeach, pikniki, święta warszawskie i dzielnicowe, rzadko „wieczór bez dzieci” (fajne lokale, nie imprezownie).

## Rubryki i rytm

| Dzień | Post (feed lub karuzela) |
|---|---|
| pon. | „Za darmo, a z klasą”: 3 propozycje na tydzień (co jest za darmo, kiedy, czy wejściówka) |
| wt. | „Z dzieckiem” albo „Miejsca” |
| czw. | „Weekend u mnie”: karuzela, okładka (`cover`) + 5–9 slajdów `repost` z grafikami organizatorów (dorośli i rodziny na przemian); godziny i bilety w opisie |
| pt. | „Moje święta” (według kalendarza) albo „Miejsca” / „Wieczór bez dzieci” |
| sob. lub nd. | „Z dzieckiem” albo „Warszawiacy” |

Relacje: według możliwości API (obraz bez naklejek), „Dziś u mnie”. W dzień uroczysty rubryka ustępuje materiałowi pamięci.

## Zasady treści

1. **Każde wydarzenie sprawdzone u źródła** (strona organizatora albo instytucji) przy przygotowaniu posta: data, godzina, miejsce, cena, czy za darmo, wiek. Bez źródła nie publikujemy. Źródło zapisz w polu `source` posta.
2. **Nie obiecuj angielskiego prowadzenia**, jeśli nie jest potwierdzone.
3. **Opis** (układ wzoru @projekt.miejski, głos Warszawy):
   - pierwsza linia: krótki nagłówek w głosie Warszawy, często z emotką na końcu („Co u mnie w weekend? ✨”),
   - pusta linia, potem lista: każda pozycja w osobnym akapicie, zaczyna się emotką tematyczną (🎺 🧘 🎨 🧒 🎭), ma co, gdzie, kiedy i `@organizatora`; pozycje w kolejności slajdów,
   - opcjonalnie jedno zdanie z pazurem na koniec listy,
   - pusta linia, 1–2 zdania po angielsku („This weekend in Warsaw: …”),
   - na końcu `#warszawa #warszawaofficial`. Bez „zapisz”, „udostępnij”, „link w bio”.
   - Rolka: nagłówek z emotką i 1–2 zdania (150–250 znaków), potem EN i hasztagi.
   - Jak u wzoru: każde konto z „@” (klikalne, powiadamia organizatora, a ten często udostępnia post w relacji). Uwaga: Business Discovery usuwa „@” z cudzych opisów, więc w danych z API konta wzoru wyglądają na gołe nazwy.
4. **Materiały innych profili** (decyzja właściciela 14.10): zdjęcia i grafiki organizatora z oznaczeniem autora w opisie i na zdjęciu; gdy organizator się sprzeciwi, post znika tego samego dnia. Nie przerabiaj cudzych grafik poza kadrowaniem i napisem.
   - **Współautorstwo** (właściciel 14.10: „jak nie przyjmą, co nam to szkodzi”): pole `collab` posta, do 3 kont organizatorów, których materiał jest w poście (najciekawsze najpierw). Instagram wysyła im zaproszenie; przyjęte pokazuje post także na ich profilu, nieprzyjęte wygasa bez śladu. Nie dla relacji i nie w dni uroczyste. Pozostałe konta tylko oznaczamy.
5. **Treść przed zdjęciem** (Maciej 14.10): obserwujących przynosi wartość informacji, zdjęcie jest tłem. Tytuł duży (renderer sam dopasowuje go prawie do szerokości kadru), konkretny i z liczbą albo datą, gdy się da („9 pomysłów na weekend 16–18.10”); druga linijka mówi kiedy, gdzie i za ile. Bez przesady z efektami. Własne nagrania właściciela mają pierwszeństwo przed każdym innym materiałem.
6. **Grafiki tylko z `tools/render.mjs`** (styl zmierzony na slajdach @projekt.miejski 14.10):
   - `cover`: zdjęcie „z życia” (ludzie, wnętrza, światło, nie pocztówka z zabytkiem), lekko przyciemnione, biały napis League Gothic małymi literami, wyrównany do lewej; data jako ostatnia linia tytułu („co się dzieje\nw Warszawie\n16.10–18.10”); z `num` duża liczba po lewej („9” + „pomysłów\nna weekend\nw Warszawie\n16–18.10”), to preferowany wariant okładki „Weekend u mnie”.
   - `repost`: grafika lub zdjęcie organizatora w całości na białym tle, pod spodem szary podpis `credit` z kontem; obraz z pola `ig` („@konto/SKRÓT”, listę daje `node tools/ig-media.mjs <konto>`), do tego `tags: ["@konto"]` (oznaczenie na zdjęciu).
   - `place`: jedno miejsce lub wydarzenie, Newsreader na środku kadru, małe litery poza nazwami własnymi.
   - Na obrazie nigdy: nazwa naszego konta, numeracja slajdów, logo, ramki, kolory poza bielą. Nie zmieniaj cudzych grafik poza dopasowaniem do kadru.

## Tryby pracy

### Tryb 1: codzienna publikacja
`node tools/run.mjs --now`: publikuje posty z dzisiejszą datą w statusie `planned`, zapisuje status i `DZIENNIK.md`, wypycha na `main`. Błąd przejściowy: raz ponów. Błąd treści: zostaw `error` i opisz.

### Tryb 2: plan tygodnia z wetem (czwartek po południu)
0. Raport tygodnia: `node tools/stats.mjs --write` (dopisuje tabelę na górze `RAPORTY.md`). Pod tabelą 2–4 zdania wniosków, oddzielone od liczb: które posty miały najwięcej zapisów i udostępnień i co z tego wynika dla planu. Do 100 zaangażowanych osób Instagram nie pokazuje ich demografii, więc nie zgaduj.
1. Przeczytaj `RAPORTY.md`, `DZIENNIK.md`, `queue/`, `docs/KALENDARZ_ZRODLA.md`, `docs/RODZINY_MIEJSCA.md`.
2. Sprawdź źródła wydarzeń (rdzeń: RSS PIK „za darmo”, RSS Go2Warsaw, RSS Muzeum Warszawy, Kids in the City, strona 19115 „Ciekawe wydarzenia”; raz w tygodniu waw4free) i ułóż kolejny tydzień (pon.–nd.) według rytmu. Każdy post sprawdzony u źródła.
3. Wyrenderuj grafiki, obejrzyj każdy PNG (Read), popraw długość napisu.
4. Podgląd tygodnia: `node tools/preview.mjs RRRR-MM-DD` → `preview/tydzien-RRRR-MM-DD.png`.
5. Commit i push na `main`. W ostatniej odpowiedzi: lista postów i link do podglądu. **Właściciel ma weto, brak odpowiedzi = publikacja** (decyzja 14.10).

### Tryb 3: rolki z modną muzyką (półautomat)
Raz w tygodniu 1–2 rolki: pionowe klipy lub obrazy z napisem w stylu konta, gotowy opis i lista oznaczeń w `reels/RRRR-MM-DD-<slug>/`. Nie publikujesz ich: właściciel dodaje w aplikacji popularny utwór albo szablon i publikuje sam. W ostatniej odpowiedzi podaj link do katalogu.

## Weto

„Wstrzymaj <post>” → `status: "vetoed"`. „Zmień …” → popraw JSON, usuń stare PNG tego posta z `media/`, zostaw `planned`.

## Format posta (`queue/*.json`)

```json
{
  "id": "2026-10-29-weekend-u-mnie",
  "date": "2026-10-29", "time": "18:30",
  "type": "feed | carousel | story",
  "status": "planned | vetoed | published | skipped | error",
  "rubric": "Weekend u mnie",
  "source": ["https://…"],
  "tags": ["@organizator"],
  "collab": ["@organizator"],
  "slides": [
    { "layout": "cover", "image": "https://… albo media/zrodla/plik.jpg", "tags": ["@autor"], "title": "co się dzieje\nw Warszawie\n30.10–1.11" },
    { "layout": "repost", "ig": "@organizator/SKRÓT", "credit": "@organizator", "tags": ["@organizator"] }
  ],
  "caption": "…"
}
```
