# Strategia @warszawa_official

Ustalenia właściciela z 14.10.2026. Zasady pracy automatu są w `CLAUDE.md`. Ten plik mówi, dlaczego tak.

## Kim jest konto

- **Mówi sama Warszawa, „Pierwsza Dama WWA” 👸:** pierwsza osoba, rodzaj żeński, z dystansem i pazurem, typowo warszawsko, nie cukierkowo. Z Krakowem sąsiedzkie przekomarzanie.
- **Treść to bieżący przegląd warszawskich spraw:** wydarzenia, wystawy, teatr i warsztaty dla dzieci, darmowe dni w muzeach, pikniki, święta warszawskie i dzielnicowe. Rzadko wieczór bez dzieci (fajne lokale, nie imprezownie).
- **Rozrywka, nie jedzenie.** To odróżnia nas od wzoru (@projekt.miejski). Jedzenie tylko jako wydarzenie: targi, festiwal, jarmark.

## Odbiorcy

- Przede wszystkim warszawiacy z większym portfelem, bardzo często młodzi rodzice. Także cudzoziemcy mieszkający w Warszawie z dziećmi: dla nich krótka wersja opisu po angielsku (wydarzenia nie muszą być po angielsku).
- Selekcja wyborem tematów, nigdy słowami o tym, dla kogo coś nie jest.
- **Baza na starcie (API, 14.10.2026):** 6 991 obserwujących; Polska 76% znanych krajów; Warszawa 62% znanych miast (co najmniej 27% wszystkich); wiek 35–44 37%, 25–34 31%, 45–54 19%; kobiety 43%, mężczyźni 33%, reszta nieokreślona. Konto nie publikowało od 26.10.2023; zaangażowanie spadło z ok. 3,5% (2018–2020) do ok. 1,1% (2023). Profil bazy zgadza się z docelowym odbiorcą, ale nie mówi, jaka treść działa. Pomiar po 4–6 tygodniach regularnych publikacji (`RAPORTY.md`).
- Najlepszy post w historii konta: 1.08.2020, Godzina W (561 polubień). Rocznice i warszawska tożsamość działają.

## Wzór: @projekt.miejski (styl zmierzony 14.10 na ich slajdach)

- Okładki karuzel: zdjęcie z życia, biały wąski grotesk małymi literami, do lewej, bez ramek i przyciemnienia; wariant z dużą liczbą („12 miejsc…”).
- Środek przeglądu: plakaty i zdjęcia organizatorów w całości na białym tle, pod spodem szary podpis z kontem.
- Rolki: zdjęcie lub film miejsca, szeryf na środku kadru, modna muzyka.
- Opisy: nagłówek, lista z emotką na początku każdej pozycji i oznaczonym kontem miejsca lub organizatora (np. „🧘 joga w @cafe__plas”), jeden hasztag, bez wezwań do działania.
- Formaty u nich (40 postów, 28.07–13.10.2026): karuzele 18 (śr. 333 polubienia, zwykle 13–17 slajdów), rolki 22 (śr. 161). Cotygodniowy przegląd „Co dzieje się w Warszawie?”: 11 postów, śr. 335 polubień.
- Czym się różnimy: u nich neutralny głos i jedzenie, u nas mówi Warszawa i w centrum jest rozrywka, rodziny i moje święta.

## Materiały

- **Grafiki i zdjęcia organizatorów** (decyzja właściciela 14.10): używamy z oznaczeniem autora w opisie i na zdjęciu; jeśli organizator się sprzeciwi, post znika tego samego dnia. Pobieramy je przez oficjalne API (Business Discovery).
- Zdjęcia na okładki: z życia (ludzie, wnętrza, światło), nie pocztówki z zabytkami. Wikimedia Commons tylko w ostateczności, z licencją w opisie.

## Rytm i narzędzie

- 5 postów tygodniowo (rubryki w `CLAUDE.md`), 1–2 rolki tygodniowo w półautomacie (właściciel dodaje modną muzykę w aplikacji, bo API jej nie dodaje).
- Automat: plan tygodnia w czwartek z prawem weta właściciela (brak odpowiedzi oznacza publikację), publikacja codziennie przez API.
- Więcej postów dopiero wtedy, gdy jakość i statystyki się utrzymają. Jedna pomyłka w dacie albo w „za darmo” kosztuje zaufanie.

## Opis profilu

Zostaje obecny: „PIERWSZA DAMA WWA👸 |#warszawaofficial” (decyzja właściciela 14.10; wcześniejszy pomysł opisu po angielsku odłożony).

## Treść przed zdjęciem

Obserwujących przynosi wartość informacji, zdjęcie jest tłem (właściciel 14.10). Duże, konkretne tytuły z liczbą albo datą, druga linijka z miejscem, godziną i ceną. Własne nagrania właściciela, gdy są, mają pierwszeństwo.

## Ryzyka

| Ryzyko | Jak ograniczamy |
|---|---|
| Konto wzięte za oficjalne konto miasta | głos persony („Pierwsza Dama WWA”), brak herbów i logo |
| Błędna informacja (data, „za darmo”) | źródło przy każdym wydarzeniu, sprawdzenie u organizatora |
| Sprzeciw autora grafiki | oznaczenie autora; usunięcie posta tego samego dnia |
| Żart w dniu uroczystym | kalendarz dni uroczystych (`docs/KALENDARZ_ZRODLA.md`) |
| Przekomarzanie przechodzi w obrażanie | zasady głosu; weto właściciela |
