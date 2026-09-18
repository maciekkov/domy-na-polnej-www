# Raport weryfikacji — spacer wnętrza

## Wyniki pozytywne

**Dane i integracja źródłowa:** `npm run test:tour` — 830 sprawdzeń, wynik pozytywny. 24 sceny wewnętrzne i 14 zewnętrznych. Wszystkie pliki wymagane przez dane istnieją. Nie ma niedziałających celów ani ślepej strefy: z każdej sceny da się dojść do każdej innej w całym grafie obu spacerów. Sprawdzono również źródłowe podłączenie aktywnego przycisku wnętrza w galerii.

**Rzeczywisty odtwarzacz w Chromium/Playwright:** 3532 sprawdzenia, 304 stany widoku (38 scen × 8 rozmiarów ekranu), 88 klikniętych wewnętrznych przejść. Brak nieobsłużonych wyjątków JavaScript. Sprawdzono:

- obrazy, tytuły, trzy miniatury i zgodność celów;
- położenie środka każdej pinezki względem pełnego zdjęcia oraz możliwość kliknięcia, bez przykrycia przez paski UI;
- podpisy pozostające wewnątrz ekranu;
- strzałki klawiatury, początek i koniec trasy, kliknięcie miniatury;
- pomoc, 13 stref, wybór gabinetu, zamknięcie pomocy klawiszem Escape;
- wejście z hashem sceny i późniejszą zmianę hasha;
- serię szybkich żądań scen bez mieszania ostatniego zdjęcia i tytułu;
- niedostępny render 4:3 zastąpiony szkicem 16:9, właściwe oznaczenie i osobny zestaw współrzędnych;
- błąd obu obrazów i skuteczne ponowienie po ich udostępnieniu;
- brak konfiguracji JSON: komunikat i wyłączenie nieaktywnych strzałek.

Rozmiary: 1440×900, 1280×800, 1024×768, 390×844, 360×640, 320×568, 844×390, 1920×1080. To symulacja rozmiarów w Chromium, nie test na fizycznym iPhonie / Safari.

Metoda: środowisko ma administracyjną blokadę nawigacji najwyższego poziomu przeglądarki. Nie zmieniano tej polityki. Do Chromium wprowadzono oryginalny HTML odtwarzacza, podano lokalne pliki przez przechwytywanie żądań, wykonano niezmieniony produkcyjny JavaScript z dodatkowym hakiem wyłącznie do ustawiania scen na potrzeby testów. CSS i obrazy są rzeczywistymi plikami z tej paczki. Przejścia między dwoma dokumentami spaceru sprawdzono przez cele w danych i pliki docelowe; nie wykonano ich jako zablokowanej nawigacji najwyższego poziomu.

Wynik maszynowy: `browser-qa.json`. Zrzuty 24 wnętrz na komputerze i 24 na telefonie: `qa/spacer-wnetrza/` w głównej paczce. Kontrola składni czterech zmienionych plików TS/TSX: bez błędów (`tsx-syntax-check.json`). Jest to sprawdzenie składni, nie pełny typecheck projektu.

## Czego nie potwierdzono

**Pełnego builda React/Vite, pełnej integracji modal–iframe w uruchomionej aplikacji React, rzeczywistego fullscreen i testów na fizycznych urządzeniach.** Instalacja zależności `npm ci` nie zakończyła się powodzeniem w środowisku przygotowania plików. Dlatego nie dołączono katalogu `dist` i nie oznaczono `npm run build` jako zaliczonego. Przed publikacją należy wykonać `npm ci` i `npm run build` lokalnie. Podgląd `node preview-tour.mjs` działa bez tych zależności.

## Istniejący problem testu całej strony

Oryginalny `npm test` zatrzymuje się na:

```text
Ciężki lub nieużywany asset nadal jest w paczce:
public/assets/images/location-map.png
```

Plik ten był już obecny w dostarczonym archiwum. Jego SHA-256 jest identyczne z oryginałem, co odnotowano w `original-change-check.json`. Nie usuwano niezwiązanych ze spacerem zasobów i nie wyłączano istniejących asercji, żeby sztucznie uzyskać zielony wynik. Log znajduje się w `source-check.log`. To test całej istniejącej witryny, osobny od nowego `npm run test:tour`.

## Zalecana kontrola przed publikacją

Po udanym lokalnym buildzie otwórz pełną stronę, wybierz wnętrze w galerii, przejdź przez pinezki wejścia i tarasu pomiędzy oboma spacerami, sprawdź fullscreen i zamknięcie do galerii. Oceń także własnym okiem progi drzwi i ciągłość wystroju — test geometrii UI nie dowodzi zgodności każdego detalu aranżacji między renderami.

## Powtórzenie testu przeglądarkowego

Skrypt `tests/tour-browser-qa.py` wykonuje powyższy test na rzeczywistych plikach playera. Wymaga Python 3.10+ i pakietu Playwright z przeglądarką Chromium. Opcjonalna zmienna `CHROMIUM_PATH` wskazuje własny plik wykonywalny. Uruchomienie: `python tests/tour-browser-qa.py`. Nie zastępuje to testu pełnej strony po buildzie.
