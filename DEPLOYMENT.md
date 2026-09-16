# Deployment — Domy na Polnej V6

## 1. Build

```bash
npm install
npm run test
npm run build
```

Po poprawnym buildzie katalog `dist/` zawiera frontend, `.htaccess`, `api/contact.php`, `api/analytics.php`, strony prawne i `404.html`.

## 2. Prywatna konfiguracja SMTP

Na serwerze utwórz `/api/config.php` na bazie `api/config.example.php`.

Minimalnie uzupełnij:

- `recipient`,
- `from_email`,
- `smtp.host`,
- `smtp.port`,
- `smtp.encryption`,
- `smtp.username`,
- `smtp.password`.

Nie publikuj tego pliku w repozytorium i nie przesyłaj go jako załącznika do audytów.

## 3. Upload

Wgraj zawartość `dist/` do katalogu dokumentów domeny `domynapolnej.pl`, a następnie dodaj prywatny `api/config.php`.

Serwer powinien obsługiwać:

- Apache z `mod_rewrite` i `.htaccess`,
- PHP 8+,
- połączenia wychodzące SMTP przez TLS,
- zapis plików w `api/data/` przez użytkownika PHP — tylko dla anonimowych zdarzeń analitycznych.

## 4. Uprawnienia

Zalecane:

- pliki PHP: 640/644 zależnie od hostingu,
- `api/config.php`: możliwie restrykcyjne, np. 600/640,
- `api/data/`: zapisywalne przez PHP, ale niedostępne z WWW; `api/.htaccess` blokuje bezpośredni odczyt.

## 5. Test po wdrożeniu

Sprawdź ręcznie:

1. `/` — HTTP 200,
2. `/polityka-prywatnosci` — HTTP 200,
3. `/polityka-cookies` — HTTP 200,
4. losowa nieistniejąca ścieżka — HTTP 404,
5. `/administrator` — HTTP 404 na produkcji,
6. formularz z poprawnymi danymi — wiadomość dociera do `biuro@domynapolnej.pl`,
7. formularz z błędnym e-mailem — walidacja po stronie strony,
8. po zgodzie analitycznej pojawia się plik `api/data/analytics-YYYY-MM-DD.ndjson`,
9. po odmowie analityki plik nie otrzymuje zdarzeń od tej sesji,
10. linki PDF, spacer 360°, panorama i mapa działają.

## 6. Cache / aktualizacja

HTML ma `no-cache`; obrazy/PDF mają dłuższy cache. Po większej podmianie materiału zachowaj nową nazwę pliku albo dodaj fingerprinting, jeśli hosting/CDN agresywnie cachuje zasoby.

## 7. Backup

Przed podmianą produkcji wykonaj backup aktualnego katalogu WWW oraz prywatnego `api/config.php`.
