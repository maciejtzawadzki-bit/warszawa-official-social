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
- Automat: codziennie rano research i plan kroczący na około 5 publikacji do przodu (agent wybiera, podmienia i przesuwa posty, gdy znajdzie coś lepszego, najpóźniej 12 godzin przed publikacją; decyzja właściciela 23.10.2026), prawo weta właściciela w panelu KMZ (brak odpowiedzi oznacza publikację), publikacja codziennie przez API o 11:00 i 18:00.
- Więcej postów dopiero wtedy, gdy jakość i statystyki się utrzymają. Jedna pomyłka w dacie albo w „za darmo” kosztuje zaufanie.

## Pierwszy miesiąc: wyniki i zmiana strategii (16.11.2026)

Liczby z Instagram Graph API 16.11.2026, narastające, 23 posty z 15.10–16.11 (szczegóły: `RAPORTY.md`, „Miesiąc 15.10–16.11”).

**Fakty:**
- Obserwujący 6987 → 6996 (+9 w miesiąc). Post dociera zwykle do 100–250 kont (2–4% obserwujących), 3–7 polubień.
- Zasięg (mediana): karuzela „Weekend u mnie” 264 (5 postów), inne karuzele 204 (7), pojedynczy obraz 96 (8), rolka 48 (1).
- Udostępnienia: 12 w miesiącu, z tego 10 przy „Weekend u mnie”. Zapisy: 7, najwięcej (3) przy liście na cały miesiąc („Cały listopad pałace bez biletów”, 2.11).
- Współautorstwo: 37 zaproszeń, przyjęte 1 (@ogrodbotanicznyuw, post 3.11), ten post: zasięg 1110. Filharmonia zaproszona 6 razy, Zachęta 3, bez przyjęcia.

**Wnioski i hipotezy:**
- Hipoteza: przyjęte współautorstwo daje kilkukrotny zasięg (jeden przypadek, ale żaden inny czynnik nie dał podobnego skoku). Hipoteza: duże instytucje nie przyjmują zaproszeń od nieznanego konta, mniejsze organizatorki z aktywnym Instagramem częściej.
- Pojedyncze obrazy nie niosą się (zasięg o połowę niższy, prawie bez zapisów i udostępnień).
- Hipoteza: duża część bazy z lat 2018–2023 jest nieaktywna, więc wzrost musi przyjść od nieobserwujących (współautorstwa, udostępnienia, rolki), nie z częstszych postów do obecnej bazy.
- Godziny 11:00 i 18:00 nie dają się porównać: o 18:00 wychodzi prawie tylko czwartkowa karuzela.

**Decyzje Macieja z 16.11.2026** (reguły w `CLAUDE.md`, „Zmiana strategii od 16.11.2026”): każdy post to karuzela z co najmniej 3 pozycjami (obraz tylko w dzień uroczysty); mniejsze wydarzenia (warsztaty, darmowe pokazy, domy kultury, pracownie) przed dużymi instytucjami („do filharmonii się chodzi raz na rok, a mniejsze rzeczy są w cenie”); w `collab` najpierw mniejsze konta, duże zapraszamy nadal; raz w miesiącu lista na cały miesiąc; rolki oceniamy po 4 tygodniach. Raport tygodnia mierzy od teraz posty z 3 tygodni, bo wcześniejszy pokazywał tylko 7 dni i pominął najlepszy post miesiąca.

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
