# Raport testów — strona 01–12 + panel DEMO

Data weryfikacji: 14.09.2026.

## Wynik końcowy

- `npm run typecheck` — PASS.
- `npm test` — PASS: struktura 01–12, panel, runtime data, zgody i formularz.
- `npm run build` — PASS: produkcyjny katalog `dist` wygenerowany.
- `npm run test:visual` — PASS: 1440, 1024 i 390 px, brak poziomego overflow, sekcje 01–12, galeria, spacer, panorama, plan, Standard, proces, harmonogram, dziennik, FAQ, formularz i modale.
- `npm run test:admin` — PASS: błędne i poprawne logowanie, siedem modułów, publikacja snapshotu do strony publicznej, modal/Escape oraz mobilny sidebar.
- nowy masterplan — PASS: dokładny obraz źródłowy, pięć ścieżek SVG, hover/focus/click oraz synchronizacja domu C z tabelą i modalem.

## Ostrzeżenie builda

Moduł Three.js używany przez panoramę ma około 735 kB przed gzip i jest ładowany dynamicznie dopiero po otwarciu panoramy. Vite zgłasza standardowe ostrzeżenie o rozmiarze chunka, ale nie jest to błąd kompilacji ani obciążenie pierwszego widoku.

## Ograniczenie środowiska

Nie wykonano lokalnego `php -l`, ponieważ interpreter PHP nie jest dostępny w bieżącym środowisku. Endpoint był wcześniej obecny i pozostaje objęty testem źródłowym pod kątem rate limitu, honeypotu, sanityzacji oraz braku sekretów SMTP w repozytorium.
