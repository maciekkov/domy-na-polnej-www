# Audyt poprawek 1–6 — Domy na Polnej

## Zakres i źródło

Punktem wyjścia jest najnowsza przekazana paczka `domy-na-polnej-www-INSTALL-spacer360-UX-refactor.zip`. Zmiany obejmują tylko pierwsze sześć punktów audytu i poprawki niezbędne do ich działania. Nie zmieniono cen, dostępności, harmonogramu inwestycji, treści oferty, 30 kadrów wnętrza ani 14 kadrów zewnętrznych. Porównanie fixture sprawdza całe konfiguracje spacerów po pominięciu wyłącznie nowych parametrów `?v=`.

**Paczka źródłowa nie jest potwierdzonym buildem produkcyjnym.** `npm ci` nie mogło pobrać zależności; kontrola `npm ping` potwierdziła `EAI_AGAIN` dla registry.npmjs.org. Próba builda zatrzymała się na brakujących pakietach typów. Pełny typecheck, build Vite oraz E2E strony React i panelu wymagają wykonania po instalacji zależności. Logi i statusy są dołączone — żadna z tych kontroli nie została oznaczona jako zaliczona.

## 1. Brak fikcyjnego wyboru Domu A

Usunięto oba `selectedId ?? 'A'` w App. Galeria, start spaceru i formularz otrzymują `unknown`, dopóki nie ma świadomego wyboru. Formularz zaczyna od „Jeszcze nie wybrałem”. Wybór domu w formularzu synchronizuje zaznaczenie na masterplanie i URL; wycofanie wyboru usuwa parametr `dom`. Poprawne linki `?dom=A`–`E` nadal wybierają konkretny dom; nieprawidłowy kod nie jest podstawiany jako A.

Backend formularza już obsługiwał `unknown`; zachowano ten kontrakt. Backend analityki zapisuje brak konkretnego domu jako null, zamiast sztucznego A. Zwykły poglądowy obraz obok mapy przed wyborem nie jest traktowany jako zainteresowanie domem.

Weryfikacja: analiza przepływu typów i source-check; przygotowany E2E obejmuje wybór, wycofanie, URL, payload formularza i analitykę. E2E React nie został uruchomiony z powodu opisanej blokady środowiska.

## 2. Rozdzielenie demo i danych publicznych

Produkcja czyta `/data/site-data.json` przez SiteDataProvider. Ten sam kontrakt jest używany przez walidator przeglądarkowy, eksport i publikator CLI. W razie błędu pobierania lub kontraktu strona zachowuje ostatni poprawny snapshot; nie udaje potwierdzonej aktualności cen i dostępności — pojawia się komunikat kontaktu z biurem. Limit pobrania wynosi 8 sekund; ponowne sprawdzenie następuje przy powrocie do karty po co najmniej minucie.

Panel demo wymaga trybu DEV, jawnego włączenia i loopback. Import AdminApp jest warunkowy i dynamiczny; jego CSS jest ładowany z modułem demo. Produkcja ignoruje dane demo w localStorage. Kontrola `test:dist` ma dodatkowo sprawdzić brak kodu admina i przykładowego CRM w realnym buildzie.

Dodano osobny import/eksport publicznego JSON-a. Nie eksportuje leadów, prywatnych notatek ani historii demo. Schemat odrzuca nieznane pola, w tym sekret SMTP i dane CRM. Zapis podglądu nadal jest lokalny i jest tak podpisany. Nie jest to zdalny panel administracyjny ani prawny rejestr historii cen.

Publikator sprawdza wyższą rewizję, kontrakt oraz dostępność zasobów, tworzy kopię poza `public` i zapisuje plik atomowo. Tryb `--check` niczego nie nadpisuje, rollback jest jawny. Polecenie działa lokalnie; upload do hostingu pozostaje osobną czynnością. Dane aktualizowane przez JSON nie wymagają przebudowy Reacta.

W drugiej kontroli poprawiono też dwa mylące zachowania: formularz lokalny nie udaje już wysyłki do biura, a aktywna karta PDF jest wyznaczana z Dokumentów, nie z dwóch sprzecznych edytowalnych pól. Nieaktywna karta znika z publicznego przycisku.

Weryfikacja: rzeczywiste testy schematu, aktywnych dokumentów i publikatora na tymczasowych plikach, w tym przerwanie błędnego zapisu, kopia i rollback. Sam zdalny hosting ani SMTP nie były testowane.

## 3. Porządkowanie zasobów

Usunięto 58 plików o łącznej wielkości 58,456,032 B. Każdy ma wpis w `docs/cleanup-six/removed-assets.json`: ścieżka, rozmiar, hash i przyczyna. Usunięcia dotyczą starych oryginałów PNG, nieużywanych wariantów zdjęć, map i dawnych modułów spaceru, a nie aktywnych kadrów.

Zachowano obrazy używane przez konfiguracje, wszystkie potrzebne fallbacki, PDF-y, kompas, panoramę, aktualny rzut 2D oraz dynamicznie ładowane ikony Standardu. Bieżący edytor pinezek pozostaje w paczce. Samego niewystąpienia nazwy w statycznym kodzie nie używano jako wystarczającej przesłanki usunięcia.

| Miara | Przed | Po |
|---|---:|---:|
| Katalog publiczny | 85,156,695 B | 27,518,980 B |
| Same public/assets | 77,604,299 B | 19,985,770 B |
| Redukcja public | — | 67.68% |
| Odwołania do zasobów | — | 136 |
| Brakujące zasoby | — | 0 |
| Nieodwoływane zasoby w public/assets | — | 0 |

To rozmiar deploymentu, nie pomiar transferu pierwszego wejścia i nie wynik Lighthouse/Core Web Vitals.

## 4. Testy i ich wiarygodność

Zastąpiono historyczny source-check jawnym kontraktem aktualnej aplikacji. Aktywny rzut to WebP; listy plików wymaganych i usuniętych są rozłączne. Błąd w wymaganiu nie jest obchodzony usuwaniem poprawnego elementu strony.

Przygotowano osobne kontrole logiki, rzeczywistego dist, publicznego UI i jawnego demo oraz workflow CI. Testy E2E nie są zastępowane mockiem Reacta. Baseline danych i spacerów służy do wykrywania niezamierzonych zmian; przy świadomie zatwierdzonych późniejszych zmianach trzeba zaktualizować właściwe fixture.

| Kontrola | Wynik |
|---|---|
| Source-check | 143 warunki zaliczone |
| Node test runner | 38 testów zaliczonych |
| Graf i zasoby spacerów | 1152 sprawdzenia zaliczone |
| Składnia TypeScript | 48 modułów; TS 5.8.3; to nie pełny typecheck |
| Składnia JS/MJS | 10 plików zaliczonych |
| PHP lint | 3 pliki zaliczone |
| Apache / nagłówki / ETag / 404 | 24 warunki zaliczone na realnym Apache |
| Player w komponencie DOM Chromium | 88 stanów (44 kadry × 2 rozmiary), 108 kliknięć wewnętrznych, 285 sprawdzeń; bez błędów JS |
| Bezpośrednia nawigacja Chromium HTTP | zablokowana przez środowisko: ERR_BLOCKED_BY_ADMINISTRATOR |
| npm ci / pełny build / E2E React | niepotwierdzone; brak dostępu do rejestru npm |

Test komponentu DOM uruchamia rzeczywisty HTML/CSS/player z lokalnie podstawionymi zasobami. Nie jest pełną nawigacją HTTP między stronami, testem integracji z Reactem ani sprawdzeniem layoutu całej witryny. Statyczny graf potwierdza cele przejść między trasami, ale nie należy mylić go z klikaniem ich na docelowym hostingu.

Podczas samokontroli poprawiono również obsługę separatorów ścieżek Windows w generatorze wersji zasobów. Dodano test regresyjny. Dodatkowy test wykonuje rzeczywistą funkcję migracji szkicu edytora: nowe wersje zdjęć nie nadpisują ręcznej etykiety ani współrzędnych pinu.

## 5. Masterplan

Zastąpiono SVG zawierający pełnoformatowy raster nowym `dnp-masterplan.webp`. Zachowano 1672 × 941 px, bez skalowania i kadrowania, oraz identyczny viewBox i wszystkie pięć ścieżek działek A–E. Nakładka pozostaje osobnym lekkim SVG.

Rozmiar: 4 585 421 B → 796 526 B, mniej o około 82,6%. Wybrano WebP quality 94; jest to kompresja stratna o wysokiej jakości, nie plik identyczny piksel w piksel. Skontrolowano obraz wizualnie i porównano geometrię nakładki z niezależnym fixture z paczki bazowej.

## 6. Cache

Dla obrazów, dokumentów i skryptów o stałych nazwach obowiązuje rewalidacja (`no-cache, max-age=0, must-revalidate`); HTML/JSON otrzymują `no-store`. Tylko hashowane zasoby Vite w `assets/build` otrzymują roczne `immutable`.

Generator przed buildem dodaje deterministyczny `?v=` oparty na SHA-256 treści. Dotyczy także dynamicznych ikon Standardu i samodzielnego playera spacerów. Nie zmienia identyfikatorów scen i współrzędnych. Dwie identyczne operacje są idempotentne; zmieniona zawartość tworzy nowy URL. Tokeny powstają PRZED hashowaniem chunka Vite, a nie przez późniejsze manipulowanie wygenerowanym hashem.

Apache potwierdził realne nagłówki oraz odpowiedzi 304 dla niezmienionego pliku i 200 + nowy ETag po podmianie pliku o tej samej nazwie. Nowe URL omijają starsze obrazy, które przeglądarka mogła wcześniej zapisać na 30 dni. Zewnętrzny CDN i konfigurację konkretnego hostingu należy sprawdzić osobno; `.htaccess` nie konfiguruje Nginx.

## Co celowo pozostaje poza tym zakresem

Nie wdrożono punktów 7–12 audytu: nowej typografii formularza, stron SEO domów A–E, automatycznej ceny „od” w hero/meta, przebudowy eventów PDF, rate limitów API ani konsolidacji wszystkich CSS. Nie zmieniono dat inwestycji. Przy zmianie cen przez JSON tekst marketingowy „od” i meta należy sprawdzić osobno.

Nie deklarujemy produkcyjnego CMS, zdalnego logowania, uploadu plików ani automatycznego wdrożenia na hosting. Zrealizowano wariant publicznego JSON-a z walidowanym przepływem importu/eksportu i publikacji lokalnej.

## Przed wdrożeniem

Wykonaj na maszynie z dostępem do npm: `npm ci`, `npm test`, `npm run build`, `npm run test:dist`, instalację przeglądarki Playwright oraz `npm run test:visual` i `npm run test:admin`. Publikuj dopiero poprawnie utworzony `dist`, łącznie z `.htaccess`, zachowując własne sekrety SMTP. Szczegóły w README.md i DEPLOYMENT.md.

Dokumentacja referencyjna użyta do weryfikacji rozwiązań: Vite „Static Asset Handling” (vite.dev/guide/assets.html), Apache „mod_headers” (httpd.apache.org/docs/2.4/mod/mod_headers.html), MDN „Cache-Control” (developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control). Wyniki liczbowe w tym raporcie pochodzą z badanej paczki i załączonych testów, nie z tych źródeł.
