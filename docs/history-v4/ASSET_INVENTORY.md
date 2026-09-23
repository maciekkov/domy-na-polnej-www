# Inwentaryzacja assetów etapu 01–08

| Materiał | Źródło | Zastosowanie |
| --- | --- | --- |
| `hero-desktop.webp` | `elewacja-front-skos-v146.webp` z paczki inwestora | Hero desktop |
| `hero-mobile.webp` | `hero-mobile-front-v100.webp` z paczki inwestora | Hero mobile |
| `masterplan.webp` | `houses-selector-map.webp` z paczki inwestora | Interaktywny wybór A–E |
| `house-front.webp` | `elewacja-front-v146.webp` z paczki inwestora | Karta i modal domu |
| `floorplan.webp` | `layout-plan.webp` z paczki inwestora | Mini rzut w panelu domu |
| `why-home.webp` | `hero-desktop-back.webp` z paczki inwestora | Sekcja „Dlaczego ten dom” |
| `location-map.png` | poprawiona mapa dostarczona przez inwestora | Tło sekcji „Lokalizacja”, ustawione z centrum mapy w wolnej części kadru |
| `layout/plan.webp`, `layout/plan-3d.webp` | materiały źródłowe inwestycji | Interaktywny rzut i widok umeblowany |
| `layout/room-*.webp` | materiały źródłowe inwestycji | Podglądy pomieszczeń w sekcji 05 |
| `gallery/*.webp` | wizualizacje inwestycji | Kategorie Elewacja i Wnętrza |
| `neighborhood/*.webp` | zdjęcia okolicy z paczki inwestora | Kategoria Okolica oraz osobna panorama 360° z drona |
| `tour/dnp-spacer-12-kadrow.html` | gotowy moduł dostarczony przez inwestora | Pełnoekranowy spacer, ładowany na żądanie |
| `standard/standard-lifestyle.webp` | wizualizacja elewacji ogrodowej z paczki inwestora | Główny kadr sekcji 07 |
| `standard/standard-cover.webp` | wyrenderowana okładka dokumentu inwestora | Podgląd PDF w sekcji 07 |
| `Domy_na_Polnej_Standard_Techniczny_1.0.pdf` | oficjalny, 13-stronicowy dokument z paczki inwestora | Podgląd i pobieranie pełnego standardu |
| `karta-dom-a.pdf`–`karta-dom-e.pdf` | paczka inwestora | Pobieranie kart domów |
| Znak w headerze | oficjalny znak używany w istniejącej stronie inwestycji | Header transparentny i po scrollu |

Polygony masterplanu wykorzystują współrzędne A–E z istniejącego modelu danych inwestycji i nie zostały zgadywane na podstawie obrazu.


## 09 Harmonogram
- `public/assets/images/gallery/front-angle.webp` — prawa fotografia/render sekcji, `object-fit: cover`; zastępowalna bez zmiany komponentu.
- Ikony harmonogramu — `lucide-react` (Check, Leaf, HardHat, ArrowRight), jedna rodzina line-art.
- Dane — `src/data/schedule.ts`.

## 10 Dziennik budowy
- `public/assets/images/neighborhood/plots-aerial.webp` — **placeholder layoutowy** najnowszego wpisu do czasu dostarczenia realnej fotografii budowy.
- `public/assets/images/neighborhood/plots-front.webp` — **placeholder layoutowy** Przygotowania drogi.
- `public/assets/images/location-aerial.webp` — **placeholder layoutowy** Prac ziemnych.
- `public/assets/images/gallery/front.webp` — **placeholder layoutowy** Ogrodzenia terenu.
- Wspólny `GalleryLightbox` z sekcji 06 — galeria dziennika.
- Dane — `src/data/journal.ts`.

Status: brak prawdziwych fotografii dziennika jest jawnie zapisany w `MISSING_CONTENT.md`; nie generowano materiału zastępczego udającego realny postęp prac.


## 11 Inwestor / zespół
- `public/assets/images/team/maciej-kowalski.webp` — rzeczywisty materiał inwestora; karta Macieja Kowalskiego.
- `public/assets/images/team/mateusz-kempinski-site-manager-v108.png` — rzeczywisty materiał kierownika budowy; karta Mateusza Kempińskiego.
- `public/assets/images/team/mr-atelier-portfolio-panel.png` — rzeczywisty panel MR Atelier użyty zamiast brakującego portretu Małgorzaty Rusiniak.
- `public/assets/images/team/mr-atelier-logo.png` — logo MR Atelier, gotowe do dalszych zastosowań.
- Dane zespołu — `src/data/team.ts`.

## 12 FAQ + kontakt
- `public/assets/images/gallery/front-angle.webp` — rzeczywisty render inwestycji w lewym teaserze FAQ; zastąpił mniej zbliżony kadr po audycie wizualnym.
- `public/assets/images/botanical-corner.svg` — dekoracja roślinna w finale kontaktowym.
- Dane FAQ — `src/data/faq.ts`.
- Dane kontaktowe i Instagram — `src/data/contact.ts`.
- Endpoint — `api/contact.php`; konfiguracja bez sekretów — `api/config.example.php`.

## Footer
- Oficjalny komponent marki `BrandLogo` z istniejącej implementacji.
- Ikony kontaktowe / social — spójna rodzina line-art.
