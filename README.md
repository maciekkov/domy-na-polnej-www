# Domy na Polnej — v5.1 Premium

Kompletna, zmodyfikowana wersja dostarczonej paczki `natural-flow-v4-final`. Źródła, grafiki, backend, testy i gotowy build znajdują się w tym samym katalogu. To nie jest aktualizacja przez kopiowanie fragmentów kodu.

## Uruchomienie podglądu

Wymagany jest Node.js 22.12 lub nowszy. Na Windows uruchom **URUCHOM-PODGLAD-WWW.cmd**, pozostaw okno terminala otwarte i wejdź na `http://127.0.0.1:4173`. Na macOS/Linux: `sh START_PREVIEW.sh`.

Wariant uniwersalny, wykonany w rozpakowanym katalogu projektu:

```sh
node preview-server.mjs
```

Podgląd korzysta z dołączonego folderu `dist`; nie wymaga `npm install`, internetu ani ręcznego składania plików. Nie otwieraj `index.html` przez `file://`. Formularz podglądu **nie wysyła poczty** i informuje o tym w komunikacie. Nie jest to produkcyjny serwer PHP.

## Ponowne zbudowanie po zmianach

Przetestowana ścieżka, bez pobierania zależności:

```sh
node scripts/build-portable.cjs
node tests/dist-check.mjs
node preview-server.mjs
```

Można również uruchomić `BUDUJ-WDROZENIE.cmd`. Portable build korzysta z dostarczonego React 19.1.1 i TypeScript 5.8.3. Kontroluje składnię, ale nie zastępuje pełnego sprawdzania typów.

Standardowa ścieżka deweloperska pozostaje dostępna w `package.json` i `package-lock.json`:

```sh
npm ci
npm run typecheck
npm run build
```

Tej ścieżki nie ukończono w środowisku przygotowania paczki: brak dostępu do rejestru npm i kompletu zależności w cache. Nie przedstawiamy jej jako zweryfikowanej. Dołączony build portable został rzeczywiście wykonany i przetestowany w przeglądarce.

## Struktura

- `dist/` — komplet gotowych plików do wdrożenia na odpowiedni hosting.
- `src/` — React/TypeScript, komponenty, dane pomocnicze i CSS.
- `public/` — aktualne dane, grafiki, rzuty, PDF-y, spacery i panel kontroli.
- `api/` — backend PHP i konfiguracja przykładowa, bez sekretów.
- `scripts/`, `vendor/` — narzędzia builda i licencjonowane zależności portable.
- `tests/`, `docs/qa/`, `docs/qa-v5.1/` — testy, wyniki i zrzuty prawdziwego renderowania.
- `reference-assets/` — zachowane oryginały nieużywanych grafik i poprawionych kart PDF.
- `docs/history-v4/` — historyczne raporty z wejściowej paczki; nie są wynikiem bieżącego audytu.

## Dane i publikacja

Aktualne dane oferty: `public/data/site-data.json`. Po zmianie danych przebuduj stronę, aby HTML bez JavaScript, SEO i aplikacja były zgodne. Spacery mają własne pliki scen w `public/assets/data/` i obrazy w `public/assets/images/spacer-360/`.

Na hosting przesyła się **zawartość `dist/`, a nie cały projekt**. Konfiguracja SMTP, uprawnienia serwera, dokumenty i informacje wymagające potwierdzenia są opisane w `BRAKI_I_WDROZENIE.md`. Nie nadpisuj istniejącej konfiguracji ani danych formularza na serwerze. Ta paczka nie została wysłana na GitHub ani opublikowana w domenie.

Przeczytaj `RAPORT_POPRAWEK_V5.1.md`, `CHANGELOG.md` i `docs/qa-v5.1/QA_REPORT.md`. Brak plików fontów jest celowy: typografia używa fontów systemowych i nie wymaga połączenia z dostawcą fontów.
