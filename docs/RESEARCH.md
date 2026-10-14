# Research wydarzeń: standard „ekstra”

Właściciel 14.10.2026: „chcę, żeby te wydarzenia były naprawdę dobrze i głęboko zriserczowane, to ma być ekstra”. Ten plik opisuje, jak to robimy. Wzór pierwszego researchu: `research/2026-10-16-weekend.md`.

## Przebieg

1. **Kontekst:** `node tools/pogoda.mjs` (pogoda, sezon), `docs/KALENDARZ_ZRODLA.md` (święta, rocznice, cykliczne imprezy), mecze warszawskich drużyn **u siebie** (Legia na Łazienkowskiej i inne; ekstraklasa.org, strony klubów). Wyjazdowych nie zapowiadamy.
2. **Pomysły** z agregatorów (tylko jako trop, nigdy jako potwierdzenie): Kids in the City (przewodnik miesięczny i lista weekendowa), PIK (tag „za darmo”), Go2Warsaw, waw4free, terazwarszawa, Instagram organizatorów (`node tools/ig-media.mjs <konto>`).
3. **Przegląd instytucji** (kalendarze na stronach): Zachęta, MSN, MNW i Muzeum Plakatu, Muzeum Warszawy z oddziałami (Praga, Wola, Pracownie), Wilanów, Łazienki, Zamek, POLIN, Muzeum Powstania, Kopernik, Filharmonia Narodowa, Teatr Wielki, Nowy Teatr, Teatr Studio, Teatr Baj, Teatr Lalka, Teatr Guliwer, Opera Królewska, CSW Zamek Ujazdowski, Koneser, Elektrownia Powiśle, Hala Koszyki, ZOO, Ogród Botaniczny, Wola Jazz i kluby muzyczne.
4. **Co najmniej 20 kandydatów** (mniej więcej po połowie dla dorosłych i rodzin, w tym 2–3 sezonowe), z nich wybór 8–9 do karuzeli.

## Weryfikacja każdego kandydata (na stronie organizatora)

- data **z rokiem** (strona bez roku: sprawdź zgodność dni tygodnia), godziny, adres i dzielnica,
- cena albo „wstęp wolny”, czy potrzebna wejściówka lub zapis, czy nie wyprzedane,
- wiek (wydarzenia dla dzieci), język (po angielsku albo z napisami: ważne dla rodzin cudzoziemców),
- konto Instagram tylko z linku na stronie organizatora (nie zgaduj),
- rozbieżności między źródłami zapisz w notatce.

Pewność: **potwierdzone** (wszystko u organizatora) może iść na slajd; **częściowo** tylko do opisu i bez niepotwierdzonych szczegółów (np. bez ceny, jeśli organizator jej nie podaje); **niepotwierdzone** nie idzie nigdzie.

## Co jest „ekstra”

- premiera, pierwszy weekend wystawy, ostatnia szansa, jedyne takie w Polsce,
- za darmo, ale z klasą (oprowadzania kuratorskie, otwarte pracownie, pokazy),
- coś po angielsku albo z napisami,
- wyjątkowe miejsce (planetarium, dawna drukarnia, pracownia artysty),
- dopasowane do pogody i sezonu (dynie w październiku, iluminacje w grudniu, plenery latem),
- dla rodzin: konkretny wiek, krótki czas, coś do zrobienia rękami.

Odrzucamy: festyny masowe, komercyjne „fabryki atrakcji”, otwarcia marketów, imprezownie, wydarzenia bez strony organizatora. Tematy trudne (wojna, pamięć) tylko z poważnym tonem albo wcale w lekkim przeglądzie.

## W dniu publikacji

Automat otwiera adresy z `source` posta i sprawdza, czy nic nie zostało odwołane, przeniesione ani wyprzedane (tryb 1 w `CLAUDE.md`).
