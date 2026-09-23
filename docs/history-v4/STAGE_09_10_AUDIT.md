# AUDYT ETAPU 09–10

## Źródła prawdy
1. `DNP_DESKTOP_SPEC_V1` — funkcje, kolejność, semantics i treść sekcji 09–10.
2. Plansza referencyjna `5(5).png` — geometria, proporcje, rytm, typografia, statusy i wizualna hierarchia.
3. Istniejący projekt 01–08 — tokeny, header, buttony, radiusy, typografia, wspólny lightbox i zachowanie responsive.

## Iteracja 1 — wdrożenie
Zbudowano dane, komponenty, style i integrację App dla `Schedule` i `Journal`. Pierwszy rendering zachowywał poprawną kompozycję, ale był za wysoki względem referencji, szczególnie w timeline i kartach dziennika.

## Iteracja 2 — korekta po porównaniu
Zmniejszono wysokość głównego renderu, skompresowano odstępy timeline'u, markerów i statusów, obniżono featured journal i obrazy kart, poprawiono rozmiary SVG oraz wyrównano rytm CTA/footer. Dla 1055 px para sekcji ma ok. 1478 px wysokości, czyli praktycznie odpowiada skali planszy 1055×1491 przy uwzględnieniu jej headera.

## Funkcjonalność
- Harmonogram: 5 etapów, 2 `completed`, 1 `current`, 2 `planned`; CTA do `#dziennik`.
- Dziennik: 1 wyróżniony wpis + 3 karty; dane centralne; wspólny GalleryLightbox; obsługa parametru `?wpis=`.
- Responsive: desktop, tablet i mobile; pionowy timeline poniżej 960 px.
- Accessibility: semantyczne `section`, nagłówki, statusy jako tekst + kolor, kontrolki button/link, focus inherited z systemu.

## Znalezione ryzyka
- Brak prawdziwych zdjęć budowy. Nie wolno zastępować ich wygenerowanymi ujęciami udającymi postęp prac. Zastosowano jawne placeholdery z istniejących assetów projektu.
- Daty/statusy z planszy muszą być potwierdzone jako aktualne przed publikacją.
- Pełny Vite build/typecheck nie został uruchomiony w tym środowisku, bo paczka wejściowa nie zawiera `node_modules`, a npm offline nie ma kompletnego cache. Test strukturalny i kontrola składni/JS przechodzą.

## Wynik
Geometria, hierarchia i interakcje sekcji 09–10 zostały wdrożone i po drugim przebiegu QA skorygowane. Blokadą produkcyjną nie jest layout ani kod sekcji, tylko brak finalnych treści fotograficznych i potwierdzonych danych harmonogramu.

**ETAP 09–10 OCZEKUJE NA AKCEPTACJĘ**
