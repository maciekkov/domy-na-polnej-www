# QA — wykonane testy v5

Data: 21.09.2026. Baza: rzeczywista załączona v4. Badano zbudowany projekt, a nie tylko pojedynczy mockup.

| Zakres | Wynik | Dowód |
|---|---|---|
| Warunki źródeł, dane, assety | 147/147 | `node tests/source-check.mjs` |
| Logika, ceny, analityka, publikacja danych | 79/79 testów | `node --test tests/logic-six.test.mjs tests/audit-7-12.test.mjs tests/analytics-runtime.test.mjs` |
| Grafy spacerów | 1154 asercje, 30+14 scen | `node tests/tour-check.mjs` |
| PHP / HTTP / mock SMTP / limity równoległe | 51/51 | `docs/audit-7-12/api-security-test.json` |
| Produkcyjny dist | PASS | `node tests/dist-check.mjs` |
| Składnia | 57 TS/TSX + 15 JS/MJS | `node tests/syntax-check.mjs` |
| Responsywność | 6 szerokości, brak wykrytego overflow/błędów JS/brakujących assetów | `qa/responsive-results.json` |
| Interakcje | 14/14 scenariuszy | `qa/interaction-results.json` |
| Podstrony, JS off, spacery, HTTP | 7/7 scenariuszy | `qa/extra-results.json` |
| Zachowanie danych | wszystkie główne pola site-data zgodne semantycznie z v4 | `qa/data-preservation.json` |

Nie należy sumować różnych kategorii do jednej marketingowej liczby „testów”: asercja, scenariusz i rozmiar viewportu to różne jednostki.

## Warunki przeglądarkowe

Python Playwright + Chromium, faktyczny React z gotowego buildu, zasoby z lokalnego serwera Node. Zarządzana polityka tej przeglądarki blokuje nawigację do URL. Dlatego harness ładuje dokument przez `set_content`, a zasoby mapuje na lokalny serwer; tylko origin/history są adaptowane w środowisku testowym. Produkcyjny kod nie ma tej podmiany. To umożliwiło realne renderowanie i interakcje, ale nie jest testem wdrożonej domeny z prawdziwymi warunkami cookies/Safari/iframe.

Dodatkowo wykonano rzeczywiste żądania HTTP do serwera oraz prawdziwe testy backendu PHP. Zdjęcia obu odtwarzaczy spacerów otwierały się; sprawdzono zmianę scen, hotspoty i komunikaty. Pełne zagnieżdżenie iframe z powodu polityki środowiska wymaga odbioru na hostingu. WebGL nie było dostępne — wynik dotyczy wariantu awaryjnego, nie projekcji GPU.

Brak analityki przed zgodą, zablokowane cookies, wybór B i E, poprawne ceny/działki, przesłanie wyboru do formularza, komunikaty błędów, podgląd bez wysyłki, focus trap/restore, Escape i reduced motion były scenariuszami wykonanymi, nie deklaracją.

## Zmiany testów względem starej paczki

Część fixture'ów i asercji była starsza niż wejściowa v4: inny status C, starsza data cennika, wymóg braku mobilnego modala i bezpośredni import pełnych scen spaceru. Zaktualizowano je do niezmienionych danych rzeczywiście dostarczonej v4 i do nowego kontraktu UX. Dodano regresję awarii cookies i weryfikację lekkiego indeksu scen. Nie zmieniano cen ani statusów, aby „dopasować” produkt do testów.

## Wydajność i dostępność — bez nadużywania wyników

`qa/bundle-sizes.json` zawiera rzeczywiste rozmiary plików i wyliczoną kompresję gzip. Nie jest to Lighthouse ani pomiar czasu pobierania. `BUILD-VERIFIED.json` jawnie zapisuje brak pełnego typechecka. Nie deklarujemy wyniku 100/100, zgodności całej strony z WCAG ani poprawy konwersji bez pomiaru.

Punkty odniesienia: WCAG 2.2, wzorzec dialogu modalnego WAI-ARIA APG oraz dokumentacja Core Web Vitals i LCP. Są to podstawy decyzji projektowych, nie przyznane stronie certyfikaty.

Źródła normatywne i techniczne (sprawdzone w trakcie pracy):

- W3C WCAG 2.2: `https://www.w3.org/TR/WCAG22/`
- WAI-ARIA APG, modal dialog: `https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/`
- web.dev, Core Web Vitals: `https://web.dev/articles/vitals`
- web.dev, Optimize LCP: `https://web.dev/articles/optimize-lcp`
