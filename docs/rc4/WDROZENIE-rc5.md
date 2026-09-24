# Uzupełnienie rc.5

Dodano komendę `npm run build:hosting`, która po typecheck i Vite przygotowuje komplet `hosting/public_html` oraz `hosting/private` z konfiguracją i losowym hasłem do analityki. Zachowuje config.php i dane w kolejnych przebudowach. Panel produkcyjny `/administrator-control/` przyjmuje login oraz wygenerowane hasło. Serwer autoryzuje je i przechowuje tylko skrót hasła w prywatnej konfiguracji; dotychczasowa autoryzacja kluczem pozostaje zgodna ze starszymi instalacjami. Magazyn kontaktów, zapisów i analityki pozostaje poza katalogiem publicznym. Szczegóły i warunki docelowego hostingu: `WDROZENIE-HOSTING.md`.

Kontrole: pełny build rc.5; 100 testów logicznych, 1154 kontroli spaceru, 148 kontroli źródeł; test struktury paczki oraz logowania i ścieżki magazynu w PHP WASM, kontrola składni PHP/JS. Rzeczywista poczta i środowisko serwera nie były dostępne do testu produkcyjnego.
