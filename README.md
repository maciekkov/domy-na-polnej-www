# Domy na Polnej — strona 01–12 + panel administratora DEMO

Kompletna strona inwestycji z sekcjami 01–12, galerią, spacerem 360°, panoramą dronową, dokumentami PDF, formularzem oraz spójnym panelem administracyjnym.

Wersja zawiera finalne poprawki wizualne: pełnoekranowy hero, uporządkowany masterplan bez bocznego panelu, numery działek 589/20–589/16, kompaktowy interaktywny rzut, ikony wycięte z dostarczonej planszy, uczciwy placeholder dziennika budowy z newsletterem oraz odświeżony proces zakupu i kontakt MK Develop 2006.

## Najprostszy podgląd

- Windows: uruchom `START_PREVIEW.bat`.
- macOS / Linux: uruchom `./START_PREVIEW.sh` lub `node preview-server.mjs`.
- Strona publiczna: `http://127.0.0.1:4173/`
- Panel: `http://127.0.0.1:4173/administrator`
- Login demo: `admin`
- Hasło demo: `admin`

Gotowy katalog `dist` znajduje się w paczce, więc podgląd nie wymaga budowania projektu.

## Praca developerska

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

Testy przeglądarkowe: `npm run test:visual` i `npm run test:admin` (wymagają działającego serwera podglądu i Chromium Playwright).

## Panel DEMO

Panel obejmuje: Pulpit, Domy i ceny, Budowę, Dokumenty, Zapytania, Analitykę i Ustawienia. Zmiany trafiają najpierw do draftu i stają się widoczne publicznie dopiero po użyciu „Publikuj zmiany”. W tej paczce dane są zapisywane lokalnie w przeglądarce.

Login `admin/admin` nie jest zabezpieczeniem produkcyjnym. Przed wdrożeniem publicznym trzeba podłączyć backend, bazę, hashowane hasła i bezpieczne sesje.

## Bezpieczeństwo integracji cenowej

Gov Sync pozostaje wyłącznie podglądem DEMO. Nie zawiera endpointu ani danych dostępowych i nie może wysłać żadnego żądania zewnętrznego.

Pełne ustalenia i lista materiałów do potwierdzenia znajdują się w `AUDIT_IMPLEMENTACJI.md` oraz `MISSING_CONTENT.md`.
