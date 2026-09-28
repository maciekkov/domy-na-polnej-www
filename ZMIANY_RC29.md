# Domy na Polnej — 5.2.0-rc.29

Baza: `domy-na-polnej-www-5.2.0-rc.28-STANDARD-GRID(1).zip`.

## Zmienione sekcje

Sekcja `#standard` została zastąpiona dwoma spójnymi blokami według przesłanego wzoru. Pierwszy: „To, co ważne, jest już w standardzie”, osiem osobnych ilustracji, duży kadr salonu oraz dwa kadry detali. Drugi: „Przemyślane rozwiązania na lata”, sześć rozwijanych kart zakresu oraz karta z okładką i przyciskiem pobierania PDF.

Grafiki pochodzą z dostarczonej planszy. Wycięto ilustracje, usunięto tło w szachownicę i przygotowano 14 WebP o łącznym rozmiarze 242 866 B. Nie generowano nowych wizualizacji. Tekst, przycisk i układ to prawdziwy HTML/React, nie obraz całej makiety. Piktogramy kategorii odtworzono jako SVG. Dodano dekoracje liści, jasne tło, zielone akcenty i układy responsywne.

Karty szczegółów wykorzystują natywne `details/summary`, obsługują klawiaturę i zachowują pełne dotychczasowe opisy techniczne. Link prowadzi do oryginalnego, niezmienionego 15-stronicowego pliku `public/documents/Domy_na_Polnej_Standard_Techniczny_1.0.pdf`. PDF nie jest osadzany ani wczytywany wraz z sekcją. Przy braku adresu dokumentu wyświetlany jest komunikat zamiast niedziałającego przycisku.

Nie zmieniono danych domów, cen, oferty, masterplanu, treści standardu w pliku danych ani pozostałych sekcji strony. Istniejący mechanizm wersjonowania zasobów odświeżył manifest i tokeny cache spacerów. Zastąpiony atlas ikon, kolaż i stary arkusz `standard.css` zostały usunięte.

## Wykonana weryfikacja

- Chromium: rzeczywisty komponent Standard TSX, pełny CSS strony, React/ReactDOM 19.1.1; szerokości 320, 390, 768, 1024, 1440 i 1920 px. Sprawdzono ładowanie grafik, brak poziomego przewijania, rozwijanie sześciu kart myszą i klawiaturą oraz zachowanie przy braku PDF. Obrazy i PDF podano lokalnie przez adresy blob, bez zmieniania kodu dystrybuowanego komponentu.
- Pobranie oryginalnego PDF w przeglądarce: plik wynikowy zgodny bajt w bajt; jest to kontrola lokalna, nie test hostingu HTTP.
- Source-check: PASS, 148 warunków. Dostępne testy jednostkowe/kontraktowe: 110 PASS. Kontrola spacerów: PASS, 1136 sprawdzeń, 29 scen wnętrza i 14 zewnętrznych. Zasoby: brak brakujących i nieużywanych plików.
- Kontrola składni: PASS, 59 modułów TS/TSX i 17 JS/MJS, przy użyciu lokalnego TypeScript 5.8.3. Nie jest to semantyczny typecheck wersją 5.9.2 wskazaną w projekcie.

**Ograniczenie:** nie wykonano pełnego builda Vite, kompletnego typechecku, testu backendu PHP ani pełnej nawigacji aplikacji na serwerze. `npm ci` nie mogło pobrać zależności z powodu niedostępnej sieci/DNS npm. Jeden istniejący plik testowy (`tests/overlay-history.test.mjs`, renderowanie serwerowe React) jest z tego powodu zablokowany; nie zmieniano go, by wymusić wynik pozytywny. Pozostałe 110 testów wykonano osobno. Szczegóły zawiera `QA_RC29.json`.

## Paczka i uruchomienie

To kompletna paczka źródłowa, tak jak wejściowa RC28, a nie gotowy folder `hosting/public_html`. Nie zawiera `node_modules`, `dist`, katalogów tymczasowych ani testowych zrzutów ekranu. Nie publikowano zmian na stronie ani GitHubie.

W środowisku z dostępem do npm (Node >= 22.12):

```sh
npm ci
npm run dev
```

Build do wdrożenia, zgodnie z dotychczasowym mechanizmem projektu:

```sh
npm test
npm run build
npm run test:standard:browser
```

Ostatnia komenda uruchamia dołączony test przeglądarkowy sekcji na zbudowanej stronie. Test tego wariantu produkcyjnego nie został wykonany w tej sesji.
