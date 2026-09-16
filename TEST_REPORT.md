# TEST REPORT — V6

Data: 16.09.2026

## Wykonane w tej paczce

### `node tests/source-check.mjs`
PASS.

Zakres m.in.:
- routing i 404,
- API kontaktowe i analityczne,
- brak `api/config.php`,
- SEO,
- 17 FAQ,
- harmonogram 0 zakończonych / 1 aktualny / 4 planowane,
- brak newslettera DEMO,
- nowe assety WebP,
- brak ciężkich oryginałów produkcyjnych,
- limit wielkości `public`,
- focus-trapy i zachowanie tabów w kodzie,
- strony prawne,
- produkcyjne dane kontaktowe.

Wynik katalogu `public`: ok. 27,6 MB.

### Walidacja składni TS/TSX
PASS przy transpilacji składniowej 45 plików TypeScript/TSX przez TypeScript compiler API.

### PHP syntax
PASS:
- `api/contact.php`
- `api/analytics.php`

## Testy wymagające zainstalowanych zależności

`npm run build`, `npm run test:visual` i `npm run test:admin` są przygotowane do pełnego QA po `npm install`.

Środowisko robocze użyte do przygotowania paczki nie miało dostępu DNS do `registry.npmjs.org`, więc nie można było w nim dokończyć świeżego `npm install` i uczciwie uruchomić Vite/Playwright. Z tego powodu raport nie deklaruje fałszywego PASS dla builda przeglądarkowego.

Po instalacji zależności uruchom:

```bash
npm run test:all
```

Test automatycznie:
- buduje `dist`,
- uruchamia lokalny preview,
- sprawdza 1440/1024/390,
- zapisuje aktualne screenshoty do `qa/`,
- sprawdza FAQ, Hero, harmonogram, formularz, modale, strony prawne i HTTP 404,
- testuje lokalny panel administratora DEMO.
