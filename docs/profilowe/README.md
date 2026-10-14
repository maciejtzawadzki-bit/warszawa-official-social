# Profilowe @warszawa_official: projekty (14.10.2026)

Cztery warianty 1080×1080 do wyboru przez właściciela (decyzja odłożona 14.10: „logo zostawmy na razie”).
Instagram nie pozwala zmienić profilowego przez API: wybrany plik właściciel wgrywa w aplikacji (Edytuj profil → Zmień zdjęcie),
ten sam można dać na stronę „Pierwsza Dama WWA” na Facebooku.

| Plik | Opis |
|---|---|
| `1-w-korona-czarne.png` | białe „W” (Newsreader) z koroną na czarnym; w trybie ciemnym zlewa się z tłem |
| `2-wwa-gothic.png` | „wwa” krojem okładek (League Gothic); najczytelniejsze w małym rozmiarze, bez charakteru Pierwszej Damy |
| `3-w-korona-jasne.png` | czarne „W” z koroną na kremowym; w jasnym trybie słabo się odcina |
| `4-w-korona-bordo.png` | białe „W” ze złotą koroną na bordo; polecany: odcina się w obu trybach, korona = Pierwsza Dama, bez herbu i syrenki |

`porownanie.png`: każdy wariant w kółku jak na profilu (150 px) i przy komentarzach (40 px), na jasnym i ciemnym tle.
`profil.mjs`: skrypt renderu (Chromium z tools/node_modules, fonty z tools/fonts); uruchomienie: `node docs/profilowe/profil.mjs <katalog>`.
