# RC36 — wdrożenie i audyt przejść

Baza: dostarczona paczka `domy-na-polnej-www-5.2.0-rc.35-PREMIUM-FLOW(1).zip`.
Cel: rzut → wysoki salon → jasna wstęga → lokalizacja. Referencja wyznacza kompozycję, nie zastępuje materiałów inwestycji.

## Wynik wizualny

Zamiast prostokątnej karty po prawej stronie istnieje teraz jedna pełnoszeroka wstęga SVG. Jej lewy koniec jest wąski; ku prawej powierzchnia rozszerza się, aby pomieścić tytuł i trzy cechy. Dwie niezależne krzywe określają krawędzie wstęgi. Mapa jest rzeczywistą następną sekcją pod tą warstwą, nie kopią obrazu podłożoną pod separator.

Zielona powierzchnia ma płytki górny łuk, własną prawą krawędź i dolne wyjście pod wstęgę. Usunięto mleczny gradient maskujący niepoprawne połączenie z RC35. Fotografia i oba obrysy korzystają z jednego konturu; nie powstają już prostokątne fragmenty ramek ani osobny biały panel. Nie ma limitu szerokości 1800 px. Użyto `width:100%`, bez poszerzania dokumentu przez `100vw` i pasek przewijania.

Wstęga zastępuje wysoki blok „Własna działka…”. Długi opis działki pozostał w HTML: na desktopie jest dostępny dla czytników ekranu, na telefonie również widoczny. Wariant telefonu zachowuje kolejność: opis → zdjęcie → ogród i cechy → lokalizacja i mapa. Nie ściska desktopowych krzywych do szerokości telefonu.

Nie jest to pikselowo identyczna kopia referencji. Pozostawiono właściwy salon, prawdziwą mapę, rzeczywiste podpisy, pełne zdanie „Blisko wszystkiego, co ważne” oraz fonty znajdujące się już w paczce. Te zamierzone różnice zmieniają część kadru i łamanie tekstów. Docelowy mechanizm warstw i połączeń został odtworzony.

## Rzeczywiste rendery i poprawki

Audyt nie opiera się na ręcznie przygotowanym zastępniku sekcji. Załadowano wszystkie komponenty strony głównej wraz z `App`, `SiteDataProvider`, stanem React i rzeczywistymi arkuszami CSS. Uruchomiona strona zawiera 22 sekcje. Użyto Chromium i React 19.1.1. Szczegóły ograniczeń środowiska podano poniżej.

1. Pierwszy render ujawnił zbyt dużą wysokość sceny, za mało miejsca dla tekstów cech oraz częściowe zasłonięcie znacznika na mapie. Zmniejszono odstępy, skorygowano siatkę wstęgi i pionowy kadr mapy.
2. Kolejny render ujawnił przycięcie lampy przez kadr oraz zasłonięcie górnej krawędzi zdjęcia na telefonie przez intro. Zmieniono `object-position`, kolejność warstw mobilnych i czytelność podpisu.
3. Sprawdzono szerokie i pośrednie ekrany. Zwiększono bezpieczny odstęp nagłówka od obrysu zdjęcia. Kontener łączący pozostał statyczny, aby nie zmienić działania istniejącej nawigacji opartej na `section.offsetTop`.
4. Ponownie wyrenderowano finalny kod dla 1440, 1672, 1920, 2560 i 390 px. Obejrzano kompozycję desktopową, warianty pośrednie i telefon. Przeprowadzono testy interakcji dla dziewięciu szerokości.

Zrzuty z finalnego kodu: [desktop 1672 px](flow-rc36/desktop-1672.png), [telefon 390 px — cały fragment z mapą](flow-rc36/mobile-390.png).

## Porównanie pomiarów: 1672 px

Przeglądarka rezerwuje 15 px na istniejący `scrollbar-gutter:stable`. Szerokość pola treści wynosi więc 1657 px; nie jest to dodatkowy margines kompozycji.

| Element | RC35 | RC36 |
|---|---:|---:|
| Wysokość środkowej sceny | ok. 941 px | ok. 523 px |
| Szerokość powierzchni „Własna działka…” | ok. 1064 px | 1657 px — cała szerokość |
| Od zakończenia instrukcji rzutu do początku zielonej sceny | ok. 110 px | ok. 52 px |
| Od początku mapy do początku jej tekstu | ok. 276 px | ok. 82 px |

Wartości są pomiarami DOM w lokalnym renderze, a nie wymiarami wpisanymi na sztywno dla wszystkich ekranów. Rozmiar wstęgi i jej nakładanie się na mapę są połączone jednym parametrem CSS. Przy większych ekranach overlap rośnie proporcjonalnie, zamiast tworzyć pusty pas.

## Testy przeglądarkowe: 144/144

Sprawdzono szerokości **320, 390, 768, 960, 1024, 1440, 1672, 1920 i 2560 px**. Dla każdej wykonano 16 kontroli. Szczegółowy zapis: [runtime-results.json](flow-rc36/runtime-results.json).

W każdej szerokości potwierdzono: brak poziomego overflow; pełną szerokość sceny i wstęgi; rzeczywiste nakładanie wstęgi na mapę; oryginalny załadowany obraz salonu; oryginalne źródło mapy; brak kolizji tekstów z obszarem zdjęcia na desktopie; brak zduplikowanych identyfikatorów SVG; zachowanie obu linków wyznaczania trasy; wybór gabinetu klawiaturą i aktualizację panelu; wybór strefy; przełączenie widoku umeblowanego; aktywną pozycję „Lokalizacja” podczas przewijania; poprawne offsety sekcji; brak błędów runtime i brak żądań do nieistniejących lokalnych zasobów.

Kontrola full-bleed porównuje warstwy z rzeczywistą szerokością kontenera strony, a nie z `innerWidth` uwzględniającym rezerwę na pasek przewijania.

## Testy kodu i danych

- Istniejący `source-check`: **151/151**.
- Istniejące dostępne testy logiki, danych, galerii i standardu: **110/110**.
- Nowe regresje geometrii, oryginalnych assetów i struktury: **6/6** (`npm run test:flow`).
- Istniejący test integracji spacerów: **1136 sprawdzeń**, wszystkie pozytywne.
- Kontrola składni: **59 modułów TS/TSX oraz 17 plików JS/MJS** według istniejącego skryptu; nowe pliki testowe sprawdzono osobno.
- Oryginalne pliki `public/` pozostały identyczne bajtowo. Dotyczy to także obrazów, fontów użytkownika, dokumentów, danych i spacerów.

## Ograniczenia — czego nie potwierdza ten audyt

Pobieranie npm nie jest dostępne w tym środowisku (próba online: `EAI_AGAIN`; `npm ci --offline`: `ENOTCACHED`). **Nie wykonano pełnego produkcyjnego buildu Vite ani pełnego typechecku z zależnościami projektu.** Jeden istniejący test SSR (`overlay-history.test.mjs`) nie uruchomił się z powodu braku pakietów React/ReactDOM Server w Node. Pełne `npm test` nie jest więc raportowane jako zakończone sukcesem.

Do rzeczywistego renderu wszystkich komponentów użyto lokalnej transpilacji TypeScript 5.8.3 do modułów ES i dostępnego lokalnie runtime React 19.1.1. Zależności i wersje w projekcie nie zostały podmienione. Materiały ładowano lokalnie; nie zastępowano komponentów statycznym HTML. Ten tryb dobrze weryfikuje wygląd, CSS, maski oraz działanie strony po stronie przeglądarki, ale nie zastępuje produkcyjnego buildu Vite, SSR ani testu konfiguracji hostingu.

Telefon jest emulowany w Chromium z dotykiem i poprawnym viewportem. Nie przeprowadzono testu na fizycznym iPhonie/Safari ani Firefox. Nie wykonywano wysyłki formularzy, płatności ani operacji w API. Te pliki nie były zmieniane.

## Zakres zmian i odtwarzanie testu

Zmodyfikowano 7 istniejących plików: komponent sufitu, jego arkusz, arkusz przejść, importy arkuszy, pomocniczy wrapper w `App` oraz numery wersji w `package.json` i lockfile. Pozostałe istniejące pliki zachowano. Komponenty `Layout.tsx` i `Location.tsx`, wszystkie dane, formularze i API są niezmienione.

Dodano dwa testy, ten raport, wyniki pomiarów i dwa zrzuty. Nie dodano nowych zależności ani fontów z systemu. Lista kontrolna plików znajduje się w `CHANGED_FILES_RC36.txt`.

Na środowisku z dostępem do npm można powtórzyć weryfikację produkcyjną:

```sh
npm ci
npm run test
npm run test:flow
npm run build
npm run test:flow:browser
```

`test:flow:browser` uruchamia właściwy podgląd projektu po buildzie i zapisuje wyniki oraz screenshoty w `qa/rc36`. Przy działającym już serwerze przyjmuje zmienną `DNP_QA_URL`. Skrypt ten jest dołączony do powtórzenia testu na buildzie; w tym środowisku wykonano opisany wyżej równoważny audyt przeglądarkowy w trybie lokalnym, a nie ten skrypt wymagający Vite.
