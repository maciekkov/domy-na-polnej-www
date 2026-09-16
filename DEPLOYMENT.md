# Deployment — Domy na Polnej V6.1

## Build

```bash
npm install
npm run test
npm run build
```

Po buildzie `dist/` zawiera frontend, `.htaccess`, API, strony prawne i `404.html`.

## Prywatna konfiguracja SMTP

Na serwerze utwórz `/api/config.php` na bazie `api/config.example.php` i uzupełnij prawdziwe dane SMTP. Plik jest wykluczony z repozytorium.

## Upload

Wgraj zawartość `dist/` do katalogu WWW `domynapolnej.pl`, następnie dodaj prywatny `api/config.php`. Hosting powinien obsługiwać Apache/mod_rewrite, PHP 8+, wychodzący SMTP TLS oraz zapis do `api/data/`.

## Kontrola po wdrożeniu

Sprawdź: `/` i strony polityk = HTTP 200; losowa trasa i `/administrator` na produkcji = HTTP 404; formularz dostarcza e-mail; PDF, spacer 360°, panorama i mapa działają; po zgodzie analitycznej powstaje anonimowy plik NDJSON.

## Masterplan

Sekcja wyboru domu celowo używa pełnego `public/assets/images/dnp-masterplan.svg` oraz oryginalnego `masterplan-compass.png`. Nie zamieniać masterplanu na WebP ani raster — kompletna grafika SVG z obrysami działek jest nadrzędnym assetem tej sekcji.
