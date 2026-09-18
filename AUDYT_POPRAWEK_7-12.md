# Audyt i poprawki 7–12 — Domy na Polnej

Data: 18.09.2026. Baza: `domy-na-polnej-www-KOD-poprawki-1-6.zip`.

## Status wydania

W paczce znajdują się zmodyfikowane źródła aplikacji, wygenerowane strony ofertowe, skrypty budowania/publikowania i testy. Poprzednie poprawki 1–6 pozostają. Nie zmieniono danych oferty, harmonogramu, aktualnych renderów ani konfiguracji spacerów (30 + 14 kadrów). Porównanie publicznych JSON-ów z bazą potwierdza ich identyczną zawartość.

**Nie ma potwierdzonego pełnego builda Vite/React ani produkcyjnego `dist`.** Rejestr npm był niedostępny w środowisku (DNS `EAI_AGAIN`); nie udało się zainstalować zależności. Próba builda zatrzymuje się na brakujących bibliotekach/typach. Sprawdzenia składni i testy lokalnych funkcji nie zastępują pełnego typechecka ani E2E Reacta. Nie wysłano też żadnej wiadomości do prawdziwego serwera pocztowego.

## 7. Formularz i dostępność

Zastąpiono rozproszone reguły formularza jednym plikiem `src/styles/sections/contact.css`. Inputy/select/textarea mają tekst 16 px, podstawową wysokość min. 48 px, labelki 14 px, zgody 13 px i checkboxy 24 px. Widoczny obrys wskazuje fokus. Na telefonie pola są w jednej kolumnie.

Dodano `autocomplete`, typy i limity pól, opis wymaganych danych, błędy przypisane przez `aria-describedby` i `aria-invalid`, fokus pierwszego błędnego pola oraz komunikaty statusu. E-mail i wiadomość pozostają opcjonalne. Telefon akceptuje 7–15 cyfr. Zabezpieczenie przed podwójnym wysłaniem działa synchronicznie; pola są blokowane w trakcie wysyłania, a żądanie ma limit czasu. Sukces podglądu nie jest sukcesem dostarczenia maila.

Nie jest to deklaracja zgodności całej witryny z WCAG. Nie przeprowadzono audytu czytników ekranowych, rzeczywistego iPhone’a ani wszystkich stanów całej aplikacji.

## 8. Osobne strony domów A–E

Dodano realne `/dom-a/` … `/dom-e/`, generowane z publicznych danych. Każda ma własny tytuł, opis, canonical, OG/Twitter, H1, działkę, parametry, status, cenę, PDF i link do formularza konkretnego domu. Treść znajduje się w HTML przed wykonaniem JavaScript. Dodano crawlable linki w sekcji domów i karty powiązanych ofert.

JSON-LD obejmuje dom/ofertę, `SingleFamilyResidence`, `Offer`, `RealEstateListing` i breadcrumbs. Status rezerwacji/sprzedaży nie udaje dostępności. Nie dodano wymyślonych współrzędnych, ocen ani dat ważności ceny. Dane strukturalne nie gwarantują rozszerzonego wyniku wyszukiwania. Nowe adresy są w sitemapie; nieznane adresy nadal zwracają prawdziwe 404 na docelowym Apache.

## 9. Jedna cena „od”

`src/lib/offers.mjs` jest wspólną regułą dla hero, HTML, meta i danych strukturalnych. Cena „od” pochodzi tylko z domów o statusie `Dostępny`. Rezerwacje i sprzedane są pomijane. Gdy nie ma dostępnego domu, widnieje „Zapytaj o dostępność”, bez 0/Infinity i bez starej kwoty.

Generator i publikator odświeżają także gotowy HTML, metadane oraz sitemapę. **Nie wystarczy ręcznie podmienić samego JSON-a na serwerze**, bo statyczna treść SEO mogłaby zostać starsza. Polecenie `content:publish` przygotowuje cały zestaw plików, robi kopię poprzedniego JSON-a i aktualizuje HTML oraz dane. Brak wymaganej strony przerywa proces przed zapisem. Zapis pojedynczego pliku jest atomowy; w razie błędu podczas zapisu następuje przywrócenie zmienionych plików. Pełną atomowość całego wydania zapewnia osobny katalog release i przełączenie katalogu serwowanego przez hosting.

## 10. Analityka

`house_pdf_download` działa na faktycznie używanym przycisku PDF, a `house_card_open` jest rejestrowany dla wybranego domu po pojawieniu się jego karty w widoku. Powtórne rendery tej samej karty nie nabijają odsłon. Usunięto martwy `HouseModal` i jego nieużywany obraz `floorplan.webp`.

Dodano jeden katalog dozwolonych zdarzeń JS/PHP. Bez zgody nie ma wysyłki analityki. Awaria storage/fetch nie blokuje interfejsu. Cofnięcie zgody ma pierwszeństwo nawet wtedy, gdy przeglądarka odmawia zapisu nowej wartości. Zmiana zgody w innej karcie jest respektowana. Diagnostyka localhost pozostaje lokalna. Podgląd formularza nie rejestruje `contact_submit` jako wysłanej wiadomości do biura.

## 11. Endpointy

Wspólne zabezpieczenia są w `api/lib/security.php`:

- dozwolone POST/JSON, ograniczony rozmiar i walidowane typy pól;
- kontrola Origin / Sec-Fetch-Site; konfigurowalne zaufane originy;
- limity token-bucket per adres oraz globalne, ze wspólnym stanem chronionym blokadą pliku;
- nowe cookies i dowolny `X-Forwarded-For` nie resetują limitu; nagłówki proxy są honorowane wyłącznie dla jawnie wskazanych pośredników;
- klucze IP są zapisane jako HMAC, nie surowe IP; IPv6 grupowane /64;
- 429 z `Retry-After`, kontrola tempa prób wysyłki kontaktu, bezpieczne błędy 503;
- dzienniki analityki do 4 MiB/dzień i 64 MiB łącznie; usuwanie starych plików przy kolejnych zapisach, limit 395 dni;
- whitelist pól logu: brak pól formularza, nagłówków i query string;
- blokada publicznego dostępu do katalogów danych, biblioteki API i konfiguracji.

Domyślne pojemności/refill: analytics 60/min na adres, 1000/h na adres i 3000/min globalnie; kontakt wejściowo 20/10 min na adres i 200/10 min globalnie; próby SMTP 1/45 s, 5/h na adres i 100/dobę globalnie. To token-bucket z możliwością początkowego burstu, nie ścisła liczba żądań w ruchomym oknie.

To ochrona aplikacyjna, nie zabezpieczenie przed pełnym DDoS. Hosting nadal powinien mieć własne ograniczenia. Katalog prywatny najlepiej umieścić poza webrootem. Plik `api/config.php` nie jest dostarczany; należy zachować/uzupełnić własny SMTP. Test SMTP wykorzystał tylko lokalny serwer testowy, nie prawdziwą skrzynkę.

## 12. CSS i utrzymanie

Style publicznych sekcji są skupione w `src/styles/sections/`, wczytywanych jawnie przez `site.css`. Usunięto pliki `*Refinement.css`, martwe selektory dawnych komponentów i zbędne animacje. Formularz ma jeden zestaw reguł zamiast kolejnej warstwy override’ów.

`globals.css`: 2457 → 273 linii. Liczba `!important` w źródłach CSS: 202 → 7, z czego 4 są celowo w publicznej obsłudze reduced-motion, a 3 tylko w lokalnym panelu demo. Usunięto 450 przesłoniętych deklaracji, 72 martwe selektory i 5 nieużywanych animacji.

Porównanie tych samych stanów DOM/CSS w 7 szerokościach (360–1920 px) nie wykazało nieplanowanych różnic poza wzrostem wysokości strony wynikającym z powiększenia formularza. To test statycznego DOM z zastępczymi ikonami/fontami, nie porównanie gotowych bundli Reacta.

## Weryfikacja wykonana

| Zakres | Wynik | Granice sprawdzenia |
|---|---|---|
| source-check | 143 warunki OK | Odwołania, pliki, konfiguracja; public 26,10 MiB |
| Logika 1–12 + analityka | 93 testy OK | Ceny, SEO, walidacja, publikacja, zdarzenia i awarie storage/fetch |
| Spacer | 1152 sprawdzenia OK | 30+14 scen, graf i dane; ustawienia niezmienione |
| PHP/HTTP/SMTP/limiter | 47 kontroli OK | Rzeczywisty lokalny PHP/HTTP, testowy SMTP, równoczesne procesy |
| Apache | 31 kontroli OK | 5 ofert, HTTP/cache/404/blokady prywatnych ścieżek |
| Statyczny układ | 133 kontrole OK | 5 ofert i formularz, 7 szerokości, brak overflow, rozmiary i fokus |
| Składnia | 50 TS/TSX + 14 JS/MJS OK | Globalny TypeScript 5.8.3; nie pełny typecheck |
| PHP lint | 3 pliki OK | contact, analytics, security |
| CSS porównanie | 7 szerokości | Stały DOM; tylko spodziewany wzrost wysokości formularza |
| Dane oferty / spacery | identyczne z bazą | JSON-y porównane bez zmian merytorycznych |
| Pełny build / React E2E | niepotwierdzone | npm niedostępne; testy E2E są przygotowane, ale nie zostały uruchomione |

Sprawdzenie kontrolne znalazło i usunęło m.in. pomyłkę nawiasu w konfiguracji Vite, nadmiernie duży plik globalnych stylów, przypadek cofnięcia zgody przy błędzie storage oraz ryzyko częściowej publikacji SEO. Logi i wyniki znajdują się w `docs/audit-7-12/`.

## Uruchomienie i wdrożenie

Windows: uruchom `BUDUJ-WDROZENIE.cmd`. Wymaga Node.js >=22.12 i dostępu do npm. Skrypt instaluje zależności, wykonuje testy, buduje `dist` i sprawdza jego zawartość. Przerywa przy błędzie; nie otwiera starego `dist` jako rzekomo nowego wydania.

Ręcznie:

```bash
npm ci
npm test
npm run build
npm run test:dist
npx playwright install chromium
npm run test:visual
npm run test:offers
npm run preview
```

Na hosting wgrywa się zawartość `dist`, nie źródła, `node_modules`, testy czy backupy. Zachowaj prywatny SMTP i jego hasło wyłącznie na serwerze. Zaktualizuj cały katalog API wraz z `lib/`, katalogiem zdarzeń i `.htaccess`. Wymagany hosting PHP >=8.1; `.htaccess` jest przeznaczony dla Apache. Nginx wymaga równoważnych reguł prywatności/404/cache i prawidłowego wykonania PHP.

Zmiana oferty po pełnym buildzie:

```bash
npm run content:publish -- moja-oferta.json --target dist --check
npm run content:publish -- moja-oferta.json --target dist
```

Podnieś `revision`. Wgraj zaktualizowane `dist/data/site-data.json`, `dist/index.html`, pięć `dist/dom-*/index.html` i `dist/sitemap.xml` razem. Zmiana grafiki/dokumentów lub kodu wymaga pełnego builda z generatorem wersji zasobów.

## Źródła techniczne

Decyzje wdrożeniowe wynikają przede wszystkim z kodu i danych tej paczki. Zewnętrzne odniesienia użyte do weryfikacji zasad: dokumentacja Google Search Central „Understand the JavaScript SEO basics”; W3C WCAG 2.2 „Target Size (Minimum)” i „Contrast (Minimum)”; OWASP „Denial of Service Cheat Sheet” i „REST Security Cheat Sheet”; schema.org `SingleFamilyResidence` oraz `Offer`; dokumentacja Rollup — konfiguracja wielu punktów wejściowych. Nie jest to certyfikacja WCAG, audyt prawny ani gwarancja pozycji SEO.
