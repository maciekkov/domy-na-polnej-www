# Wdrożenie po poprawkach 7–12

Pełna instrukcja: `AUDYT_POPRAWEK_7-12.md`. Po buildzie wdrażaj całe `dist`, łącznie z pięcioma katalogami `dom-*/`, API `lib/`, `event-names.json` i `.htaccess`. Nie nadpisuj prywatnego `api/config.php` swoim przykładowym plikiem. Używaj PHP >=8.1 i TLS dla SMTP; katalog limiterów/logów najlepiej poza webrootem.

Zmiana ceny/statusu: `content:publish -- oferta.json --target dist` odświeża JSON, HTML i sitemapę. Wgrywaj komplet zmienionych plików, nie sam JSON. Na hostingu Nginx skonfiguruj blokadę `api/data`, `api/lib`, konfiguracji i katalogu eventów oraz prawidłowe 404/cache — reguły Apache nie działają automatycznie.

Przed publikacją należy pomyślnie wykonać build, `test:dist` i E2E. W środowisku przygotowania kodu pełny build był zablokowany brakiem dostępu do npm.

---

# Wdrożenie — aktualizacja 1–6

1. Zainstaluj Node.js 22.12+ z linii 22 i uruchom `npm ci`.
2. Wykonaj `npm test`, `npm run build`, `npm run test:dist`, a następnie testy Playwright zgodnie z README.md.
3. Przed podmianą zrób kopię aktualnej strony i konfiguracji serwera.
4. Prześlij **zawartość `dist/`**, w tym ukryte `.htaccess`, do katalogu publicznego hostingu. Nie publikuj źródeł, testów, kopii demo ani `backups/`.
5. Zachowaj własny działający `api/config.php` i prywatne dane na hostingu. Nie są dołączone do paczki. Formularz wymaga poprawnego SMTP i PHP; Node preview nie wysyła wiadomości.
6. Potwierdź HTTP 200 dla `/data/site-data.json`, obu JSON-ów spacerów i zdjęć. Potwierdź 404 dla nieistniejących ścieżek i `/administrator` w produkcji.
7. Sprawdź: brak wybranego domu na starcie, wybór z masterplanu i formularza, możliwość „Jeszcze nie wybrałem”, zdjęcia każdego pomieszczenia i obie trasy spaceru.
8. Sprawdź nagłówki cache opisane w README.md. Przy CDN po pierwszym wdrożeniu wyczyść jego stary cache. Na serwerze bez obsługi `.htaccess` wymagane są równoważne reguły.

Aktualizacja danych oferty bez builda: wyeksportuj publiczny `site-data.json`, użyj `content:publish --target dist --check`, następnie `content:publish --target dist` i wyślij wynikowy plik do `/data/`. Polecenie działa lokalnie — nie zapisuje niczego na hostingu. Szczegóły i zasady rewizji w README.md.

**Status tej paczki:** build React/Vite nie został potwierdzony w środowisku przygotowania z powodu niedostępności rejestru npm. Testy wykonane i zablokowane rozdzielono w AUDYT_POPRAWEK_1-6.md. Nie pomijaj kontroli po instalacji zależności.
