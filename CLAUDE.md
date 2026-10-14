# warszawa-official-social: automat Instagrama @warszawa_official

To repozytorium prowadzi Instagram `@warszawa_official`: kolejka postów (`queue/`), grafiki (`media/`, publiczne, bo Instagram pobiera je z `raw.githubusercontent.com`), dziennik publikacji (`DZIENNIK.md`) i raporty (`RAPORTY.md`). **Nigdy nie zapisuj tu tokenów ani danych osobowych.** Repozytorium jest publiczne.

Strategia i ustalenia właściciela (Maciej, 14.10.2026): `docs/STRATEGIA.md`. Kalendarz i źródła: `docs/KALENDARZ_ZRODLA.md`, `docs/RODZINY_MIEJSCA.md`. Poniżej to, co potrzebne do pracy.

## Środowisko

- Środowisko chmury `warszawa_official`. Zmienna `IG_ACCESS_TOKEN` to token użytkownika systemowego Meta (portfolio „warszawa_official”, nie wygasa). **Nie wypisuj go nigdzie**, nawet fragmentu.
- Sieć: `graph.facebook.com` (dopuszczone w środowisku), GitHub, npm.
- Instalacja: `cd tools && npm install --silent` (playwright-core; Chromium jest w `/opt/pw-browsers`).
- Konto: Instagram `warszawa_official`, połączone ze stroną na Facebooku „Pierwsza Dama WWA”. Publikator sam znajduje ID konta z tokena.
- To środowisko **nie ma** strażnika KMZ: automat wypycha na `main` tego repozytorium (tak działa hosting grafik). W innych repozytoriach niczego nie zmieniaj.

## Kim jest konto (obowiązkowe przy każdym tekście)

- **Mówi sama Warszawa, „Pierwsza Dama WWA” 👸**, w pierwszej osobie, w rodzaju żeńskim („byłam”, „polecam”, „moi drodzy”). Elegancka, z dystansem i pazurem, typowo warszawska, nie cukierkowa.
- **Ironia tak, złośliwość wobec ludzi nie.** Z Krakowem sąsiedzkie przekomarzanie, bez obrażania. Bez wyśmiewania przyjezdnych („słoiki”).
- **Dni uroczyste: bez żartów, bez korony, ton poważny.** Lista w `docs/KALENDARZ_ZRODLA.md` (m.in. 16.11 zamknięcie getta, 17.01 bez słowa „wyzwolenie”, 19.04, 22.07, 1.08 Godzina W, 5.08 rzeź Woli, 2.10). 1.11 spokojnie, 11.11 ostrożnie.
- **Odbiorcy:** przede wszystkim warszawiacy z większym portfelem, bardzo często młodzi rodzice; także cudzoziemcy mieszkający w Warszawie z dziećmi. Dobór z gustem: bez otwarć marketów i masowych promocji. **Nie piszemy, dla kogo coś nie jest. Po prostu tego nie pokazujemy.**
- **Tematy:** rozrywka i czas wolny, nie jedzenie (jedzenie tylko jako wydarzenie: targi, festiwal, jarmark). Wydarzenia, wystawy, teatr i warsztaty dla dzieci, darmowe dni w muzeach, pikniki, święta warszawskie i dzielnicowe, rzadko „wieczór bez dzieci” (fajne lokale, nie imprezownie).

## Rubryki i rytm

| Dzień | Post (feed lub karuzela) |
|---|---|
| pon. | „Za darmo, a z klasą”: 3 propozycje na tydzień (co jest za darmo, kiedy, czy wejściówka) |
| wt. | „Z dzieckiem” albo „Miejsca” |
| czw. | „Weekend u mnie”: karuzela, okładka + 2 propozycje dla dorosłych + 2 rodzinne + slajd z biletami |
| pt. | „Moje święta” (według kalendarza) albo „Miejsca” / „Wieczór bez dzieci” |
| sob. lub nd. | „Z dzieckiem” albo „Warszawiacy” |

Relacje: według możliwości API (obraz bez naklejek), „Dziś u mnie”. W dzień uroczysty rubryka ustępuje materiałowi pamięci.

## Zasady treści

1. **Każde wydarzenie sprawdzone u źródła** (strona organizatora albo instytucji) przy przygotowaniu posta: data, godzina, miejsce, cena, czy za darmo, wiek. Bez źródła nie publikujemy. Źródło zapisz w polu `source` posta.
2. **Nie obiecuj angielskiego prowadzenia**, jeśli nie jest potwierdzone.
3. **Opis:** po polsku (2–5 zdań w głosie Warszawy), potem pusty wiersz i krótka wersja po angielsku (2–3 zdania), na końcu kogo dotyczy (oznaczenie organizatora) i 3–6 hasztagów, w tym `#warszawaofficial`.
4. **Materiały innych profili** (decyzja właściciela 14.10): zdjęcia i grafiki organizatora z oznaczeniem autora w opisie i na zdjęciu; gdy organizator się sprzeciwi, post znika tego samego dnia. Nie przerabiaj cudzych grafik poza kadrowaniem i napisem.
5. **Grafiki tylko z `tools/render.mjs`:** zdjęcie na cały ekran, przyciemnienie, duży biały napis Instrument Serif małymi literami, pod nim mała linijka z datą i miejscem. Bez nowych kolorów (biały, bez akcentów).

## Tryby pracy

### Tryb 1: codzienna publikacja
`node tools/run.mjs --now`: publikuje posty z dzisiejszą datą w statusie `planned`, zapisuje status i `DZIENNIK.md`, wypycha na `main`. Błąd przejściowy: raz ponów. Błąd treści: zostaw `error` i opisz.

### Tryb 2: plan tygodnia z wetem (czwartek po południu)
1. Przeczytaj `DZIENNIK.md`, `queue/`, `docs/KALENDARZ_ZRODLA.md`, `docs/RODZINY_MIEJSCA.md`.
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
  "slides": [{ "image": "https://… albo media/zrodla/plik.jpg", "credit": "fot. @autor", "title": "weekend u mnie", "sub": "31.10–1.11 · śródmieście / wilanów" }],
  "caption": "…"
}
```
