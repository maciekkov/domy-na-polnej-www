> Raport historyczny. Aktualne ustalenia: docs/audit-premium/AUDYT.md (5.2.0-rc.2).

# Domy na Polnej — raport poprawek v5.1

## Co było faktycznie zepsute

1. **HERO** — jego wysokość i pionowy spacing były większe niż część typowych viewportów. Dolne liczby i kontrolki mogły wypadać poniżej pierwszego ekranu. Dodatkowo warstwa zdjęcia korzystała z ujemnego `z-index`, co było niepotrzebnie kruche.
2. **Etykiety A–E** — selektor w `editorial.css` nadpisywał `transform: translate(-50%, …)` wartością `translateY(-2px)`. Po kliknięciu znikało centrowanie w osi X, więc litera skakała w prawo.
3. **Masterplan + karta domu** — prawa karta miała za dużo pionowych elementów i za wysokie zdjęcie, przez co narzucała wysokość całego wiersza i tworzyła pusty „schodek”.
4. **Rytm pionowy** — ogólny token sekcji był zbyt duży, a kilka komponentów dokładało jeszcze własne marginesy.
5. **Architektura codzienności** — warstwa editorial wymuszała proporcję 4:5; fotografia robiła się niepotrzebnie pionowa. Piktogramy pochodziły z generycznego zestawu ikon.
6. **Galeria** — kontener miał bardzo zaokrągloną geometrię, a przyciski były nadpisane radius `4px`, co dawało wrażenie przycięcia aktywnej zakładki.
7. **Spacer / panorama** — minimalna wysokość kart była większa niż wymagała treść.
8. **Proces zakupu** — łączniki używały znaku `›` osadzonego w kwadratowym elemencie. Wyglądało to jak techniczny placeholder.
9. **Harmonogram** — pozycja statusu zależała od wysokości opisu, więc kapsułki nie trzymały jednej osi.
10. **Dziennik** — pusty stan był klasycznym układem zdjęcie + biały panel i nie wnosił nic charakterystycznego.

## Co wdrożono

- HERO ma osobne reguły dla desktopu, standardowego mobile i niskich ekranów; cała dolna nawigacja mieści się w testowanych viewportach od 320×700 wzwyż.
- Naprawiono transform etykiet A–E u źródła i w warstwie finalnej; zaznaczenie daje wyłącznie delikatny ruch pionowy.
- Karta domu jest niższa od masterplanu przy desktopie 1600 px; zachowuje wszystkie dane, historię ceny, CTA i PDF.
- Tabela ma mocniejsze nagłówki i wartości cenowe.
- Zmniejszono globalny spacing sekcji i lokalne odstępy w najbardziej rozciągniętych modułach.
- Fotografia sekcji architektury ma proporcję 16:10. Dodano cztery autorskie SVG-piktogramy: jeden poziom, działka, ogród od zachodu, pięć pokoi.
- Dodano trzy nowe organiczne dekoracje SVG i rozmieszczono je oszczędnie w kilku sekcjach.
- Zakładki galerii przebudowano jako spójny segmented control.
- Karty Spacer 360 i Panorama mają 375 px wysokości na desktopie.
- Proces zakupu otrzymał pięć autorskich liniowych piktogramów i cienkie łączniki z lekkimi grotami.
- Harmonogram działa na stałej siatce wierszy, dzięki czemu wszystkie statusy są wyrównane.
- Dziennik startowy został przebudowany na duży, image-led moduł z realnym zdjęciem terenu, statusem przygotowania i osią kolejnych publikacji.

## Weryfikacja

Szczegółowe pomiary oraz 14 zrzutów renderu znajdują się w `docs/qa-v5.1/QA_REPORT.md`.

Automatyczne kontrole: 147 kontroli źródeł/assetów, 79 testów Node, 1154 kontroli spacerów, 57 TS/TSX + 15 JS/MJS w kontroli składni, 51 kontroli API/PHP/SMTP/rate-limit. Wszystkie przeszły.

Pełny `tsc` nie był wykonywany, ponieważ ta samowystarczalna paczka nie zawiera katalogu `node_modules`; finalny `dist` został zbudowany dostarczonym portable builderem z vendored TypeScript/React.
