Aktualizacja rc.4: patrz docs/rc4/ZMIANY.md oraz PRZEDSPRZEDAZ.md. Nowy endpoint zapisów przetestowano w PHP WASM; konfiguracja produkcyjna nadal wymaga odbioru. Poniżej wcześniejsze warunki hostingu.

Aktualny odbiór: docs/audit-rc3/AUDYT.md. Wyniki Lighthouse w starszym raporcie dotyczą rc.2.

# Warunki publikacji — 5.2.0-rc.3

## Wykonane

Pełny typecheck i build Vite, testy frontendu/logiki, nawigacja przez rzeczywisty lokalny HTTP, sześć szerokości ekranu, kontrola dostępności axe, Lighthouse, dwa spacery i panorama WebGL. Dowody: docs/audit-premium.

## Do odbioru na docelowym hostingu

1. Zachowaj kopię obecnego serwisu, api/config.php oraz prywatnych danych. Wgraj wyłącznie dist/. Ustaw magazyn danych poza katalogiem publicznym.
2. Skonfiguruj lub zachowaj rzeczywiste SMTP na podstawie api/config.example.php. Wyślij kontrolne zapytanie z docelowej domeny i potwierdź odbiór. Lokalny preview nie wysyła poczty; jego sukces nie potwierdza działania SMTP.
3. Sprawdź HTTPS, 404, blokadę prywatnych plików, uprawnienia PHP, gzip i cache. Dołączono mod_deflate; hosting musi go obsługiwać. Zasady CSP dla skryptów pozostają Report-Only, tak jak w źródle.
4. Wykonaj smoke test na Safari/iOS i Firefox oraz powtórz Lighthouse na docelowej domenie. Lokalna przeglądarka to Chromium; nie jest to terenowy pomiar Core Web Vitals.
5. Potwierdź aktualność danych formalnych. W paczce: sprzedaż prelaunch; ceny null; start budowy marzec 2027; odbiory I kw. 2028; brak aktywnego prospektu; brak wpisów dziennika. To dane wejściowe, nie niezależnie potwierdzony stan inwestycji. Deklaracje rachunku powierniczego i DFG zachowano; brak dokumentów bankowych do ich weryfikacji. Nie zmieniaj salesStage samym przełączeniem flagi bez zatwierdzonego cennika i dokumentów.

## Niewykonane w tym środowisku

Brak PHP CLI uniemożliwił ponowne uruchomienie testów serwera PHP/SMTP. Kod API pozostał niezmieniony. Brak dostępu do konfiguracji hostingu i skrzynki uniemożliwia deklarację gotowości całej produkcji. Gov Sync pozostaje wyłączony; brak dowodu konfiguracji oficjalnego transportu.

Stary opis o aktywnych cenach 779–819 tys. zł został usunięty z tej instrukcji: nie odpowiada aktualnym danym publicznym. Kwoty w testowych fixtures nie są cennikiem inwestycji i nie trafiają do dist/.
