# Mini design system — v5 Premium

## Kierunek

Architektoniczna strona niewielkiej inwestycji mieszkaniowej. Produkt i dokumenty mają pierwszeństwo przed dekoracją. Duża fotografia, spokojna typografia, oliwkowo-leśna identyfikacja i ciepłe neutralne tła. Bez sztucznych opinii, liczników, złotych ozdobników i animacji przejmujących przewijanie.

## Tokeny i wdrożenie

Źródła prawdy: `src/styles/tokens.css`, `src/styles/editorial.css`, `src/styles/sections/hero.css`. Zachowano bazowe arkusze funkcjonalne v4, a nadrzędna warstwa edytorialna porządkuje kompozycję. Nie przedstawiamy tego jako całkowitego usunięcia wszystkich historycznych deklaracji CSS.

Kolory: forest `#243b33`, deep `#142b23`, olive `#526348`, papier `#fdfcf8`, off-white `#f5f3ec`, tekst pomocniczy `#59675e`. Kolor statusu zawsze wspiera etykietę słowną; nie jest jedynym nośnikiem informacji.

Typografia: systemowy sans-serif (m.in. Segoe UI / system Apple / Arial), Georgia tylko jako spokojny akcent redakcyjny. Nie dołączono ani nie ładuje się fontów sieciowych. Skale nagłówków są płynne (`clamp`), treść zachowuje kontrolowaną długość wiersza i nie jest wciskana w desktopową siatkę na telefonie.

Kontenery, pionowe odstępy, obramowania, promienie, stany formularzy i przycisków są sterowane tokenami i regułami komponentowymi. Duże zdjęcia nie stają się kolejnymi małymi kartami. Minimalistyczne SVG mają wspólną geometrię i grubość kreski.

## Interakcje

Wybór domu: plan, etykieta, tabela/lista, karta, URL i formularz opisują tę samą pozycję. Początkowo brak wyboru. Na małym ekranie karta domu jest osobnym panelem modalnym; nie przesuwa użytkownika w nieczytelne miejsce długiej strony.

HERO jest ręczny i nie zmienia kadru samodzielnie. Ruch ograniczono do krótkich przejść opacity/transform i stanów interakcji; wariant `prefers-reduced-motion` ogranicza animacje i płynny scroll. Bez ruchu niezbędne funkcje pozostają dostępne.

Wszystkie okna korzystają z portalu nad stroną, blokady tła i kontrolowanego fokusu. Escape zamyka okno i przywraca fokus do elementu otwierającego. Link do sekcji przenosi fokus do właściwego nagłówka. Galeria obsługuje klawiaturę.

## Responsive i zasoby

QA: 320, 390, 768, 1024, 1440 i 1920 px. Breakpointy odpowiadają komponowanym elementom (m.in. osobny obraz HERO do 640 px oraz karta mobilna wyboru domu do 960 px), a nie jednemu globalnemu pomniejszeniu.

Oryginalne wizualizacje i geometria parcel pozostają źródłowe. Warianty WebP 640/1024/1672 px oraz mobilny kadr generuje `scripts/generate-responsive-assets.py`. Pełne zdjęcia panoramy i grafy spacerów nie są potrzebne pierwszemu viewportowi. Nieużywane dekoracje i oryginały poprawionych PDF-ów pozostają w `reference-assets/`, poza publikowanym `dist/`.
