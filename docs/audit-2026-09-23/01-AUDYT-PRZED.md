# Audyt przed zmianami — 23.09.2026

## Zakres i dowody
Baza zdalna: maciekkov/domy-na-polnej-www, main `27fcf7f9bb0456cfabb9da6b9a651ab020e97457` (odczyt GitHub API). Lokalnie: kompletna paczka v5.1 z Biblioteki, odtworzone 14 zmian ostatniego commita; zawartość tych plików sprawdzona algorytmem Git blob SHA-1. To odtworzony snapshot, nie pełny klon historii repozytorium. Import na main może zawierać dodatkowe nieużywane pliki wcześniejszych wersji.

Produkcja: `https://domynapolnej.pl/`. Narzędzie web zwróciło wyłącznie tytuł, bez treści. Nawigacja Chromium jest blokowana przez politykę środowiska; połączenia zewnętrzne kontenera nie rozwiązują DNS. Nie wykonano porównania renderów ani interakcji działającej produkcji. Wcześniejsze raporty v4/v5 nie są dowodem stanu produkcji. Nie wolno na tej podstawie wydać bezwarunkowej zgody na zastąpienie serwisu.

Wykonano lokalny portable build, 79 testów Node, kontrolę źródeł, 1154 kontrole 30+14 scen, test dist oraz przegląd działającego bundla w sześciu viewportach. Browser QA korzysta z jawnie zaadaptowanego lokalnego originu i zasobów przez Playwright route; nie jest normalnym E2E hostingu. Nie uruchomiono pełnego tsc/Vite, Lighthouse, Safari, Firefox ani realnego SMTP. Testy sprzed tej daty nie są zaliczane jako bieżące.

## Ustalenia, priorytet, działanie

### 1. UI / visual design
- UI-01 / MUST: po rozjaśnieniu HERO białe menu/telefon na niebie tracą czytelność. Dowód: baseline/1440-hero.png i 390-hero.png. Działanie: ograniczona do nagłówka ciemna podkładka, bez ponownego przyciemniania całej wizualizacji. Ryzyko: zbyt ciężki header; kontrola porównawczych screenów.
- UI-02 / SHOULD: usunięcie przełączników usunęło też oznaczenie „Wizualizacja”. Dowód: Hero.tsx. Przywrócić mały podpis bez licznika, strzałek ani dodatkowych zdjęć.
- UI-03 / SHOULD: mały, słabo kontrastowy tekst „W przygotowaniu” w tabeli. Dowód: homes.css .pricing-pending i screenshot. Podnieść kontrast bez zmiany geometrii masterplanu.
- UI-04 / DO NOT CHANGE: zachować pojedynczy kadr osiedla, jasną prawą część, proporcje, logo, paletę, rzuty oraz fotografie. Nie dodawać nowych ozdobników ani sekcji dla samego efektu.

### 2. UX / conversion
- UX-01 / MUST: „Domy i ceny”, status „Dostępny” i „Już wkrótce” komunikują różne etapy sprzedaży. Brak jawnego trybu sprzedaży w kontrakcie. Wprowadzić wspólną politykę prelaunch/selling; status planu nie oznacza rezerwacji.
- UX-02 / MUST: FAQ twierdzi, że karty PDF zawierają rozbicie ceny domu i drogi. Oglądana karta A jest kartą informacyjną bez ceny. Skorygować komunikację do etapu przed sprzedażą; nie wymyślać kwot ani obietnic terminu.
- UX-03 / SHOULD: initial HTML i React mają różne drugie CTA, źródła informacji o cenie i style HERO. Zapewnić spójność stanu przed i po uruchomieniu JS; bez JS zapewnić kontakt i dokumenty.
- UX-04 / SHOULD: URL po wyborze domu jest zmieniany, ale popstate nie aktualizuje wyboru. Dodać bezpieczną synchronizację historii.
- UX-05 / DO NOT CHANGE: plan–tabela–karta–formularz działają lokalnie; modal mobilny Dom E ma czytelne dane i CTA. Zachować tę ścieżkę.

### 3. Mobile i dostępność
- MOB-01 / MUST: menu mobilne ma Escape, lecz nie ogranicza Tab do otwartego menu i nie wyłącza tła. Dowód: Header.tsx. Dodać obsługę fokusu, inert i poprawny powrót po zamknięciu.
- MOB-02 / SHOULD: reguły wysokości HERO są rozdzielone między hero.css i refinement.css; critical CSS nie zawiera końcowych reguł. Ujednolicić pierwszą klatkę i bundle, sprawdzić 320–1920 px i niski ekran.
- MOB-03 / SHOULD: wczytanie/zmiana URL z wadliwym fragmentem może rzucić URIError. Dowód: decodeURIComponent w App.tsx bez obsługi wyjątku. Dodać bezpieczne pominięcie.
- MOB-04 / LIMIT: brak pełnego audytu czytników ekranowych, WCAG i rzeczywistego iPhone. Same atrybuty ARIA nie są certyfikacją.

### 4. SEO / AEO
- SEO-01 / SHOULD: aktualny title pomija „domy parterowe”; rozwinąć opis zgodnie z produktem. Nie obiecywać pozycji ani wzrostu ruchu.
- SEO-02 / MUST: strony prawne i 404 mają pusty #root przed JS; przejmują niepasujące Schema/hero preload strony głównej. Dowód: prepare-dist.mjs. Wygenerować realny HTML i własne metadane, zachowując tekst polityk.
- SEO-03 / SHOULD: generator SEO dokłada puste wiersze przy każdym buildzie. Zapewnić idempotencję i test powtórnego uruchomienia.
- SEO-04 / SHOULD: metadane OG używają frontu domu zamiast aktualnego kadru osiedla. Ujednolicić obraz zapowiedzi.
- SEO-05 / LIMIT: nie znamy listy indeksowanych adresów, ruchu GSC ani przekierowań działającej produkcji. Mapa migracji URL i kontrola realnych HTTP 200/301/404 pozostają bramką wdrożenia.

### 5. Performance / technika
- PERF-01 / MUST: CI i część testów E2E odnoszą się do starych kluczy analityki i usuniętych osobnych podstron domów. Nie uznawać obecności testów za dowód ich wykonania. Dodać aktualne testy i jasne ścieżki standard/portable.
- PERF-02 / SHOULD: dynamiczny srcset HERO i wersjonowany preload mogą pobrać to samo zdjęcie pod różnymi URL. Ujednolicić dokładne adresy zasobów.
- PERF-03 / SHOULD: SiteDataProvider komentuje ochronę przed starszym snapshotem, ale nie sprawdza revision. Dodać blokadę regresji rewizji.
- PERF-04 / MUST: pełny npm ci/tsc/Vite i audyt zależności nieprzetestowane — offline cache niekompletny. Portable transpile sprawdza składnię, nie typy. To wymagana bramka CI, nie „PASS”.
- PERF-05 / DO NOT CHANGE: pozostawić lazy ładowanie galerii, pełnych grafów spacerów i panoramy; nie dodawać ciężkich bibliotek.

### 6. Security / privacy / spójność
- SEC-01 / MUST: wszystkie kwoty pozostają w public/data/site-data.json i module fallback w JS pomimo usunięcia ich z UI. Wprowadzić null przed sprzedażą, walidację publikacji i test braku kwot w dystrybuowanych plikach. To nie usuwa wcześniejszej publikacji ani historii publicznego GitHuba.
- SEC-02 / MUST: klucz administratora przechowywany w sessionStorage; panel buduje fragmenty odpowiedzi API przez nieescapowane innerHTML. Dowód: public/administrator-control/index.html. Trzymać klucz tylko w pamięci bieżącej strony, bezpiecznie kodować dane, wynieść skrypt i zaostrzyć CSP panelu.
- SEC-03 / SHOULD: frame-ancestors w meta CSP nie działa jako ochrona osadzania. Dostarczyć odpowiednie nagłówki HTTP; kompatybilność Apache/PHP zweryfikować na docelowym hostingu.
- SEC-04 / SHOULD: dołożyć blokadę przypadkowo wgranych źródeł/testów/vendor/backupów. Publikować wyłącznie dist; zachować serwerowy config i dane prywatne poza webroot.
- SEC-05 / SHOULD: pomiar czasu sekcji kończy się po ukryciu karty i nie wznawia po powrocie. Naprawić cykl widoczności bez naliczania nieaktywnego czasu.
- SEC-06 / MUST: Gov Sync nie powinien wysyłać nieopublikowanych danych przed sprzedażą. Blokada etapu w adapterze, bez deklarowania działającego połączenia państwowego.

## Dane wymagające potwierdzenia właściciela
PnB/WZ, rzeczywisty MRP/DFG, podmiot sprzedaży i administrator danych, terminy realizacji, zakres standardu i funkcja pomieszczenia 7 (na karcie A „Garderoba”, w serwisie „Gabinet”). Nie zmieniamy tych faktów według pamięci lub na podstawie marketingowego domysłu. Dokumenty i formalny początek sprzedaży wymagają osobnego odbioru przed publikacją trybu selling.
