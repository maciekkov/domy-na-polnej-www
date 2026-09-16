# VISUAL QA — etap 01–10

## Zakres odbioru tej iteracji
Sekcje 09 Harmonogram i 10 Dziennik budowy porównano z planszą referencyjną `5(5).png` oraz wymaganiami sekcji 09–10 w `DNP_DESKTOP_SPEC_V1`. Sekcje 01–08 pozostawiono kompozycyjnie bez zmian.

## Audyt 1 — pierwsze wdrożenie
Wykryte rozbieżności: pionowy zakres obu sekcji był zbyt wysoki względem planszy; markery timeline'u i odstępy opisów były za luźne; inline SVG w build-patchu dziedziczyły zbyt duże wymiary; karty archiwum były za wysokie. Dodatkowo brak było rzeczywistych fotografii budowy, więc nie wolno było kopiować/generować fikcyjnych kadrów ze screena.

## Korekty po audycie
- skrócono wysokość modułu fotografii Harmonogramu i pionowe paddingi;
- skompresowano timeline I–V, status badges i odstępy opis/termin;
- dopasowano footer CTA + komunikat z kaskiem;
- obniżono wysokość featured wpisu i zdjęć kart archiwum;
- ujednolicono rozmiary ikon CTA;
- zachowano dokładnie pięć stanów timeline'u: 2 zakończone, 1 aktualny, 2 planowane;
- dziennik otrzymał 1 wyróżniony + 3 wcześniejsze wpisy, lightbox i linkowalny `?wpis=`;
- dodano breakpoints desktop/tablet/mobile i układ pionowy timeline'u poniżej 960 px.

## Audyt 2 — kontrola końcowa
**Zgodne:** hierarchia 09/12 i 10/12, nagłówki, kolejność, pięć kamieni milowych, język statusów, CTA do dziennika, proporcja wyróżnionego wpisu ~60/40, trzy karty archiwalne, paleta broken-white/olive/graphite, radiusy, subtelny hover/zoom i centralizacja danych.

**Celowo inne:** fotografie dziennika. Plansza pokazuje przykładowe fotografie prac, ale nie zostały dostarczone jako źródłowe assety. Zgodnie z zasadą niewytwarzania fałszywych zdjęć budowy użyto istniejących materiałów projektu jako jawnych placeholderów.

**Do podmiany przed publikacją:** realne fotografie budowy i potwierdzenie, że daty/statusy z planszy są aktualnymi danymi publicznymi.

## Viewporty kontrolne
Wygenerowano kontrolne renderingi pary 09–10 dla 1440 px, 1055 px, 1024 px oraz 390 px. W środowisku wykonawczym nawigacja Chromium do `localhost`/URL jest blokowana polityką administratora, dlatego kontrolny render pary wykonano deterministycznie z tym samym markupiem/CSS i lokalnymi assetami przez `setContent`. Gotowy `dist` został równolegle zaktualizowany i jest serwowany przez `START_PREVIEW`.

## Testy
- `node tests/source-check.mjs` — PASS.
- transpile składni TypeScript/TSX dla wszystkich źródeł — PASS.
- `node --check dist/assets/build/stage-09-10.js` — PASS.
- transpile składni TypeScript/TSX dla wszystkich plików `src` — PASS.
- pełny `npm run build` / Playwright z repo — wymaga lokalnego `node_modules`; paczka wejściowa nie zawierała zależności, a środowisko nie ma dostępu do rejestru npm. Nie raportujemy tego jako PASS.

**Status etapu 09–10:** zachowany jako checkpoint bazowy dla wdrożenia 11–12.


---

## ETAP 11–12 + footer

### Źródła odniesienia
- plansza `6(5).png` — kompozycja, proporcje, rytm i hierarchia wizualna;
- `DNP_DESKTOP_SPEC_V1` — funkcje i treść sekcji 11–12;
- paczka inwestora — rzeczywiste dane i materiały osób / marki.

### Audyt 1 — implementacja bazowa
Pierwszy wariant zachowywał ogólny podział planszy, ale miał zbyt wąską lewą kolumnę sekcji zespołu, przez co H2 łamał się na trzy wiersze. FAQ używał mniej adekwatnego kadru ogrodowego, a w source CSS pozostała starsza, zdublowana wersja styli 11–12. Zidentyfikowano też brak portretu architektki oraz brak zdjęć klientów — tych luk nie wolno było uzupełniać fikcyjnymi osobami.

### Korekty po audycie
- poszerzono lewą kolumnę zespołu w zakresie desktop/tablet landscape i przywrócono dwuwierszowy rytm nagłówka z referencji;
- zachowano trzy realne karty: Maciej Kowalski, Mateusz Kempiński, Małgorzata Rusiniak / MR Atelier;
- dla brakującego portretu Małgorzaty użyto realnego panelu MR Atelier;
- FAQ otrzymał rzeczywisty kadr `front-angle.webp`, wizualnie bliższy planszy;
- pierwsza odpowiedź FAQ została zsynchronizowana z referencyjnym harmonogramem: I kwartał 2026;
- formularz zachowuje `selectedHouse` i został sprawdzony dla `?dom=C`;
- usunięto zduplikowany stary blok CSS, pozostawiając jedną finalną definicję 11–12;
- footer zachowuje strukturę 4 kolumn i nie tworzy fałszywych linków prawnych.

### Audyt 2 — porównanie po korekcie
**Zgodne:** kolejność i rytm Team → FAQ → kontakt → footer, układ 2-kolumnowy, 3 karty zespołu + 2 opinie, trzy wartości z ikonami, 10 pozycji FAQ, pierwszy accordion otwarty, jasna sekcja FAQ, ciemny finał kontaktowy, forma 2-kolumnowa na desktopie, zielone CTA, 4-kolumnowy footer, radiuse/cienie/paleta i line-art.

**Celowo inne względem makiety:** dane osób i materiały są rzeczywiste z paczki inwestora, dlatego nie użyto koncepcyjnych nazw/portretów z planszy. Brak portretu Małgorzaty pokazano przez panel MR Atelier; avatary opinii zastąpiono inicjałami. Numer telefonu jest rzeczywistą wartością z obecnego projektu, nie przykładowym numerem z makiety.

**Dalsze materiały wymagane do 1:1 bez kompromisu:** portret Małgorzaty Rusiniak, fotografie autorów opinii oraz finalne dokumenty prawne/URL-e.

### Screenshoty QA
- `qa/stage-11-12-reference-vs-implementation.png` — referencja obok implementacji;
- `qa/stage-11-12-1440-final.png`;
- `qa/stage-11-12-1024-final.png`;
- `qa/stage-11-12-390-final.png`;
- `qa/stage-11-12-390-full-final.png`.

### Wynik
Po dwóch iteracjach korekty struktura i proporcje są spójne z planszą, a różnice wynikają przede wszystkim z użycia prawdziwych materiałów zamiast koncepcyjnych zdjęć ze screena. Brak poziomego overflow w 1440, 1024, 768 i 390 px.

**Status:** ETAP 11–12 + FOOTER OCZEKUJE NA AKCEPTACJĘ.
