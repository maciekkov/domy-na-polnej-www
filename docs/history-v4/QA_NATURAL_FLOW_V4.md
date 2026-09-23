# Domy na Polnej — Natural Editorial Flow v4
## Weryfikacja wdrożenia 2026-09-19

Wersja została przebudowana zgodnie z uzgodnionym planem: stary botanical pass został cofnięty, poprawki UI pozostawione, a nowe dekoracje ograniczono do pięciu świadomych akcentów na desktopie.

## 1. Stary botanical pass
- usunięto poprzedni `foliage-corner-natural.webp`;
- usunięto poprzedni `botanical-corner.svg`;
- usunięto `homes__foliage` z komponentu Homes;
- usunięto stary ornament z komponentu Kontakt;
- usunięto małe bukiety, dolne pasy traw i dekoracje przy kartach;
- zachowano poprawiony kompas, układ, odstępy, cienie i obramowania UI.

## 2. Nowe assety
Do runtime weszły cztery zoptymalizowane PNG z przezroczystością:
- `linden-corner.png` — realistyczna lokalna gałąź liściasta;
- `leafy-foreground.png` — miękki foreground;
- `leaf-shadow.png` — cień liści;
- `journal-branch.png` — drugi wariant gałęzi do dziennika.

Motyw łąki został przetestowany wizualnie, ale odrzucony: na stronie wyglądał jak doklejony pas. Nie jest dostarczany w runtime.

## 3. Rozmieszczenie — finalnie
### Hero
Bez dekoracji. Hero pozostaje czyste.

### Wybierz swój dom
Jedna duża gałąź lipy w prawym górnym narożniku. Jest mocno wykadrowana i znajduje się poza warstwą UI. Brak dodatkowych traw/bukietów przy masterplanie i tabeli.

### Więcej niż dom
Jeden miękki foreground z lewej strony. Asset jest celowo przycięty `clip-path`, dzięki czemu nie wchodzi w tekst ani ikony benefitów.

### Standard
Brak fizycznych gałęzi. Tylko bardzo subtelny cień liści (8.5% opacity) na papierowym tle.

### Dziennik budowy
Jedna duża gałąź w prawym górnym narożniku, w większości poza kadrem. Brak dolnego pasa traw.

### Kontakt
Jedna spokojna gałąź w prawym górnym narożniku, za warstwą treści. Nie ma ozdobników przy telefonie, e-mailu, checkboxach ani formularzu.

## 4. Zasady globalne
- łącznie pięć akcentów na pełnej stronie desktop;
- dekoracje są wyłącznie na krawędziach sekcji;
- `pointer-events: none` na każdej warstwie dekoracyjnej;
- brak dekoracji na kartach cenowych, tabelach, masterplanie, CTA i formularzu;
- przy szerokości `<= 900px` wszystkie nowe dekoracje są ukrywane — mobile pozostaje czysty.

## 5. Iteracja po kontroli wizualnej
Po pierwszej symulacji sekcji wprowadzono dwie korekty:
- `WhyHome`: pierwotne przesunięcie chowało niewłaściwą część assetu. Zmieniono strategię na lewy foreground + `clip-path`, aby pokazać miękkie liście i jednocześnie nie dotykać tekstu.
- `Standard`: cień przeniesiono z prawej strony (gdzie ginął pod kartą wizualną) na górną/lewą część tła i obniżono do 8.5% opacity.
- motyw łąki został całkowicie odrzucony po kontroli screenów.

## 6. Testy
Przeszły:
- `node tests/aesthetic-flow-v4.mjs` — stary pass usunięty, pięć akcentów, czysty mobile, kompas i geometria masterplanu zachowane;
- `node tests/syntax-check.mjs` — 53 moduły TS/TSX i 14 JS/MJS bez błędu składni;
- `node tests/tour-check.mjs` — 1152 kontrole danych/integracji, 30 scen wnętrz i 14 zewnętrznych, pełna osiągalność scen.

Pełny `npm run build` nie został uruchomiony skutecznie w środowisku kontenera, ponieważ registry npm było niedostępne (`EAI_AGAIN`). Nie jest to przedstawiane jako zaliczony build.

Legacy `source-check.mjs` dotyka historycznej listy nieużywanych assetów i nie jest traktowany jako kryterium tego passa wizualnego. Nie ma brakujących odwołań do nowych dekoracji.

## 7. Screeny QA
Katalog `qa-natural-flow-v4/` zawiera pięć podglądów 1440 px oraz zbiorczy contact sheet. Podglądy powstały przez nałożenie finalnych warstw dekoracyjnych na istniejące rzeczywiste screeny sekcji v3, ponieważ pełny build Vite nie mógł zostać wykonany bez dostępu do npm.
