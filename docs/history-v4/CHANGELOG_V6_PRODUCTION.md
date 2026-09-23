# V6 — production hardening

Data: 16.09.2026

## Deployment i bezpieczeństwo

- build rozszerzony o `scripts/prepare-dist.mjs`,
- API kontaktowe i analityczne kopiowane do builda,
- prywatny `api/config.php` wykluczony z repo,
- `api/.htaccess` blokuje konfigurację i dane analityczne,
- brak sekretów pocztowych w źródłach,
- lokalny panel administratora DEMO odcięty od domeny produkcyjnej,
- nieznane trasy zwracają 404 zamiast strony głównej.

## SEO

- canonical,
- robots.txt,
- sitemap.xml,
- Open Graph z pełnymi URL,
- Twitter Card,
- JSON-LD Organization + WebSite,
- osobne meta dla stron polityk generowane w buildzie.

## Prywatność i analityka

- działająca Polityka prywatności,
- działająca Polityka cookies,
- banner zgody z możliwością ponownego otwarcia ze stopki,
- first-party analytics uruchamiane tylko po zgodzie,
- identyfikator sesji w `sessionStorage`,
- brak danych formularza, IP i User-Agent w danych analitycznych aplikacji,
- poprawne liczenie sesji w lokalnym panelu DEMO,
- zdarzenia: page view, wybór domu, PDF, galeria, spacer, kontakt, telefon, e-mail i trasa.

## Wydajność

- `public`: ok. 83 MB → ok. 28 MB,
- masterplan SVG 4,6 MB zastąpiony WebP ok. 0,45 MB,
- mapa PNG 2,5 MB zastąpiona WebP ok. 0,11 MB,
- kompas 1,75 MB zastąpiony lekkim WebP,
- rzut 2D SVG zastąpiony lekkim WebP z zachowaniem overlay SVG interakcji,
- zoptymalizowane materiały zespołu,
- usunięte produkcyjne katalogi `originals`,
- usunięte stare preloady Hero,
- Hero renderuje tylko aktywny obraz,
- kolejny slajd jest prefetchowany dopiero po starcie,
- większa część contentu below-the-fold korzysta z lazy loading.

## UX / sprzedaż

- Hero pokazuje cenę od 779 000 zł,
- CTA telefonu nazwane jednoznacznie „Zadzwoń”,
- zespół: „Porozmawiaj z nami”,
- dodany argument „Dom bez prowadzenia budowy samemu”,
- usunięty newsletter DEMO zapisujący e-mail tylko do localStorage,
- link do Instagrama pozostaje realnym kanałem aktualności.

## FAQ / formularz

- 17 aktualnych pytań,
- 3 grupy desktop,
- przy 880–1100 px wcześniejsze przejście na 2 kolumny,
- większa minimalna typografia FAQ i formularza,
- walidacja opcjonalnego e-maila po stronie klienta,
- aktywny link do polityki prywatności,
- tracking telefonu, e-maila i wyznaczania trasy.

## Dostępność

- roving tabindex i strzałki/Home/End dla galerii oraz trybów rzutu,
- focus-trap w modalach wyboru/spaceru,
- zachowane focus-trapy w lightboxie i panoramie,
- Hero nie autoplayuje przy `prefers-reduced-motion: reduce`,
- wszystkie FAQ domyślnie złożone.

## QA

- test źródłowy zsynchronizowany z V6,
- test wizualny zsynchronizowany z FAQ 17 i harmonogramem 0/1/4,
- testy obejmują 1440, 1024 i 390 px,
- testy obejmują legal pages i HTTP 404,
- stare screenshoty QA usunięte; nowe generuje `npm run test:visual`.
