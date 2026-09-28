# Domy na Polnej — rc.26

Baza: dostarczona w tej rozmowie paczka rc.25. Zmiany dotyczą kodu React/CSS; to nie jest makieta zastępująca stronę obrazkiem.

## Wprowadzone zmiany

Sekcja wysokiego sufitu ma zielony panel, tytuł, opis, duży parametr **do 5,82 m** i ikonę wysokości. Po prawej pozostawiono dokładnie ten sam plik renderu wnętrza oraz jasny panel ogrodu. Oba przyciski „Zobacz układ domu” usunięto z DOM. Wartość 5,82 m przyjęto zgodnie z dyspozycją użytkownika; to zadanie nie obejmowało ponownej weryfikacji projektu budowlanego.

Surowy plik `panorama-360-grabik.webp` usunięto wyłącznie z katalogu zwykłej galerii. Nadal jest dostępny dla osobnej przeglądarki panoramy. Nie zmieniono jego rozdzielczości, kompresji ani renderera.

Dwa kafle spaceru/panoramy mają 230 px wysokości na komputerze (wcześniej 460 px), a na telefonie 250 px. Skrócono opisy i zmniejszono dekoracje, zamiast obcinać przyciski. Przyciski mają co najmniej 44 px wysokości.

W Standardzie usunięto odrębny blok „Materiały i instalacje” oraz wysoką kartę z okładką PDF. Pobieranie dokumentu odbywa się przez jeden niski pas na pełną szerokość kontenera strony, pod obiema kolumnami. Dokument PDF nie został zmieniony. Usunięto nieużywaną już miniaturę okładki. Zachowano zastrzeżenie „Standard deweloperski, nie dom pod klucz”. Konstrukcja pozostaje domyślnie rozwinięta.

## Weryfikacja wykonana tutaj

- 105 testów logiki, analityki, istniejących kontraktów i nowych wymagań rc.26: PASS.
- Source-check: 148 warunków; brak brakujących lub nieużywanych zasobów.
- Spacer: 1136 kontroli danych i połączeń scen, 29 scen wnętrza i 14 scen zewnętrznych.
- Kontrola składni: 59 modułów TS/TSX i 17 plików JS/MJS; dostępny lokalnie TypeScript 5.8.3.
- Lokalny render w Chromium wykonany z oryginalnym runtime React z dostarczonego archiwum oraz transpilowanymi źródłami. Ponieważ środowisko blokuje nawigację HTTP w przeglądarce, pliki obrazów i dane przekazano do renderera z pamięci. To sprawdza UI i jego interakcje, nie wdrożenie HTTP/PHP.
- W widokach 320/390/768/1024/1440/1920 px nie stwierdzono poziomego przepełnienia; pasek PDF zajmuje pełną szerokość obu kolumn. Sprawdzono kliknięcia akordeonu, cztery zdjęcia galerii Okolica bez surowej panoramy oraz otwieranie wyboru spacerów. Brak błędów JS w tym lokalnym teście. Szczegóły: `QA_RC26.json`.
- Binarne porównanie potwierdza: render sufitu i plik panoramy są identyczne z rc.25.

Nie udało się pobrać zależności przez `npm ci`: registry.npmjs.org jest niedostępny w tym środowisku. Nie wykonano pełnego typechecka ani builda Vite. Nie przedstawiam kontrolnego renderu jako produkcyjnego builda. Paczka nie zawiera tego eksperymentalnego katalogu `dist`, narzędzi tymczasowych ani `node_modules`.

## Budowanie na komputerze

```sh
npm ci
npm test
npm run build
npm run test:dist
npm run test:experience:browser
```

Ostatni test wymaga dostępnej przeglądarki Playwright; w razie potrzeby `npx playwright install chromium`. Test uruchamia lokalny serwer podglądu i sprawdza widoki 320, 390, 768, 1024, 1440 i 1920 px.

`npm run build` nadal wykonuje TypeScript, build strony, build panelu administratora, `prepare-dist` i `build-hosting`. Wynik: `hosting/public_html` i `hosting/private`. `npm run build:hosting` pozostaje aliasem tej samej ścieżki.

Przy aktualizacji istniejącej domeny nie nadpisuj serwerowego `private/dnp/config.php`, pliku dostępu ani katalogu danych nowo wygenerowanymi plikami. Zachowaj kopię obecnej wersji. Zaktualizuj publiczną część po pomyślnym lokalnym buildzie.

Nie zmieniono repozytorium GitHub ani strony produkcyjnej.

Rozpakuj do nowego, pustego folderu. Nakładanie paczki na starą kopię nie usunie zbędnej miniatury `public/assets/images/standard/standard-cover.webp`.
