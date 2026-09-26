# Domy na Polnej — audyt Reference Premium, rc.20

24 września 2026. Projekt przebudowany na podstawie 14 dostarczonych wizualizacji. Wynik stanowi responsywną adaptację kompozycji, a nie identyczny raster: zachowano rzeczywiste zdjęcia, treści i funkcje inwestycji. Fonty z renderów nie miały załączonych plików; dobrano lokalne kroje o podobnym charakterze.

## System wizualny

Ciepła kość słoniowa `#f7f5ef`, leśna zieleń `#102e22`, złote akcenty `#d7bc80`. Nagłówki: lokalny Nimbus Roman / Editorial, z kursywą; tekst: Nimbus Sans / Body. Pliki i licencje dołączono. Delikatne obramowania, małe promienie narożników, spokojna hierarchia i mniejsze odstępy zastępują wcześniejsze duże karty. Wygenerowano kompletne tła leśne i kremowe oraz transparentną gałązkę oliwną. Są lokalnymi zasobami projektu, bez zewnętrznego serwisu grafik.

## Referencje i wykonanie

| Referencja | Sekcja | Wdrożone rozwiązanie |
| --- | --- | --- |
| Hero, 5aa51413… | Początek | Zachowana własna tapeta, duży nagłówek szeryfowy, fakty z ikonami, podpis zdjęcia i kompaktowe przyciski. |
| Domy, 91c647a1… | Plan / porównanie | Oddzielne sekcje, tabela i boczna karta, wspólny wybór domu; dane i statusy zachowane. |
| Standard, fdd8c13a… | Standard | Kremowa botaniczna kompozycja, sześć ilustracji, akordeony, oryginalny kolaż i karta PDF. |
| Bezpieczeństwo, ee3da1db… | Bezpieczeństwo | Ciemne tło, trzy filary, dokumenty i prawdziwa fotografia inwestycji. |
| Proces, de93cb49… | Proces zakupu | Pięć etapów z ikonami, złote detale i zwarta kompozycja na zieleni. |
| Harmonogram, d355a0f0… | Harmonogram | Jasne tło, zdjęcie i oś etapów; na telefonie karty przewijane poziomo. |
| Dziennik, 1a2b80ba… | Dziennik budowy | Szeryfowe nagłówki, karty aktualności, mniejsze zdjęcia i pasek Instagram. |
| Zespół, 515c9030… | Zespół | Własne portrety i dane, wstęp z lewej, trzy karty; na telefonie przewijane portrety. |
| FAQ, f62c80d6… | Pytania | Trzy grupy pytań i boczna karta kontaktowa z rzeczywistym zdjęciem. |
| Przedsprzedaż, fe6a1a1b… | Przedsprzedaż | Oryginalne zdjęcie w tle, korzyści z ikonami i jasny formularz. |
| Kontakt, f344dd8f… | Kontakt i stopka | Jednolite leśne tło, złote detale i dwukolumnowa kompozycja. |
| Galeria, 8ae48efb… | Galeria | Mozaika z dużym zdjęciem, dwoma mniejszymi i dolnym kadrem; zakładki i pełny lightbox. |
| Spacer, 22df0be6… | Spacer 360 | Dwie karty wnętrza i otoczenia, zachowane działające spacery. |
| Wysoki sufit, 615f3009… | Wysoki sufit | Zdjęcie obok zielonego panelu, wyeksponowany wymiar 5,82 m i opis ogrodu. |

Pozostałe sekcje — zalety domu, rzut wnętrza, lokalizacja — ujednolicono typograficznie i kolorystycznie. Nie zmieniano faktycznych parametrów inwestycji dla dopasowania do renderu. Wybór domu początkowo pozostaje pusty, zgodnie z zachowaniem źródłowego projektu.

## Skala i responsywność

Sprawdzono wszystkie sekcje na desktopie 1440 × 900, laptopie 1366 × 768 oraz telefonie 390 × 900. Większość sekcji desktopowych mieści się w wysokości pojedynczego ekranu lub blisko niej. Plan i porównanie rozdzielono, aby przerwać długi blok. Sekcje nie mają sztucznego ucinania treści do wysokości ekranu. Na telefonie treść płynie w pionie; rozbudowany standard, FAQ i formularze wymagają więcej niż jednego ekranu, aby zachować czytelność. Testy nie wykazały poziomego przepełnienia dokumentu. Zrzuty poszczególnych sekcji są w podfolderze `screenshots`; raport wymiarów w `visual-report.json`.

## Weryfikacja

- Kompilacja TypeScript i produkcyjne buildy Vite strony oraz panelu: zaliczone.
- Kontrola źródeł: 90 warunków, brak brakujących i nieodwoływanych zasobów.
- Kontrola paczki `dist`: zaliczona; panel oddzielony, brak sekretów w publicznym bundle.
- Kontrola spacerów: 1136 sprawdzeń, 29 scen wnętrz i 14 scen zewnętrznych.
- Testy funkcjonalne Chromium: 320, 390, 768, 1024 i 1440 px. Wybór domu, karta / panel mobilny, galeria i klawiatura, FAQ, akordeony standardu, walidacja formularzy, zachowanie danych po symulowanym błędzie 503, zakładki rzutu i uruchamianie spaceru. Raport: `interaction-report.json`.
- Audyt wizualny: wszystkie sekcje, sprawdzenie obrazów i błędów JavaScript. Wygenerowane tła przycięto tak, aby roślinność pozostała przy krawędziach; poprawiono mobilną mozaikę i proporcje portretów.
- Z istniejących testów Node 100/101 zaliczonych. Jeden test integracji Gov nie mógł się wykonać z powodu braku interpretera PHP (`spawnSync php ENOENT`). Kontrolę spacerów uruchomiono osobno, ponieważ pełna komenda zatrzymuje się na tym teście.

Nie wykonywano publikacji, zmian danych na serwerze ani rzeczywistej wysyłki e-mail. PHP, SMTP i integracje serwerowe należy zweryfikować w środowisku docelowego hostingu. Podgląd Node służy stronie i interakcjom przeglądarkowym, nie zastępuje serwera PHP.

## Zawartość i dalsza edycja

`dist/` zawiera skompilowaną stronę do wdrożenia. `src/`, `public/`, `api/`, testy, konfiguracja i pliki zależności zawierają pełny projekt. Najważniejszy nowy arkusz to `src/styles/reference-premium.css`. Wygenerowane tła znajdują się w `public/assets/images/decor/`. Własne zdjęcia hero, inwestycji i zespołu pozostają w projekcie.
