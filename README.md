# Domy na Polnej — V6 production-ready source package

Aktualna paczka strony inwestycji Domy na Polnej. Zawiera frontend React/Vite, formularz PHP, first-party analytics, strony prawne, SEO, spacer 360°, panoramę, dokumenty PDF i lokalny panel administratora DEMO.

## Uruchomienie lokalne

Wymagania: Node.js 20+ i npm.

```bash
npm install
npm run dev
```

Następnie otwórz adres pokazany przez Vite, standardowo `http://localhost:5173/`.

Panel administratora DEMO działa wyłącznie lokalnie pod `/administrator` lub `/administracja`.
Login demo: `admin`  
Hasło demo: `admin`

## Podgląd wersji produkcyjnej

Po jednorazowym `npm install` możesz użyć:

- Windows: `START_PREVIEW.bat`
- macOS/Linux: `./START_PREVIEW.sh`

Skrypt wykonuje `npm run build`, tworzy kompletny `dist` i uruchamia podgląd na `http://127.0.0.1:4173/`.

`dist` jest artefaktem generowanym podczas builda, a nie źródłem prawdy repozytorium. Dzięki temu nie ma ryzyka, że w paczce pozostanie stary build niezgodny z kodem.

## Build produkcyjny

```bash
npm run build
```

Build wykonuje kolejno:

1. TypeScript typecheck,
2. Vite production build,
3. `scripts/prepare-dist.mjs`, który dokłada API, statyczne warianty stron prawnych i własny `404.html`.

Wynik: `dist/`.

## Formularz kontaktowy — konfiguracja serwera

Sekretów SMTP celowo nie ma w repozytorium ani w `dist`.

1. Skopiuj `api/config.example.php` do `api/config.php`.
2. Uzupełnij prawdziwe dane skrzynki SMTP wyłącznie na serwerze.
3. Po wdrożeniu umieść ten prywatny plik jako `dist/api/config.php` / `/api/config.php` zależnie od sposobu publikacji.
4. Nie commituj `api/config.php` — jest chroniony przez `.gitignore`.

Domyślna konfiguracja zakłada domenową skrzynkę `biuro@domynapolnej.pl` i serwer SMTP Hostinger zgodnie z poprzednią konfiguracją projektu. Hasło musi zostać wprowadzone ręcznie na serwerze.

## Wdrożenie

Szczegółowa checklista: `DEPLOYMENT.md`.

Najprostszy wariant na hostingu Apache/PHP:

```bash
npm install
npm run build
```

Następnie wgraj zawartość `dist/` do katalogu WWW i dodaj prywatny `api/config.php`.

## Co zmieniono w V6

Najważniejsze elementy:

- poprawny proces build/deployment frontend + PHP API,
- brak sekretów SMTP w paczce,
- rzeczywiste strony Polityki prywatności i Cookies,
- canonical, robots.txt, sitemap.xml, Open Graph, Twitter Card i JSON-LD,
- prawdziwe HTTP 404 dla nieznanych tras,
- panel administratora DEMO dostępny tylko lokalnie,
- usunięty newsletter udający zapis bez backendu,
- first-party analytics po zgodzie, z identyfikatorem sesji i bez danych formularza,
- poprawione liczenie sesji w lokalnym panelu DEMO,
- zoptymalizowane pozostałe assety; masterplan pozostaje celowo 1:1 z poprzedniej wersji: pełny `dnp-masterplan.svg` wraz z oryginalnym kompasem,
- właściwy preload Hero i tylko jeden renderowany obraz Hero naraz,
- lazy-loading elementów poniżej pierwszego ekranu,
- FAQ: 17 pytań, 3 grupy desktop, wcześniejsze przejście do 2 kolumn przy 880–1100 px,
- większa minimalna typografia FAQ i formularza,
- walidacja opcjonalnego e-maila w przeglądarce,
- link do polityki prywatności w zgodzie formularza,
- pełniejsza obsługa klawiatury zakładek i focus-trapy w modalach,
- argument sprzedażowy względem samodzielnego prowadzenia budowy,
- cena „od 779 000 zł” pokazana wcześniej w Hero,
- jednoznaczne CTA „Zadzwoń”.

Pełna lista: `CHANGELOG_V6_PRODUCTION.md`.

## Testy

```bash
npm test
npm run build
npm run test:visual
npm run test:admin
```

Lub pełny przebieg:

```bash
npm run test:all
```

`npm test` jest niezależnym audytem źródeł i sprawdza m.in. wymagany oryginalny masterplan SVG, brak pozostałych ciężkich, nieużywanych assetów, 17 pozycji FAQ, harmonogram 0/1/4, SEO, routing, API i prywatność danych.

Testy Playwright generują aktualne screenshoty do `qa/`.

## Dane publiczne

Kontakt na stronie:

- tel. `+48 455 563 962`
- e-mail `biuro@domynapolnej.pl`
- inwestycja: Grabik, ul. Polna, 68-200 Żary

Dane administratora strony użyte w stopce/polityce prywatności:

- X-SMART DEVELOP sp. z o.o.
- ul. Warszawska 58/3, 68-300 Lubsko
- KRS 0001091198
- NIP 8943230686
- REGON 527945971

## Ważne przed publikacją

Pozostają dwie rzeczy wymagające danych spoza kodu:

1. wprowadzenie prawdziwego hasła SMTP do prywatnego `api/config.php` na serwerze,
2. podpięcie finalnego prospektu informacyjnego, gdy jego publikacyjna wersja będzie gotowa.

Panel `/administrator` nadal jest narzędziem demonstracyjnym do lokalnego zarządzania wariantem strony. Nie jest publicznym CMS-em i celowo nie działa na domenie produkcyjnej.
