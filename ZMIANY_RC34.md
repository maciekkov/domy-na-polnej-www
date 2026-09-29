# RC34 — „Sufit katedralny” w wersji premium

Zakres tej wersji jest celowo ograniczony do sekcji `#wysoki-sufit` (`CathedralCeiling`). Pozostałe sekcje strony, dane, formularze i logika aplikacji pozostają bez zmian.

## Co zostało przebudowane

- Sekcja została odtworzona według zaakceptowanej wizualizacji premium: pełnoekranowa kompozycja editorial z głęboką zielenią, ivory i złotymi detalami.
- Lewy panel otrzymał organiczną krawędź, subtelne botaniczne tło, szeryfowy nagłówek oraz zaakcentowane kursywą słowo „charakter”.
- Wartość `do 5,82 m` zachowano i wyeksponowano w dużej typografii wraz z osobnym piktogramem wysokości.
- Oryginalna zatwierdzona wizualizacja wnętrza `int11c-idz-do-jadalni.webp` pozostała bez podmiany. Zmieniono wyłącznie sposób jej kadrowania i prezentacji.
- Zdjęcie otrzymało organiczną maskę, podwójny cienki złoty obrys, miękką warstwę liści i podpis wizualizacji.
- Dolna część „Własna działka. Ogród za tarasem.” została zintegrowana z kompozycją i otrzymała trzy autorskie ikony: naturalne przedłużenie domu, więcej światła i przestrzeni, prywatność na co dzień.
- Mobile został zaprojektowany jako osobny układ: zielony blok → organiczne zdjęcie → część ogrodowa. Brak poziomego overflow przy 390 px.

## QA

- `tests/source-check.mjs`: 151/151 PASS.
- `tests/experience-rc26.test.mjs`: 5/5 PASS.
- `npm test`: 110 testów PASS; jedyny zatrzymany test (`overlay-history`) wymaga React z `node_modules`, którego instalacja nie mogła się zakończyć w tym środowisku.
- `CathedralCeiling.tsx`: TypeScript `transpileModule` — 0 błędów składni.
- `cathedral-premium.css`: bilans bloków CSS — PASS.
- Kontrolny render Chromium: 1672×941 oraz 390×844; szerokość dokumentu równa viewportowi, bez poziomego overflow.

Pełny build Vite nie został wykonany z powodu niepełnego zestawu zależności npm w środowisku wykonawczym. Paczka finalna nie zawiera `node_modules`.
