# Domy na Polnej — spacer po wnętrzu

Aktualizacja dostarczonej paczki `domy-na-polnej-www(1).rar`, 17.09.2026.
Nie jest to inna strona ani projekt od zera. Zmieniono galerię i moduł spaceru, dodano obrazy, dane i dokumentację. Pozostałe części witryny, dane domów, masterplan, panorama z drona i API pozostały bez zmian.

## Najszybszy podgląd — bez instalowania zależności npm

Rozpakuj całą paczkę. W Windows uruchom `PODGLAD-SPACERU.cmd` (wymaga zainstalowanego Node.js).
Alternatywnie otwórz terminal w folderze paczki i uruchom:

```sh
node preview-tour.mjs
```

Wejdź w przeglądarce na `http://127.0.0.1:4180`. To podgląd działającego modułu, nie zastępcza wersja całej strony React. Oba spacery używają tych samych plików produkcyjnego odtwarzacza. Zatrzymanie serwera: Ctrl+C.

Nie uruchamiaj playera przez dwuklik w plik HTML: odczytuje JSON przez HTTP. Raport `AUDYT_SPACERU_WNETRZA.html` można natomiast otwierać zwykłym dwuklikiem — zawiera osadzone miniatury.

## Pełna strona

W folderze głównym:

```sh
npm ci
npm run dev
```

Na stronie: **Galeria → Spacer 360° → Wybierz spacer → Do wewnątrz**.
Publikacja zgodnie z istniejącym procesem projektu:

```sh
npm run test:tour
npm run build
```

Wgraj zawartość wygenerowanego `dist/` na hosting zamiast źródeł `src/`. W tej paczce nie ma udawanego ani niezweryfikowanego katalogu `dist`.

**Zakres weryfikacji:** moduł spaceru przeszedł testy przeglądarkowe i kontrolę danych; pełnego `npm run build` aplikacji React/Vite nie potwierdzono w środowisku przygotowania paczki, ponieważ instalacja zależności npm nie zakończyła się powodzeniem. Szczegóły i istniejący problem starego `npm test` są w `docs/spacer-wnetrza/TESTY.md`. Przed publikacją wykonaj lokalnie pełny build.

## Co zostało wdrożone

- 24 punkty we wnętrzu: 16 renderów i 8 odpowiadających im szkiców Blendera. 13 pozycji szybkiego wyboru strefy.
- Wejście przez otwarte drzwi, wiatrołap, pralnia, kuchnia, spiżarnia, salon i jadalnia, sypialnia z prywatną łazienką, korytarz, dwa pokoje, łazienka ogólna, gabinet i techniczne widoki strychu.
- Wspólny interfejs i wspólny kod obu spacerów. Ten sam ciemny pasek narzędzi, charakter pinezek, trzy miniatury i nawigacja strzałkami.
- Przejścia między wnętrzem a zewnętrzem przy wejściu i tarasie; możliwość powrotu.
- Pineszki zapisane w procentach pełnego, nieprzyciętego obrazu. Osobne współrzędne szkiców awaryjnych, szczególnie przy renderach 4:3.
- Obrazy WebP bez rozciągania i kadrowania; domyślnie bez powiększania powyżej naturalnych wymiarów. Na krótkich ekranach poziomych miejsce na zdjęcie uwzględnia paski interfejsu.
- Wczytywanie sąsiednich widoków, zabezpieczenie przed pomieszaniem obrazu i podpisu przy szybkim klikaniu, przejście na szkic przy błędzie renderu, czytelny błąd i ponowienie przy niedostępności obu plików.
- Oznaczenie szkiców i strychu jako widoku technicznego. To nadal spacer fotograficzny po kadrach, nie panorama sferyczna ani model 3D.

## Klasyfikacja

`AUDYT_SPACERU_WNETRZA.html` — przegląd wszystkich 29 szkiców z miniaturami dopasowanych renderów, filtrami i listą braków. Otwiera się również offline.

`docs/spacer-wnetrza/klasyfikacja.json` — identyfikatory, nazwy wejściowe, ścieżki wynikowe, kolejność, decyzje i SHA-256 oryginałów.

Z 20 plików renderów 2 są identycznymi kopiami. Z 18 unikalnych renderów 16 użyto w trasie, a 2 niespójne kontrkadry zachowano w `docs/spacer-wnetrza/warianty/`. INT_25 błędnie nazwany w szkicu sypialnią jest łazienką prywatną. INT_04 i INT_19 są dodatkowe, INT_29 jest zasłonięty. Wszystkie 29 szkiców zachowano w folderze `blender/`.

### Brakujące rendery głównej trasy

| Kamera | Widok |
| --- | --- |
| INT_05 | Kuchnia — barek / widok ogólny |
| INT_11 | Sypialnia rodziców |
| INT_21 | Korytarz w stronę salonu |
| INT_13 | Wejście do łazienki ogólnej |
| INT_27 | Wnętrze łazienki ogólnej / prysznic |
| INT_08 | Gabinet — szafa i wyłaz |
| INT_15 | Strych — widok techniczny |
| INT_16 | Strych — konstrukcja wiązarów |

### Jak później podmienić szkic na render

1. Znajdź scenę po `id` w `public/assets/data/spacer-360-wewnetrzny.json`. Nie zmieniaj identyfikatora — do niego prowadzą pozostałe pinezki.
2. Zapisz render jako WebP w `public/assets/images/spacer-360/interior/webp/`, używając identyfikatora sceny jako nazwy pliku. Zachowaj cały kadr.
3. Ustaw `image` na nowy adres `/assets/images/...`, `sourceType` na `render`, `width` i `height` na rzeczywiste wymiary. `fallbackImage` pozostaw skierowane na oryginalny szkic. Zaktualizuj miniaturę `thumb`.
4. Sprawdź położenie punktów `hotspots` na nowym obrazie. `x=0,y=0` to lewy górny róg zdjęcia, `x=100,y=100` to prawy dolny róg. `fallbackHotspots` zachowują położenie na szkicu. Współrzędne nie odnoszą się do ekranu ani pasów tła.
5. Uaktualnij statystyki `stats` i audyt. Test liczbowy w `tests/tour-check.mjs` celowo sprawdza stan tej dostawy (16 renderów + 8 szkiców), więc po uzupełnieniu zmień też jego oczekiwane liczby.

Na kadrze może być najwyżej 3 pinezki. `kind: move` to przejście, `back` — powrót, `turn` — odwrócenie, `detail` — inny widok detalu, `portal` wraz z `tour` — przejście do drugiego spaceru. `rooms` zawiera pozycje menu. Kolejność `scenes` steruje miniaturami; połączenia przestrzenne wynikają z `hotspots`.

## Najważniejsze pliki

```text
public/tour/spacer-360-wewnatrz.html         wejście do wnętrza
public/tour/spacer-360-zewnatrz.html         istniejący spacer zewnętrzny
public/tour/spacer-360-player.js            wspólny player
public/tour/spacer-360-zewnatrz.css          zachowany bazowy wygląd
public/tour/spacer-360-player.css           wspólne poprawki UI i responsywność
public/assets/data/spacer-360-wewnetrzny.json
public/assets/data/spacer-360-zewnetrzny.json
public/assets/images/spacer-360/interior/{webp,blender,thumbs}/
src/data/tours.ts                          ścieżki i liczby pobierane z JSON
src/sections/Gallery/                      podłączenie do pełnej strony
```

W archiwum pominięto `node_modules`, pliki tymczasowe i stare zrzuty QA niezwiązane z tą zmianą. Są nowe zrzuty spaceru i raporty. Nie usunięto żadnych istniejących obrazów używanych przez aplikację, PDF-ów, źródeł strony ani API. Oryginalne PNG wejściowe renderów nie są ponownie dublowane w paczce: źródłem pozostają dostarczone archiwa, a pełnowymiarowe wersje do aplikacji są w WebP.

## Tryb edycji — podgląd celu pineszki

W trybie `?edit=1` kliknięcie pineszki pokazuje teraz w panelu edycji **miniaturę kadru docelowego**, jego nazwę, numer oraz identyfikator. Cel można wybrać z listy albo przewijać przyciskami `←` / `→` obok selektora. Podgląd działa również dla przejść pomiędzy spacerem wewnętrznym i zewnętrznym — edytor pobiera listę scen drugiej trasy i pokazuje właściwy kadr przed zapisaniem wyboru.
