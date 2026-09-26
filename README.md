# Domy na Polnej — 5.2.0-rc.19

Wydanie po audycie mobile. Gotowe pliki serwera: `hosting/public_html/` oraz `hosting/private/`. Instrukcja wdrożenia i konfiguracji Gmail: **WDROZENIE-HOSTING.md**.

W rc.19 po interaktywnym rzucie dodano sekcję o suficie katedralnym z wysokością 5,82 m w najwyższym punkcie salonu. Używa istniejącego zdjęcia ze spaceru wewnętrznego; nie zastępuje materiału technicznego pokazującego pełny przekrój sufitu.

## Build

Node.js >=22.12:

```sh
npm ci
npm run build:hosting
```

Budowanie zachowuje prywatną konfigurację i hasło analityki, jeśli są już w `hosting/private/`; przy pierwszym buildzie generuje dane dostępu. Paczka wdrożeniowa zawiera dotychczasową konfigurację z rc.16. Przy aktualizacji działającego hostingu zachowaj jego katalog private; przenieś do konfiguracji poprawiony adres odbiorcy oraz ustawienia SMTP opisane w instrukcji.

## Podgląd

`node preview-server.mjs` → http://127.0.0.1:4173. Jeśli nie ma dist/, podgląd korzysta z hosting/public_html/. Formularze lokalnego podglądu są symulowane.

## Zmiany rc.6

Mobile: czystszy hero, niższy blok tekstu i maska; mniejsze oznaczenia działek; krótsza karta domu bez dodatkowych CTA; zamykanie karty przyciskiem Wstecz; kompaktowa tabela A–E; usunięty stały dolny pasek kontaktowy; mniejsze odstępy i karty 360°; galeria dopasowująca wysokość do liczby zdjęć. Układ desktop zachowany.

Adres odbiorcy formularza i powiadomień o zmianach na liście przedsprzedaży: mkdevelop2026@gmail.com. Wysyłka wymaga poprawnego SMTP i hasła aplikacji Google. Nie wysyłano próbnych wiadomości do rzeczywistej skrzynki.

Sprawdzone: build TypeScript/Vite, 100 testów logicznych, 1154 kontroli spaceru, mobilna przeglądarka 320/390/430/760 px i desktop 1440 px, Wstecz/X, brak przewijania poziomego, testy magazynu i API zapisów PHP WASM. Pełne materiały historyczne nie są częścią lekkiej paczki.

## Zmiany rc.7
Spacery w poziomie wypełniają okno (cover), z karuzelą na zdjęciu. Wstecz zamyka spacer i panoramę; przełączanie wnętrze/zewnątrz nie tworzy dodatkowych kroków historii. Cookies pojawiają się na pierwszej wizycie i po odświeżeniu, zachowując poprzednią decyzję. Panorama: precyzja highp i natywne DPR ekranu zamiast ograniczenia do 2. Dostępny plik ma 4096×2048; do podmiany na większy potrzebny jest oryginał. Komunikat o natywnym pełnym ekranie kontroluje przeglądarka. Test przeglądarkowy: tests/immersive-rc7.mjs.

## Zmiany rc.9 — analityka

Produkcyjny panel /administrator-control/ pokazuje podsumowania, źródła, urządzenia, domy, spacery oraz historię pseudonimowych odwiedzających. Kliknięcie identyfikatora wyświetla jego wizyty i czas w sekcjach oraz scenach spaceru (wyłącznie po zgodzie analitycznej). Przykładowa ścieżka 19 etapów jest jawnie oznaczonym DEMO i nie zwiększa liczników. Aktualizacja panelu wymaga wdrożenia zarówno nowych plików panelu, jak i api/analytics-summary.php oraz api/analytics-journey.php. Dane sprzed instalacji systemu analitycznego oraz wizyty bez zgody nie są możliwe do odtworzenia. Gov Sync pozostaje zablokowany.

## Panel administratora v5.1 Premium (rc.10)

`npm run build:hosting` tworzy również `/administrator/` z siedmioma zakładkami panelu v5.1. Logowanie na hostingu korzysta z bieżącego hasła w `hosting/private/dnp/DOSTEP-ANALITYKA.txt`; zmiany w zakładkach edytora pozostają lokalnym szkicem w przeglądarce. Zakładka Analityka automatycznie pobiera produkcyjne statystyki i umożliwia przeglądanie historii wizyt. `_old_copy.zip` i jego historia nie są używane. Do wysyłania wiadomości do Gmaila potrzebne jest hasło aplikacji w prywatnej konfiguracji serwera; paczka go nie zawiera. Szczegóły w `WDROZENIE-HOSTING.md`.
