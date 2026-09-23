# QA — Domy na Polnej v5.1

Data: 2026-09-21

## Zakres poprawki

Ta iteracja odpowiada bezpośrednio na uwagi z przeglądu v5: przycięty HERO, błędny ruch etykiety A–E, zbyt wysoka karta domu, nadmiar pustej przestrzeni, pionowe zdjęcie w sekcji architektury, generyczne piktogramy, niedopracowane zakładki galerii, za duże karty 360°, słabe strzałki procesu, nierówne statusy harmonogramu i zbyt szablonowy stan pusty dziennika budowy.

## Zweryfikowane wyniki renderu

- HERO 1440×768: dolna belka kończy się na `y=750`, kontrolki na `y=750`, przy viewport `768 px` — brak przycięcia.
- HERO 390×844: kontrolki kończą się na `y=828` przy viewport `844 px`.
- HERO 360×780: kontrolki kończą się na `y=764` przy viewport `780 px`.
- HERO 320×700: kontrolki kończą się na `y=690` przy viewport `700 px`.
- Masterplan: po wybraniu C zmiana pozycji etykiety `dx=0 px`, `dy=+3 px`; usunięto błędny skok w prawo.
- Masterplan desktop 1600 px: mapa `509 px` wysokości, panel domu `492 px`; panel nie tworzy już wysokiego „schodka”.
- Tabela: nagłówki mają wagę `750`, ceny są dodatkowo wzmocnione.
- Architektura codzienności: proporcja obrazu `1.60` (16:10), zamiast pionowego 4:5.
- Galeria: przełącznik kategorii `480×54 px`; brak clippingu. Mobile: `350×48 px`, bez poziomego overflow.
- Spacer 360 / panorama: każda karta `375 px` wysokości na desktopie.
- Proces zakupu: pięć równych medali `72×72 px`; łączniki są linią z lekkim grotem, bez ciemnych kwadratów.
- Harmonogram: wszystkie statusy mają `28 px` wysokości i identyczny top `y=627` w renderze 1600×900.
- Dziennik: nowy układ image-led 1280×582 px, dolny tor etapów ma trzy równe pozycje po `83 px`.
- W sprawdzonych viewportach 1600, 1440, 390 i 360 px nie występuje poziomy overflow.

## Testy automatyczne

- 147 kontroli źródeł i assetów — PASS.
- 79 testów Node — PASS.
- 1154 kontroli spacerów 360° — PASS.
- 57 modułów TS/TSX + 15 JS/MJS — składnia PASS.
- `dist` — PASS.
- 51 realnych kontroli PHP/HTTP/SMTP/rate-limit — PASS.

Portable build jest wykonany lokalnym, deterministycznym builderem. Builder sprawdza składnię TypeScript, ale nie wykonuje pełnego `tsc --noEmit`, ponieważ paczka nie zawiera `node_modules` i środowisko finalizacji nie pobierało zależności z rejestru.

## Zrzuty

Pliki 01–14 w tym katalogu dokumentują kluczowe poprawki desktop/mobile.
