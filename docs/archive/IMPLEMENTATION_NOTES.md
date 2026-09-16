# DNP WWW / Spacer 360 — wdrożone zmiany

## Co zostało zrobione

### 1) Nowy player Spacer 360 (zewnętrzny)
- plik: `public/tour/spacer-360-zewnatrz.html`
- style: `public/tour/spacer-360-zewnatrz.css`
- logika: `public/tour/spacer-360-zewnatrz.js`
- dane spaceru: `public/assets/data/spacer-360-zewnetrzny.json`

Funkcje:
- 14 nazwanych scen,
- maks. 3 hotspoty na scenę,
- dolna karuzela ograniczona do 3 miniatur,
- usunięta minimapa,
- przejścia między scenami przez hotspoty i przyciski prev/next,
- fullscreen + pomoc.

### 2) Lekki konfigurator Spaceru 360
- plik: `public/tour/konfigurator-spaceru-360.html`

Funkcje:
- start bez osadzonych zdjęć,
- import własnych obrazów,
- ustawianie scen, kolejności i sceny startowej,
- dodawanie hotspotów przez klik w podgląd,
- eksport / import JSON zgodnego z playerem,
- możliwość wczytania demo DNP.

### 3) Struktura zdjęć w projekcie
- oryginały PNG: `public/assets/images/spacer-360/exterior/originals/`
- zoptymalizowane WebP: `public/assets/images/spacer-360/exterior/webp/`

Nazewnictwo zostało ujednolicone i zapisane w plikach, np.:
- `01_widok_posesji_od_frontu`
- `03_wejscie_glowne`
- `07_naroznik_ogrodowy`
- `14_dom_i_dzialka_z_gory`

### 4) Zmiany w stronie źródłowej (React)
- hero: `src/sections/Hero/Hero.tsx`
  - slider 2 zdjęć: scena 03 i scena 07, zmiana co 4 sekundy.
- galeria: `src/data/gallery.ts`
  - skrócona galeria elewacji, bez zbliżeń na podcień i taras.
- sekcja spaceru: `src/sections/Gallery/Gallery.tsx`
  - nowy CTA i wybór obszaru spaceru.
- nowy modal wyboru: `src/sections/Gallery/TourChoiceModal.tsx`
- modal iframe został uogólniony: `src/sections/Gallery/TourFrameModal.tsx`
- style uzupełnione w: `src/styles/globals.css`

### 5) Kompatybilność starego linku
- stary plik `public/tour/dnp-spacer-12-kadrow.html` został zamieniony na lekkie przekierowanie do nowego playera.

## Kopia do `dist`
Do folderu `dist/` zostały też skopiowane:
- `dist/tour/spacer-360-zewnatrz.html`
- `dist/tour/konfigurator-spaceru-360.html`
- `dist/assets/data/spacer-360-zewnetrzny.json`
- `dist/assets/images/spacer-360/...`

Dzięki temu sam standalone player i konfigurator są gotowe także po stronie statycznej.

## Uwaga techniczna
Środowisko źródłowe w paczce miało niepełny setup builda (brakujące / niepełne pliki zależności). Dlatego kluczowe zmiany zostały zapisane bezpośrednio w kodzie źródłowym i dodatkowo skopiowane do `dist` tam, gdzie było to możliwe dla modułów statycznych.
