# Research wydarzeń: standard „ekstra”

Właściciel 14.10.2026: „chcę, żeby te wydarzenia były naprawdę dobrze i głęboko zriserczowane, to ma być ekstra”. Ten plik opisuje, jak to robimy. Wzór pierwszego researchu: `research/2026-10-16-weekend.md`.

## Przebieg

1. **Kontekst:** `node tools/pogoda.mjs` (pogoda, sezon), `docs/KALENDARZ_ZRODLA.md` (święta, rocznice, cykliczne imprezy), mecze warszawskich drużyn **u siebie** (Legia na Łazienkowskiej i inne; ekstraklasa.org, strony klubów). Wyjazdowych nie zapowiadamy.
2. **Pomysły** z agregatorów (tylko jako trop, nigdy jako potwierdzenie): Kids in the City (przewodnik miesięczny i lista weekendowa), PIK (tag „za darmo”), Go2Warsaw, waw4free, terazwarszawa, Instagram organizatorów (`node tools/ig-media.mjs <konto>`).
3. **Media miejskie i zapowiedzi marek** (też tylko trop): whiteMAD (RSS `https://www.whitemad.pl/feed/`), Warsaw Insider (RSS `https://warsawinsider.pl/feed/`), informacje prasowe na publicrelations.pl (RSS `https://publicrelations.pl/feed/`, tylko wpisy o Warszawie) i wyszukiwarka (narzędzie WebSearch), np. „Warszawa wystawa <miesiąc> <rok> zapisy”, „Warszawa bezpłatne wejście rejestracja <miesiąc>”, „pop-up Warszawa <miesiąc>”. Wydarzenia marek w wynajętych salach (muzeum, zamek, hala) zwykle nie trafiają do kalendarza gospodarza: wystawy LEGO w Zamku Ujazdowskim (24–26.10.2026) nie było w programie Zamku, ogłosiły ją informacja prasowa (7.10) i media (dodane 20.10, po tym jak research z 15.10 jej nie znalazł).
4. **Przegląd instytucji** (kalendarze na stronach): Zachęta, MSN, MNW i Muzeum Plakatu, Muzeum Warszawy z oddziałami (Praga, Wola, Pracownie), Wilanów, Łazienki, Zamek, POLIN, Muzeum Powstania, Kopernik, Filharmonia Narodowa, Teatr Wielki, Nowy Teatr, Teatr Studio, Teatr Baj, Teatr Lalka, Teatr Guliwer, Opera Królewska, CSW Zamek Ujazdowski, Koneser, Elektrownia Powiśle, Hala Koszyki, ZOO, Ogród Botaniczny, Wola Jazz i kluby muzyczne.
5. **Co najmniej 20 kandydatów** (mniej więcej po połowie dla dorosłych i rodzin, w tym 2–3 sezonowe), z nich wybór 8–9 do karuzeli.
6. **Zapisy z wyprzedzeniem:** przejrzyj też zapowiedzi na 4 tygodnie naprzód i wypisz wydarzenia z zapisami (zasady niżej).
7. **Lista do panelu:** wszyscy kandydaci także w `research/RRRR-MM-DD.json` (tryb 2a w `CLAUDE.md`): w środę właściciel wybiera albo skreśla ich w panelu KMZ, w czwartek plan bierze to pod uwagę.

## Weryfikacja każdego kandydata (na stronie organizatora)

- data **z rokiem** (strona bez roku: sprawdź zgodność dni tygodnia), godziny, adres i dzielnica,
- cena albo „wstęp wolny”, czy potrzebna wejściówka lub zapis, czy nie wyprzedane,
- wiek (wydarzenia dla dzieci), język (po angielsku albo z napisami: ważne dla rodzin cudzoziemców),
- konto Instagram tylko z linku na stronie organizatora (nie zgaduj),
- rozbieżności między źródłami zapisz w notatce.

Pewność: **potwierdzone** (wszystko u organizatora) może iść na slajd; **częściowo** tylko do opisu i bez niepotwierdzonych szczegółów (np. bez ceny, jeśli organizator jej nie podaje); **niepotwierdzone** nie idzie nigdzie.

## Wydarzenia z zapisami (rejestracja, bezpłatne wejściówki, limit miejsc)

Miejsca często kończą się, zanim wydarzenie trafi do planu swojego tygodnia. Wystawa LEGO w Zamku Ujazdowskim (24–26.10.2026): wstęp wolny po rejestracji, zapisy od 10.10, a 20.10 system rezerwacji pokazywał już tylko jeden termin w poniedziałek. Dlatego:

- W notatce researchu osobna sekcja **„Zapisy z wyprzedzeniem”** (4 tygodnie naprzód): co, kiedy, od kiedy zapisy, stan miejsc w dniu researchu, źródło.
- Wydarzenie, na które zapisy już trwają albo ruszą przed następnym planem, idzie do **najbliższego planu tygodnia**, nawet gdy samo jest później: do pierwszego pasującego posta (bezpłatne: poniedziałkowe „Za darmo, a z klasą”), z datą wydarzenia i miejscem zapisów (strona organizatora).
- Przed wpisaniem do planu sprawdź wolne terminy w systemie rezerwacji: sam podgląd kalendarza, bez rezerwacji i bez wpisywania danych. Brak wolnych terminów oznacza wyprzedane: nie idzie. Gdy systemu nie da się sprawdzić (strona w JS, blokada automatów), zapisz w notatce „dostępności nie sprawdzono”.
- W karuzeli swojego tygodnia takie wydarzenie pokazujemy ponownie tylko wtedy, gdy w dniu researchu są jeszcze wolne miejsca.

## Co jest „ekstra”

- premiera, pierwszy weekend wystawy, ostatnia szansa, jedyne takie w Polsce,
- za darmo, ale z klasą (oprowadzania kuratorskie, otwarte pracownie, pokazy),
- coś po angielsku albo z napisami,
- wyjątkowe miejsce (planetarium, dawna drukarnia, pracownia artysty),
- dopasowane do pogody i sezonu (dynie w październiku, iluminacje w grudniu, plenery latem),
- dla rodzin: konkretny wiek, krótki czas, coś do zrobienia rękami.

Odrzucamy: festyny masowe, komercyjne „fabryki atrakcji”, otwarcia marketów, imprezownie, wydarzenia bez strony organizatora. Wydarzenie marki to nie „fabryka atrakcji”, gdy jest jednorazowe, w wyjątkowym miejscu i dostępne dla każdego (właściciel 20.10 o wystawie LEGO w Zamku Ujazdowskim: „propozycja dobra”); w opisie piszemy o wydarzeniu, nie o produktach marki. Tematy trudne (wojna, pamięć) tylko z poważnym tonem albo wcale w lekkim przeglądzie.

## W dniu publikacji

Automat otwiera adresy z `source` posta i sprawdza, czy nic nie zostało odwołane, przeniesione ani wyprzedane (tryb 1 w `CLAUDE.md`).
