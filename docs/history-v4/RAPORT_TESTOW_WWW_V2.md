# Raport kontroli WWW — natural flow v2

Data: 19 września 2026.
Baza porównawcza: źródłowa paczka aesthetic-flow-v1 z rozmowy.

## Wykonane kontrole

1. **Rzeczywiste komponenty React w Chromium — PASS.** Uruchomiono `Homes`, `Masterplan`, `NorthIndicator`, `HouseCard` oraz wymagane moduły danych i analityki. Przetłumaczono kod TS/TSX przez lokalny TypeScript 5.8.3, używając prawdziwego środowiska React/ReactDOM 19.1.1. Nie odtworzono ekranu ze zrzutu i nie wygenerowano go modelem obrazowym.
2. **Stany i interakcje — PASS.** Brak wyboru przy starcie, kliknięcia A–E, poprawna karta i cena, synchronizacja zaznaczenia tabeli, hover bez zmiany wybranego domu, powrót do zaznaczonej parceli, Enter na obrysie, Spacja na oznaczeniu, wywołanie `onAsk` z właściwym domem i wybór z listy mobilnej.
3. **Responsywność — PASS.** Szerokości 320, 375, 390, 768, 1024, 1440 i 1865 px. Brak poziomego przepełnienia sekcji. Obraz i warstwa SVG mają te same granice i zachowaną proporcję 1672/941. Kompas mieści się w mapie i nie przecina prostokątów ograniczających obrysy działek. Dekoracja ukryta do 700 px.
4. **Kierunek — PASS.** Wektor (18,18) od środka do czubka północy oznacza 135° od góry ekranu. Czytelne `N`, brak transformacji obracającej, `pointer-events: none`, opis dostępności.
5. **Nowy test regresyjny źródeł — PASS.** `node tests/aesthetic-flow-v2.mjs`: usunięte stare warstwy, obecny właściwy asset, brak nowych `!important`, niezmieniona geometria i zabezpieczenia mobilne.
6. **Składnia — PASS.** Dotychczasowy `node tests/syntax-check.mjs` sprawdził 53 moduły TS/TSX i 14 modułów JS/MJS. To sprawdzenie składni, nie pełny typecheck projektu.
7. **Dane spacerów — PASS.** Dotychczasowy `node tests/tour-check.mjs`: 1152 sprawdzenia, 30 scen wewnętrznych i 14 zewnętrznych, graf przejść spójny.
8. **Ochrona danych.** `public/data/site-data.json`, oba pliki JSON spacerów, `package.json` i `package-lock.json` pozostały identyczne z paczką wejściową. Zdjęcie masterplanu i współrzędne obrysów także nie zostały zmienione.

## Ograniczenia kontroli przeglądarkowej

Środowisko nie udostępniło rejestru npm; `npm ci` zakończyło się błędami dostępu/DNS. Lokalna polityka Chromium blokowała nawigację do serwera podglądu. Dlatego wykonano izolowany test prawdziwych komponentów, wczytując kod, dane, zdjęcia i fonty z pamięci. To nie jest uruchomienie pełnej strony przez Vite.

Środowisko React 19.1.1 pochodziło z zainstalowanych narzędzi Playwright. Wyłącznie na potrzeby podglądu zastosowano lokalny adapter piktogramów SVG zamiast niedostępnego pakietu lucide-react; biblioteka i jej importy w dostarczonej aplikacji pozostają niezmienione. Drobne kształty ikon w podglądzie mogą różnić się od buildu produkcyjnego. Kompas, liście, geometria i CSS są rzeczywistą implementacją v2. Adapter oraz buforowe fonty nie są dołączone do paczki.

Nie potwierdzono pełnego `npm run build`, pełnego typechecka 5.9.2, rzeczywistej wysyłki formularza, serwera PHP/SMTP ani pełnej regresji całego WWW. Test kliknięcia przycisku sprawdza przekazanie właściwego identyfikatora domu do callbacku, a nie doręczenie wiadomości.

## Zastane błędy testów

Zestaw `logic-six`, `audit-7-12` i `analytics-runtime` daje **73/78 zaliczonych testów**. Uruchomiony ponownie na niezmienionej v1 daje te same pięć niepowodzeń. Nie poprawiano danych sprzedażowych ani nie usuwano testów, aby uzyskać sztucznie zielony raport.

Pięć zastanych niezgodności dotyczy: obecności starego `HouseModal.tsx`, nieużywanych plików `Refinement.css`, obecności starego `floorplan.webp`, oczekiwanego w fixture statusu rezerwacji oraz oczekiwanej daty historii ceny. Osobny stary `source-check.mjs` również zatrzymuje się na istniejącym w v1 pliku `hero-desktop.webp`, który jego asercja uznaje za usunięty.

Logi bieżące i porównawcze znajdują się w `qa-natural-flow-v2/`.

## Kontrola po standardowym buildzie

Dodano skrypt do wykonania w normalnym środowisku z dostępem do zależności:

```sh
npm ci
npm run build
node tests/aesthetic-flow-v2.mjs
node tests/aesthetic-flow-v2.browser.mjs
```

Ostatni skrypt testuje pełny build przez istniejący serwer preview projektu, w tym powiązanie wyboru domu z formularzem i adresem URL. Ten test produkcyjny jest dostarczony, ale nie został wykonany w obecnym środowisku.
