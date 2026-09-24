# Domy na Polnej — audyt sześciu warstw i wykonane poprawki

**Wydanie:** 5.2.0-rc.1 · **Data:** 23.09.2026 · **Tryb:** przed sprzedażą (`prelaunch`).

## Werdykt i zakres odpowiedzialności

Powstała lokalna, zbudowana i przetestowana wersja kandydująca do wdrożenia. Usuwa konkretne problemy ostatniej wersji kodu, zamiast jedynie dokładać ozdobniki. **Jest poprawą względem zbadanego snapshotu 27fcf7f w opisanych i przetestowanych obszarach. Nie jest jeszcze zatwierdzoną podmianą działającej produkcji.**

Nie wykonano push do GitHuba ani zmiany domeny. Prace są w lokalnej gałęzi `audit/six-layers-2026-09-23`. Dostarczony patch służy do zastosowania zmian w prawdziwym repozytorium po sprawdzeniu bazowego SHA i hashy plików. Pełny pakiet pozwala obejrzeć gotowy build lokalnie.

### Co jest źródłem porównania, a co nim nie jest

Zdalny `main` odczytany przez GitHub wskazywał `27fcf7f9bb0456cfabb9da6b9a651ab020e97457`. Lokalną bazę zrekonstruowano z kompletnego archiwum v5.1 i 14 plików ostatniej poprawki; każdy z tych 14 plików ma identyczny Git blob SHA-1 jak odczytany commit. Pozostałe pliki pochodzą z dostarczonego kompletnego archiwum, nie z pełnego klonu Git. Na zdalnym repo mogą dodatkowo istnieć nieużywane pozostałości wcześniejszych importów. Installer patcha sprawdza zmieniane pliki i zatrzymuje się przy różnicy.

Dla produkcyjnej `https://domynapolnej.pl/` narzędzie web zwróciło tytuł, bez odczytanej treści. Chromium zwrócił `ERR_BLOCKED_BY_ADMINISTRATOR`; zewnętrzne połączenia kontenera nie rozwiązywały DNS. To ograniczenia środowiska, **nie dowód usterki domeny**. Nie przeprowadzono pełnego audytu jej wyglądu, formularza, SEO ani zasobów. Stary raport v4 nie został podstawiony w miejsce produkcji. Wcześniejsza ogólna ocena przewagi nad live nie wystarcza do decyzji wdrożeniowej.

Poniższe obrazy „przed/po” pokazują odtworzony main i lokalnego kandydata w tych samych viewportach. **Żaden z nich nie jest przedstawiany jako aktualny screenshot produkcji.**

## Metoda

Najpierw zapisano ustalenia i plan w `01-AUDYT-PRZED.md`. Następnie wykonano ograniczone do stwierdzonych problemów zmiany, build i testy regresji. Każde ustalenie ma identyfikator, priorytet, miejsce w kodzie, rezultat i granicę weryfikacji. MUST oznacza ryzyko dla publikacji, bezpieczeństwa lub podstawowej obsługi; SHOULD — istotną korektę jakości; DO NOT CHANGE — element celowo zachowany.

Przeglądarkowe pomiary wykonano na rzeczywistym bundlu, ale przez jawny lokalny harness Playwright: zasoby pochodzą z serwera podglądu, HTML jest osadzany w przeglądarce, a location/history są adaptowane. Nie jest to normalna nawigacja produkcyjnego originu. Nie ukrywamy tego ograniczenia w liczbach testów.

## 01. UI / projekt wizualny

### Wizualna korekta zamiast kolejnego redesignu

Najważniejszy błąd powstał wskutek ostatniej, uzasadnionej prośby o jaśniejsze zdjęcie: zdjęto ciemną maskę, ale białe menu i telefon pozostały na jasnym niebie. Naprawa nie polegała na ponownym zasłonięciu osiedla. Ciemniejsze tło obejmuje teraz sam nagłówek. Dolny tekst ma swoją osłonę, a prawa część kadru zachowuje jasność. Wróciła etykieta „Wizualizacja”, która opisuje materiał, a nie udaje fotografii gotowej inwestycji.

Nie zmieniałem przyjętego kierunku premium, rytmu całej strony ani fotografii. Pełen redesign w tej iteracji zwiększałby ryzyko regresji bez wykazanego problemu do rozwiązania. Podniosłem czytelność komunikatów o przygotowywanym cenniku i sprawdziłem rzeczywiste rendery lokalnego bundla. Ocenę „czytelniej” opieram na porównaniu tych samych viewportów; nie przedstawiam tego jako kompletnego certyfikatu kontrastu WCAG.

**UI-01 · MUST · Zrobione — Kontrast menu nad jasnym HERO.** Nagłówek otrzymał ograniczoną do jego wysokości ciemną podkładkę. Nie przyciemniono ponownie prawej części kadru. Dowód / kod: `src/styles/sections/navigation.css; figures/hero-*-desktop.jpg`. Ograniczenie / ryzyko: Sprawdzić odcień i czytelność na realnym telefonie; nie deklarujemy pełnego pomiaru kontrastu wszystkich kombinacji.

**UI-02 · SHOULD · Zrobione — Oznaczenie wizualizacji.** Wrócił mały podpis „Wizualizacja”, bez 01/04, strzałek i dodatkowych zdjęć. Dowód / kod: `src/sections/Hero/Hero.tsx; browser-results.json`. Ograniczenie / ryzyko: Podpis jest informacyjny, nie nowa kontrolka.

**UI-03 · SHOULD · Zrobione — Czytelność cennika w przygotowaniu.** Dyskretny komunikat w tabeli ma ciemniejszy kolor i większy tekst. Nie zmieniono szerokości ani geometrii działek. Dowód / kod: `src/styles/sections/homes.css`. Ograniczenie / ryzyko: Brak kompletnego audytu WCAG kolorów wszystkich stanów.

**UI-04 · DO NOT CHANGE · Zachowano — Zaakceptowana identyfikacja i produkt.** Jeden kadr osiedla, logo, paleta, układ sekcji, oryginalne fotografie i rzuty pozostają. Dowód / kod: `preservation-and-size.json`. Ograniczenie / ryzyko: Nie projektowano nowej architektury ani ilustracji.

## 02. UX / droga do kontaktu

### Przed sprzedażą oznacza przed sprzedażą — w całej aplikacji

W bazie brak cen był tylko decyzją renderowania: nazwa menu mówiła o cenach, status był „Dostępny”, FAQ obiecywało rozbicie kwot w PDF-ie, a dane wciąż zawierały wszystkie wartości. To nie był jeden spójny stan produktu. Wprowadziłem jawne `salesStage`, współdzielone przez prezentację, publiczny eksport, SEO, no-JS i adapter raportowania.

W aktualnym kandydacie działa `prelaunch`: menu „Domy i działki”, status „Przed sprzedażą”, ceny „Już wkrótce” / „W przygotowaniu”. Nie zastąpiłem kwot zerami. Model posiada późniejszy tryb `selling`, lecz nie uruchomiłem go. W tym trybie wracają prawdziwe ceny, wartości za m², historia i świadczenia. Dzięki temu start sprzedaży nie wymaga ręcznego odkręcania wielu komponentów.

Zachowana została istotna ścieżka klienta: wybieram działkę, porównuję dom, pytam o ten sam dom. Testy obejmują A–E, odznaczenie wyboru, fokus formularza i wersję mobilną. Nie dodałem dodatkowych obowiązkowych pól, pop-upów ani sztucznych liczników dostępności. Bez JavaScript klient może sprawdzić parametry, pytania i dokumenty oraz zadzwonić; interaktywne spacery nadal wymagają JavaScript.

**UX-01 · MUST · Zrobione — Jeden etap sprzedaży w całej witrynie.** Jawny prelaunch/selling zastępuje rozproszone stałe teksty. Menu, statusy, karta, tabela, HERO i SEO wynikają z tego samego etapu. Dowód / kod: `src/lib/sales.mjs; src/data/runtime/siteSchema.mjs`. Ograniczenie / ryzyko: Etap nie jest decyzją prawną ani automatycznym rozpoczęciem sprzedaży.

**UX-02 · MUST · Zrobione — FAQ zgodne z rzeczywistymi kartami PDF.** Karty A–E obejrzano: są informacyjne, bez widocznych kwot. Usunięto nieprawdziwe zapewnienie o istniejącym rozbiciu ceny w kartach. Dowód / kod: `src/data/faq-content.json; src/lib/sales.mjs; figures/pdf-cards-review.jpg`. Ograniczenie / ryzyko: Funkcja pokoju 7 nadal wymaga zatwierdzenia: PDF „Garderoba”, serwis „Gabinet”.

**UX-03 · SHOULD · Zrobione z rozróżnieniem — Pierwsza klatka i wersja bez JavaScript.** Spójne stan sprzedaży, zdjęcie, parametry i style HERO. Bez JS dostępne są domy, dokumenty, telefon i 17 FAQ. Dowód / kod: `scripts/generate-seo.mjs; browser-results.json`. Ograniczenie / ryzyko: Drugie CTA bez JS celowo prowadzi do telefonu; interaktywny spacer potrzebuje JavaScript.

**UX-04 · SHOULD · Zrobione — Synchronizacja historii URL.** Dodano reakcję na popstate oraz bezpieczne pomijanie wadliwego kodowania fragmentu adresu. Dowód / kod: `src/app/App.tsx; audit-launch.test.mjs`. Ograniczenie / ryzyko: Normalna historia przeglądarki wymaga końcowego E2E poza adaptowanym originem.

**UX-05 · DO NOT CHANGE · Zachowano i przetestowano — Wybór domu bez utraty kontekstu.** A–E, plan, tabela, karta, URL i formularz działają razem. Cofnięcie wyboru nie przypisuje fikcyjnego domu A. Dowód / kod: `browser-results.json`. Ograniczenie / ryzyko: Bez nowego formularza rezerwacji i bez dodatkowych kroków sprzedażowych.

## 03. Mobile / dostępność

### Nie tylko mniejszy desktop

Menu mobilne miało Escape, ale klawiatura mogła przejść do strony pod menu. Teraz menu ma kontrolę cyklu Tab, tło jest wyłączane przez `inert`, a zamknięcie przywraca fokus. Karta wybranego domu nadal otwiera się jako osobny mobilny panel, a jej CTA przenosi użytkownika do właściwego formularza.

Ujednoliciłem reguły wysokości HERO z critical CSS i zmniejszyłem ryzyko innego układu przed i po uruchomieniu aplikacji. Przy krótkim ekranie lub większym tekście priorytetem jest dostęp do treści, nie wymuszenie zamknięcia jej w jednym ekranie za wszelką cenę. Sprawdzono osiem kombinacji szerokości i wysokości, od 320 × 700 do 1920 × 1080, w tym 390 × 600. Test powiększył tekst HERO dwukrotnie bez ucięcia ani poziomej utraty treści.

To nie zastępuje testu rzeczywistego iPhone’a, Safari, TalkBack/VoiceOver, orientacji urządzenia ani pełnego zoomu przeglądarki. Wykonane testy są lokalnym badaniem zachowania Chromium z jawnie adaptowanym originem, a nie certyfikacją WCAG całego produktu.

**MOB-01 · MUST · Zrobione — Klawiatura w menu mobilnym.** Otwarte menu ogranicza Tab do swoich elementów, wyłącza tło przez inert i poprawnie oddaje fokus po zamknięciu. Dowód / kod: `src/components/navigation/Header.tsx; browser-results.json`. Ograniczenie / ryzyko: Testy Chromium; Safari, VoiceOver i TalkBack pozostają do odbioru.

**MOB-02 · SHOULD · Zrobione — HERO na krótkim ekranie i przy większym tekście.** Końcowe reguły HERO przeniesiono do jednej warstwy używanej też w critical CSS. Treść może zwiększyć wysokość sekcji zamiast się ucinać. Dowód / kod: `hero.css; 8 viewportów; test powiększenia tekstu HERO`. Ograniczenie / ryzyko: Test 200% dotyczy tekstu HERO, nie pełnego browser zoom ani wszystkich sekcji.

**MOB-03 · SHOULD · Zrobione — Odporność linków sekcji.** Nieprawidłowy escape w hash nie przerywa obsługi strony. Dowód / kod: `src/app/App.tsx`. Ograniczenie / ryzyko: Brak zmian istniejących identyfikatorów sekcji.

**MOB-04 · LIMIT · Otwarte — Pełna dostępność.** Nie wykonano certyfikacji WCAG, audytu screenreaderów ani badań z użytkownikami. Dowód / kod: `Sekcja granic raportu`. Ograniczenie / ryzyko: Sam zestaw ARIA i przejście testów nie uzasadniają deklaracji zgodności całej witryny.

## 04. SEO / AEO / treść

### Strona ma istnieć także przed wykonaniem JavaScript

Tytuł ponownie precyzuje rodzaj produktu i lokalizację. Obraz Open Graph pokazuje całe osiedle. Ceny nie pojawiają się w metadanych ani danych strukturalnych w trybie przed sprzedażą, natomiast mechanizm sprzedażowy jest gotowy do późniejszego poprawnego podawania rzeczywistych kwot.

Istotniejsza od samego title była poprawa generowania HTML. Strony polityk i 404 wcześniej startowały z pustym rootem oraz elementami odziedziczonymi po stronie głównej. Dziś mają własny statyczny tekst i metadane. Treści polityk porównano z bazą: nie zmieniono ich merytorycznie. Na stronie głównej bez JavaScript znajdują się też wszystkie 17 FAQ z jednego zbioru używanego przez React. Generator jest idempotentny — kolejne wykonanie nie dopisuje kolejnych pustych fragmentów.

AEO potraktowałem jako czytelny, jednoznaczny opis produktu i dostępne odpowiedzi, a nie osobny magiczny wynik punktowy. Nie ma danych pozwalających obiecać wzrost ruchu, cytowań przez AI lub pozycji Google. Bez pełnej listy adresów produkcji nie można też bezpiecznie rozstrzygnąć migracji URL. Dlatego nie dodałem zgadywanych przekierowań ani nowych podstron ofert, które wcześniej świadomie usunięto.

**SEO-01 · SHOULD · Zrobione — Precyzyjny tytuł.** Title zawiera produkt i lokalizację: domy parterowe w Grabiku koło Żar. Dowód / kod: `src/lib/offers.mjs`. Ograniczenie / ryzyko: To doprecyzowanie treści, nie gwarancja wzrostu pozycji.

**SEO-02 · MUST · Zrobione — Prawdziwe strony prawne i 404 przed JS.** Własny HTML i metadane, bez odziedziczonego schema strony głównej i niepotrzebnego preloadu HERO. Dowód / kod: `src/lib/legalContent.mjs; scripts/prepare-dist.mjs`. Ograniczenie / ryzyko: Tekst prawny zachowany, nie prawnie certyfikowany.

**SEO-03 · SHOULD · Zrobione — Powtarzalność generatora.** Powtórne uruchomienie nie dopisuje pustych wierszy i nie zmienia bez potrzeby wyniku. Dowód / kod: `scripts/generate-seo.mjs; testy Node`. Ograniczenie / ryzyko: Idempotencja sprawdzana automatycznie.

**SEO-04 · SHOULD · Zrobione — Spójny obraz OG.** Podgląd udostępnianej strony odpowiada kadrowi całego osiedla. Dowód / kod: `src/lib/offers.mjs`. Ograniczenie / ryzyko: Odświeżenie cache serwisów społecznościowych może wymagać ich ponownego pobrania strony.

**SEO-05 · MUST / MIGRACJA · Otwarte — Porównanie adresów produkcji.** Brak odczytanego pełnego DOM i listy istniejących adresów produkcyjnych; nie zgadujemy przekierowań. Dowód / kod: `logs/live-browser-error.txt`. Ograniczenie / ryzyko: Przed podmianą potrzebna mapa URL, kontrola 200/301/404 i Search Console.

**SEO-06 · SHOULD · Zrobione — FAQ dostępne dla klientów bez JS.** Te same 17 pytań pochodzi z jednego zbioru treści; no-JS i React używają wspólnej polityki etapu. Dowód / kod: `src/data/faq-content.json; scripts/generate-seo.mjs`. Ograniczenie / ryzyko: Nie tworzono sztucznego „AEO score” ani obietnic cytowania przez modele.

## 05. Wydajność / technika

### Zmierzony koszt zmian, bez fikcyjnego „100/100”

Jednoznaczne adresy preload/src/srcset ograniczają ryzyko rozjazdu cache. Ochrona rewizji odrzuca stary plik danych zamiast cofać aktualny stan. Zaktualizowano testy korzystające z dawnych kluczy analityki i usuniętych stron oraz brakującą komendę workflow. Nie dodano nowych zależności frontendowych.

Nie udaję, że aplikacja stała się automatycznie lżejsza. Lokalny app bundle po kompresji gzip urósł z 59,918 do 63,034 bajtów, czyli o 3,116 bajtów (około 3.04 KiB). To koszt jawnego modelu publikacji, wspólnych treści i zabezpieczeń. Runtime React pozostał taki sam. HTML wzrósł, ponieważ zawiera prawdziwe odpowiedzi FAQ i treść przed JS. Konkretne rozmiary są w pliku dowodowym; nie są pomiarem szybkości sieci ani Core Web Vitals.

Portable build wykonano. Pełna ścieżka `npm ci → tsc → Vite` nie została ukończona: środowisko nie ma dostępu do registry i kompletu cache. Nie uruchomiono Lighthouse ani audytu zależności. Te ograniczenia pozostają bramkami CI. Dotychczasowe raporty i obecność plików testowych nie są zamiennikiem aktualnego wykonania tych poleceń.

**PERF-01 · MUST · Kod poprawiony; CI otwarte — Aktualne testy i polecenia CI.** Zaktualizowano klucze analityki, testy etapu i ścieżki ofert; dodano brakujący skrypt test:offers. Dowód / kod: `package.json; .github/workflows/check-app.yml`. Ograniczenie / ryzyko: Workflow nie został uruchomiony w GitHub Actions w tej sesji.

**PERF-02 · SHOULD · Zrobione — Jednakowe adresy zdjęcia HERO.** Preload, src i srcset korzystają ze zgodnego wersjonowania. Dowód / kod: `Hero.tsx; generate-seo.mjs; assetUrl`. Ograniczenie / ryzyko: W pomiarze nie dowiedziono wcześniejszego podwójnego pobierania; nie wyliczamy fikcyjnej oszczędności.

**PERF-03 · SHOULD · Zrobione — Ochrona rewizji danych.** Starsza rewizja, niepoprawny JSON lub kwoty w prelaunch nie wypierają bezpiecznego snapshotu. Dowód / kod: `SiteDataProvider.tsx; edge-results.json`. Ograniczenie / ryzyko: Aktualizacja danych wymaga nowej rewizji i walidowanej publikacji.

**PERF-04 · MUST · Otwarte — Pełny toolchain i wydajność produkcji.** Portable build oraz kontrole lokalne wykonano; npm ci/tsc/Vite, npm audit i Lighthouse nie. Dowód / kod: `logs/npm-ci-offline.log; BUILD-VERIFIED.json`. Ograniczenie / ryzyko: Brak kompletu pakietów offline i dostępu do registry; nie oznaczamy tego jako PASS.

**PERF-05 · DO NOT CHANGE · Zachowano — Kontrolowane ładowanie ciężkich zasobów.** Nie dodano bibliotek frontendowych, nowych filmów ani ciężkich dekoracji. Grafy spacerów i panorama nie są sztucznie ładowane na start. Dowód / kod: `Kod i lokalne requesty`. Ograniczenie / ryzyko: Portable bundler nie daje podstaw do ogólnej obietnicy „szybciej od produkcji”.

## 06. Bezpieczeństwo / prywatność

### Największe poprawki są niewidoczne w projekcie graficznym

Zniknęły aktualne kwoty z dystrybuowanego JSON-a i fallbacku w JavaScript. Lokalny draft może utrzymywać dane robocze, ale przed publicznym eksportem są one usuwane i następnie walidowane. Testy sprawdzają zarówno brak kwot w prelaunch, jak i poprawne późniejsze publikowanie wartości. Nie wymazano dawnych commitów, testowych fixture ani wcześniejszej publicznej publikacji — nie można obiecywać, że historyczne ceny stały się tajne.

W panelu kontroli usunięto budowanie odpowiedzi API przez `innerHTML`. Dane są renderowane jako tekst, także przy kontrolnym payloadzie zawierającym znacznik z obsługą zdarzenia. Klucz administratora nie jest zapisywany w sessionStorage; jawne czyszczenie usuwa credential i wyniki, unieważniając także spóźnione odpowiedzi. To ogranicza czas ekspozycji, lecz aktywny skrypt nadal musi dysponować kluczem podczas żądania.

Dodano odpowiednie reguły nagłówków i ochronę przypadkowo wgranych źródeł. Szersza CSP dla skryptów witryny jest celowo Report-Only do prób na stagingu. Testy DOM w adaptowanym originie nie dowodzą działania tych nagłówków na Apache. Gov Sync nie publikuje danych przed sprzedażą, sprawdza warunki transportu i dane ofert; oficjalna transmisja nadal nie jest skonfigurowana ani potwierdzona.

Pomiar czasu sekcji został naprawiony tak, aby po powrocie do karty wznawiał aktywny czas, nie doliczał okresu w tle i respektował wycofanie zgody. 52 testy API obejmują rzeczywisty lokalny PHP/HTTP, walidację, błędy, ograniczenia żądań i mock SMTP. Nie wysłano kontrolnego maila na prawdziwą skrzynkę i nie przeprowadzono testu penetracyjnego produkcji.

**SEC-01 · MUST · Zrobione w nowym dist — Niepublikowane kwoty faktycznie nie trafiają do klienta.** Publiczny snapshot ma price:null. Walidacja odrzuca mieszankę prelaunch i kwot; eksport usuwa kwoty robocze. Dowód / kod: `distribution-check.json; sales.mjs; siteSchema.mjs`. Ograniczenie / ryzyko: Publiczna historia Git i wcześniejsze kopie nadal mogą zawierać dawne ceny.

**SEC-02 · MUST · Zrobione — Panel kontroli nie interpretuje odpowiedzi jako HTML.** Zamiast innerHTML stosuje DOM/textContent. Klucz jest tylko w pamięci bieżącej strony; czyszczenie unieważnia również spóźnione odpowiedzi. Dowód / kod: `public/administrator-control/control.js; edge-results.json`. Ograniczenie / ryzyko: Klucz pozostaje dostępny dla skryptu podczas aktywnej sesji; to redukcja ekspozycji, nie gwarancja odporności na każdy XSS.

**SEC-03 · SHOULD · Konfiguracja gotowa; hosting otwarty — Nagłówki CSP i osadzanie.** Ochrona frame-ancestors przeniesiona do nagłówka HTTP. Panel ma odrębną CSP; szersza polityka skryptów witryny jest Report-Only. Dowód / kod: `public/.htaccess; administrator-control/.htaccess`. Ograniczenie / ryzyko: Skuteczność zależy od serwera; test DOM z set_content nie weryfikuje egzekwowania CSP.

**SEC-04 · SHOULD · Konfiguracja gotowa; hosting otwarty — Ochrona przed przypadkowym wysłaniem źródeł.** Dodano blokady źródeł, testów, vendor i backupów oraz kontrolę sekretów w dist. Dowód / kod: `public/.htaccess; distribution-check.json`. Ograniczenie / ryzyko: Podstawą pozostaje publikacja wyłącznie dist i dane prywatne poza webrootem.

**SEC-05 · SHOULD · Zrobione — Rzetelniejszy pomiar zaangażowania.** Pomiar wznawia się po powrocie karty, nie nalicza czasu w tle i respektuje odmowę/cofnięcie zgody. Dowód / kod: `src/lib/analytics.ts; analytics-runtime.test.mjs`. Ograniczenie / ryzyko: Nie przeprowadzono analizy konwersji na ruchu ani pełnego testu wszystkich przypadków bfcache.

**SEC-06 · MUST · Zrobione; integracja zewnętrzna otwarta — Bezpieczniejsza bramka Gov Sync.** Brak wysyłki przed sprzedażą, poprawne URL ofert, kontrola pięciu unikalnych domów/cen, transport HTTPS i zabezpieczenia nagłówków. Dowód / kod: `api/lib/gov-sync.php; api/gov-sync.php`. Ograniczenie / ryzyko: Nie skonfigurowano ani nie dowiedziono transmisji do oficjalnej usługi. Domyślnie wyłączona.

## Wyniki wykonanych kontroli

| Kontrola | Wynik | Co dokładnie potwierdza |
|---|---:|---|
| Build portable | PASS | Rzeczywisty nowy dist, bez pobierania zależności |
| Kontrola źródeł / zasobów | 147 warunków PASS | Odwołania, zakres public i podstawowe warunki strukturalne |
| Testy Node | 100 / 100 PASS | Logika, dane, sprzedaż i prelaunch, eksport, historia, rewizje, SEO, analityka |
| Grafy spacerów | 1154 kontroli PASS | 30 kadrów wnętrza i 14 zewnętrznych, osiągalność i kontrakt danych |
| Składnia | 57 TS/TSX + 17 JS/MJS PASS | Składnia / transpile; nie pełny typecheck |
| PHP/HTTP/mock SMTP | 52 kontrole PASS | Lokalny backend, limity, walidacja i transport testowy, bez rzeczywistej skrzynki |
| Lokalny Chromium — odbiór | 28 wpisów PASS | Interakcje i 8 viewportów; jeden wpis dokumentuje brak kontekstu WebGL |
| Lokalny Chromium — przypadki brzegowe | 5 / 5 PASS | Selling, starsza rewizja, wyciek kwot w prelaunch, błędny JSON, bezpieczny tekst panelu |
| Dodatkowe testy lokalne | 7 / 7 PASS | Polityki, 404, no-JS, oba samodzielne odtwarzacze i lokalne HTTP |
| Test dystrybucji | PASS | Brak modułów CRM/demo i konfiguracji prywatnej w dist |

Nie sumujemy tych liczb do fikcyjnego wyniku jakości. Zakresy częściowo się pokrywają. Brak kontekstu WebGL oznacza, że sprawdzono wariant awaryjny panoramy, a nie poprawność projekcji GPU. Należy ją odebrać na urządzeniu docelowym. Oba samodzielne odtwarzacze zostały sprawdzone osobno; to nie jest pełny certyfikat osadzenia iframe na docelowej domenie.

Test panelu z kontrolowanym payloadem badał bezpieczne renderowanie tekstu. Z powodu ograniczeń originu jego osadzony wariant nie egzekwował produkcyjnej CSP. To rozdzielone zakresy, nie dowód obejścia ani sprawności CSP na serwerze.

## Co zachowano

Porównano 145 istniejących publicznych obrazów, SVG i PDF: zero zmian zawartości. Plik masterplanu jest identyczny bajtowo. Grafy obu spacerów są identyczne po pominięciu technicznych parametrów wersjonowania URL. Zachowano wszystkie niecenowe dane inwestycji w JSON-ie oraz merytoryczny tekst polityki prywatności i cookies. Testy cen trybu sprzedaży nie zostały usunięte — wykorzystują osobny, jawnie testowy fixture.

Nie zmieniono powierzchni domu i działek, liczby pokoi, numerów działek, zdjęć, PnB/WZ ani harmonogramu według pamięci innych rozmów. Nie „naprawiano” dokumentacji sprzedażowej przez zgadywanie.

## Braki przed zgodą na produkcję

**A. Porównanie z live i migracja.** Obejrzeć działającą domenę i staging w normalnym Chrome/Safari/Firefox, porównać każdą sekcję, linki, formularz, zdjęcia i sceny. Ustalić wszystkie aktywne i indeksowane adresy, plan przekierowań, canonical, sitemap, robots oraz zachowanie 404. Nie zakładać, że stara produkcja to archiwalna v4.

**B. Czysty klon i pełne CI.** Zastosować patch tylko do zweryfikowanej bazy, wykonać npm ci, tsc/Vite, aktualne E2E, testy zależności oraz Lighthouse w powtarzalnych warunkach. Sprawdzić dodatkowe stare pliki zdalnego importu. Nie kopiować niezweryfikowanego starego dist obok nowego.

**C. Hosting i komunikacja.** Kopia serwisu, działająca konfiguracja SMTP, sekrety i dane poza webroot, PHP/Apache/HTTPS, cache i realne nagłówki. Wywołać kontrolny formularz ze stagingu i potwierdzić odbiór poczty. Kontrola i ewentualne egzekwowanie pełnej CSP dopiero po sprawdzeniu naruszeń w zwykłym originie.

**D. Dane i dokumenty właściciela.** Potwierdzić podmiot sprzedaży i administratora danych; treść nadal wskazuje źródłowy X-SMART DEVELOP. Potwierdzić PnB/WZ, faktyczne MRP/DFG, prospekt i standard. Uzgodnić pokój 7 „Garderoba” w PDF vs „Gabinet” w serwisie. Zweryfikować precyzję obietnicy końca lutego 2028 w FAQ wobec szerszego I kwartału 2028 w harmonogramie. To nie musi być sprzeczność, ale wymaga świadomej akceptacji terminu.

**E. Start sprzedaży.** Obecny kandydat jest prelaunch. Włączenie selling wymaga zatwierdzonych rzeczywistych cen, historii, świadczeń i dokumentów właściwych dla obowiązującego stanu prawnego. Ten audyt techniczny nie rozstrzyga daty formalnego rozpoczęcia sprzedaży ani prawnej kompletności prospektu. Gov Sync pozostaje wyłączony do zweryfikowanej konfiguracji i testu oficjalnej transmisji.

## Czego nie robić w tej iteracji

Nie przebudowywać masterplanu, nie zamieniać renderów, nie dodawać slidera HERO, nowych dekoracji i dodatkowych pytań do formularza. Nie stosować force-push, nie scalać automatycznie z main, nie traktować starych raportów QA jako nowych testów. Nie wgrywać całej paczki źródłowej na hosting. Nie deklarować „pełnej zgodności”, „braku podatności”, „100/100 Lighthouse” ani wzrostu konwersji bez odpowiedniego badania.

## Zalecana kolejność odbioru

Najpierw podgląd gotowego dist z kompletnej paczki. Następnie zastosowanie patcha w osobnej gałęzi prawdziwego repozytorium z kontrolą SHA, pełne CI i staging. Potem potwierdzenie danych i produkcyjnych warunków, porównanie domeny oraz rzeczywisty formularz. Dopiero po zamknięciu bramek świadome scalenie i podmiana z kopią oraz możliwością cofnięcia. Pakiet nie wykonuje push ani wdrożenia automatycznie.

## Odniesienia techniczne

Poniższe źródła uzasadniają kryteria, nie są dowodem wykonania testów naszej witryny:

- Google Search Central — JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- W3C — Understanding WCAG 2.2, Contrast (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- OWASP — HTML5 Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
- OWASP — HTTP Headers Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- Chrome Developers — Lighthouse overview: https://developer.chrome.com/docs/lighthouse/overview/

Fakty o implementacji wynikają z kodu kandydata, zweryfikowanej bazy i plików JSON/logów z tego katalogu. Historyczne raporty w innych katalogach zachowano jako historię, nie jako dowód aktualnego odbioru.
