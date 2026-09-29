# RC33 — „Architektura codzienności” w wersji premium

Zakres tej wersji jest celowo ograniczony do sekcji `#dom` (`WhyHome`). Pozostałe sekcje strony, dane sprzedażowe, formularze i logika aplikacji pozostają bez zmian.

## Co zostało przebudowane

- Układ sekcji odtworzony według zaakceptowanej wizualizacji premium: szeroki layout editorial, mocna typografia szeryfowa, oliwkowy italic i spokojne tło ivory.
- Cztery korzyści otrzymały nowy system autorskich ikon liniowych w subtelnych, warstwowych medalionach oraz numerację `01–04`.
- Zmieniono siatkę benefitów: delikatne podziały, czytelniejsze odstępy i większa hierarchia typograficzna.
- CTA przebudowano jako duży oliwkowy pill z osobnym mikrocopy „Poznaj swój przyszły dom”.
- Zdjęcie domu otrzymało organiczną, asymetryczną maskę, podwójny cienki obrys, miękkie botaniczne warstwy i gradient świetlny.
- Dodano dolny, półtransparentny pas wizualny z trzema ikonami: „Przestrzeń na co dzień”, „Zieleń za drzwiami”, „Przemyślany układ”.
- Dodano subtelne tło botaniczne sekcji na bazie istniejącej grafiki `ivory-wallpaper.webp`.
- Z istniejącej, zatwierdzonej wizualizacji frontu wykonano dwa techniczne kadry WebP (`why-home-property.webp`, `why-home-sky.webp`) wyłącznie po to, aby zachować proporcje kompozycji referencyjnej bez podmieniania domu.
- Mobile został osobno dostrojony; brak poziomego overflow przy 390 px.

## QA

- `tests/source-check.mjs`: 151/151 PASS.
- `tests/experience-rc26.test.mjs`: 5/5 PASS.
- Zestaw dostępnych testów logicznych/źródłowych: 110/110 PASS. `overlay-history.test.mjs` nie został uruchomiony, ponieważ środowisko nie miało zainstalowanego React w `node_modules` po niedostępnym `npm ci`.
- `WhyHome.tsx`: syntaktyczny transpile TypeScript — PASS.
- CSS: kontrola bilansu bloków — PASS.
- Wizualny render kontrolny Chromium: 1672×941 oraz 390×844; brak poziomego overflow.

Pełny build Vite nie został wykonany w tym środowisku, ponieważ instalacja zależności npm nie mogła się zakończyć. Paczka nie zawiera `node_modules`.
