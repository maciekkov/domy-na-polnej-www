# Domy na Polnej — audyt i wdrożone poprawki

**Wydanie 5.2.0-rc.2 · 23 września 2026 · podstawa: dostarczona paczka 5.2.0-rc.1.**

## Ocena końcowa

Strona miała już wartościową identyfikację, dobre wizualizacje i rozbudowane narzędzia wyboru domu. Nie wymagała wymiany wszystkiego. Jej słabszą stroną była nierówna czytelność, nadmiar powtórzeń, pozostałości wielu iteracji CSS i niespójność komunikacji przed sprzedażą. Zmiany skupiają się na tych problemach.

Frontend po opisanej regresji nadaje się do odbioru wdrożeniowego. **Nie potwierdzam bezwarunkowej gotowości produkcji:** nie sprawdzono rzeczywistej poczty, konfiguracji docelowego serwera ani dokumentów potwierdzających stan formalny. Wydanie celowo pozostaje kandydatem rc.2. Nie wykonano publikacji ani push do repozytorium.

Audyt obejmuje projekt z ZIP-a. Próba odczytu https://domynapolnej.pl/ zwróciła tytuł bez treści pozwalającej porównać serwis. Nie przedstawiam lokalnych screenshotów jako dowodu wyglądu aktualnej domeny.

## Punkt odniesienia

Sprawdzono publiczną strukturę oferty i kontaktu dużych deweloperów:

- [Dom Development](https://www.domd.pl/pl-pl/warszawa/lista-inwestycji): wyszukiwarka i łatwy kontakt telefoniczny, krótki formularz oddzwonienia, rozdzielenie oferty i obsługi klienta.
- [ROBYG](https://robyg.pl/warszawa/wyszukiwarka): porównywanie lokali i przejście do zapytania o konkretny produkt.
- [Riverview / Vastint](https://riverview.pl/plan-osiedla/): plan inwestycji powiązany z listą mieszkań oraz wyraźna prezentacja architektury i miejsca.

To porównanie wzorców informacyjnych na podstawie dostępnych publicznych treści, nie ranking wizualny ani audyt całych konkurencyjnych serwisów. Dla pięciu domów nie ma uzasadnienia dla kopiowania rozbudowanych filtrów dużego dewelopera. Ważniejsze są prosty wybór działki, jasny zakres standardu, dokumenty i kontakt.

## Ścieżka użytkownika

Docelowa kolejność: rozpoznanie produktu i miejsca → wybór domu i działki → architektura i układ → lokalizacja → galeria i spacer → standard → dokumenty i zakup → harmonogram i dziennik → zespół → FAQ → kontakt. Użytkownik może skrócić tę drogę przez menu, przycisk wybranego domu lub mobilny pasek kontaktowy.

Główne CTA w hero brzmi „Wybierz swój dom”. Karta przenosi wybrany dom do formularza i kieruje fokus na imię. Nadal nie wybiera się automatycznie domu A. Wszystkie domy pozostają na jednej stronie, a parametr `?dom=` pozwala przekazać konkretny wybór. Nie przywrócono porzuconych osobnych stron ofert.

## Audyt sekcji i decyzje projektowe

| Obszar | Problem wersji wejściowej | Wdrożenie / zachowany element |
|---|---|---|
| Header | „Dom” nie wyjaśniał celu linku; brak szybkiego dostępu do dokumentów; aktywna sekcja mogła pozostawać nieaktualna przy długich blokach | „Układ domu”, odnośnik „Dokumenty”, poprawione śledzenie pozycji sekcji z jednym requestAnimationFrame |
| Hero | Komunikat „Już wkrótce” opisany jako cena dostępnego domu; przycisk nadmiernie długi | Poprawny opis etapu, krótsze CTA, mocniejszy kontrast tekstu; zachowana oryginalna architektura i oznaczenie wizualizacji |
| Domy i działki | Dziesięć powtórzeń „W przygotowaniu” w pustych kolumnach cen, zbędna legenda statusów sprzedaży | Jeden jasny komunikat etapu, tabela parametrów bez pustych kolumn w prelaunch; pełna tabela cenowa nadal działa w selling |
| Karta domu | Brak jawnego linku pozwalającego przekazać konkretny wybór | Link do domu z parametrem; większy tekst parametrów; zachowana karta PDF i bezpośrednie zapytanie |
| Architektura | Dobre korzyści, ale układ domu był oddzielony inną sekcją; zbędna dekoracja roślinna | Rzut bezpośrednio po opisie domu; zachowane cztery korzyści i fotografia ogrodu; usunięty ornament |
| Rzut | Teksty pomocnicze ok. 9,5 px i słaby kontrast; ramka nieznacznie zaburzała proporcje obrazu | Czytelniejsze opisy, większe przyciski, proporcje zawartości zgodne z plikiem 1195×896; nie zmieniono współrzędnych pomieszczeń |
| Lokalizacja | Dobry kontekst, ale drobne zastrzeżenie do czasów dojazdu | Czytelniejsza informacja o orientacyjnych czasach; zachowane czasy, mapa, współrzędne i link do trasy |
| Galeria / 360 | Rozbudowane instrukcje, techniczna rozdzielczość zdjęcia w komunikacji marketingowej; wspólny spacer podpisany wybranym domem | Krótszy opis, rzeczywiste otoczenie zamiast rozdzielczości, uczciwy podpis „przykładowy układ”; zachowane oba spacery i panorama |
| Standard | Nierówna skala tekstu i promienie narożników, dekoracje za treścią | Ujednolicona prezentacja, czytelniejsze akordeony i podpis; zachowane parametry, wyłączenia i dokument PDF |
| Bezpieczeństwo / dokumenty | Wartościowa sekcja, do której trudno szybko dotrzeć; ozdobne nakładki i małe opisy procesu | Dostęp z menu, czytelniejszy proces, mniej dekoracji; dokumenty nadal bez obowiązku wypełnienia formularza |
| Harmonogram | Stała wysokość opisu powodowała nakładanie tekstu na status; hasło „Pewny efekt” bez podstaw | Wiersze dopasowują się do treści; neutralne „Etapy realizacji. Planowane terminy”; zachowane daty i stany |
| Dziennik | Pusta sekcja udawała rozbudowany blok redakcyjny; trzy dodatkowe etapy i powtarzane obietnice | Jedno rzeczywiste zdjęcie i krótki stan przygotowania. Po dodaniu prawdziwych wpisów działa istniejący pełny dziennik |
| Zespół | Dobre, konkretne osoby i role | Zachowano fotografie, nazwiska, role i link do kontaktu; nie dopisano doświadczenia ani osiągnięć |
| FAQ | Małe teksty w wielu oddzielnych kartach | Spokojne listy z separatorami, większe pytania i odpowiedzi; zachowane 17 odpowiedzi i obsługa etapów sprzedaży |
| Kontakt | Zbyt techniczny opis synchronizacji; małe zgody; na wąskim ekranie pola obok siebie | Komunikat dla klienta, jedna kolumna na małym telefonie, pola co najmniej 16 px, większe zgody, zachowana walidacja i obsługa błędów |
| Stopka | Teksty 8–10 px, „Domy i ceny” mimo prelaunch, nieaktywny Facebook | Czytelna typografia, etykieta zależna od etapu, dokumenty i prawidłowy cel spaceru, usunięta niedziałająca ikona |
| Cookies | Istniejący czytelny wybór i brak analityki bez zgody | Zachowano model zgód, powiększono tekst; nie dodano zewnętrznych trackerów |

## Jeden język wizualny

Zachowano zieleń, ciepłe jasne tło, logo, systemowe kroje oraz oszczędny szeryfowy akcent w hero. Uporządkowano istniejący arkusz editorial zamiast dołączać kolejną globalną warstwę. Usunięto numerację „03/12” itp., która upodabniała stronę do prezentacji i utrudniała zmianę kolejności sekcji. Wycofane ornamenty przeniesiono do reference-assets, a nie pozostawiono w publicznym katalogu. Fotografie i wizualizacje nadal pełnią różne, jasno opisane funkcje.

## Kod, dane i bezpieczeństwo

- Wykonano pełną instalację zależności, typecheck i build Vite. Usunięto błąd TS2322 w AdminApp: wartość typu unknown była używana jako warunek renderowania ReactNode. Uproszczony builder wejściowej paczki tego nie weryfikował.
- Zachowano walidację publicznego JSON-a, odrzucanie starszych rewizji, stan awaryjny, rozdzielenie demo/produkcja, historię cen i ochronę przed publikacją kwot w prelaunch.
- Wszystkie biznesowe pola publicznych danych są identyczne po pominięciu tokenów wersji obrazów. Dokumenty PDF są identyczne bajtowo. Dowód: preservation.json.
- Nie zmieniono geometrii masterplanu ani ścieżek pomieszczeń. Poprawa proporcji kontenera rzutu obejmuje jednocześnie obraz i SVG.
- Przegląd backendu zachował istniejące: walidację pól, honeypot, limity prób, kontrolę originu/klucza, prywatny magazyn, blokowanie źródeł na hostingu. Nie zmieniano API PHP, konfiguracji SMTP ani zasad Gov Sync.
- Stare nieaktywne moduły osobnych ofert pozostają historycznym kodem poza aktywnym buildem; nie są traktowane jako działająca funkcja. Publiczne linki prowadzą do faktycznej strony i wyboru domu.
- Weryfikacja źródeł i dist nie wykazała brakujących zasobów, sekretów ani CRM demo w produkcyjnym pakiecie.
- To nie jest test penetracyjny. Nie wykonano ponownego uruchomienia backendu PHP: brak PHP CLI w środowisku. Nie oznaczono pełnego npm test jako zaliczonego.

## SEO / AEO

Zachowano tytuł, opis, canonical, Open Graph, sitemap, dane strukturalne bez fikcyjnych cen, 404 i statyczną treść dostępną bez JavaScript. Opis etapu w statycznym hero jest zgodny z React. FAQ pozostaje dostępne w HTML; nie dodano niepotwierdzonych odpowiedzi ani obietnic rozszerzonych wyników Google. Informacje o metrażu, działce, lokalizacji i standardzie są przedstawione bezpośrednio, w czytelnej strukturze nagłówków.

## Wydajność

Stwierdzono brak kompresji odpowiedzi tekstowych w konfiguracji wejściowej. Dodano gzip w podglądzie oraz mod_deflate w dostarczonej konfiguracji Apache. Hero mobilne zmniejszono z ok. 149 KiB do 102 KiB, bez zmiany kadru. Dla dwóch podglądów ogrodu zastosowano istniejące obrazy responsywne; pełne sceny pozostały w spacerach.

Wyniki Lighthouse zapisano osobno jako HTML i JSON. Pomiar lokalny obejmuje throttling urządzenia i sieci z profilu narzędzia, kompresję oraz zimny start. Nie jest pomiarem z realnego hostingu ani gwarancją Core Web Vitals. Ostatni pomiar: mobile 94/100 (LCP 2,9 s, CLS 0, TBT 20 ms); desktop 97/100 (LCP 1,2 s, CLS 0, TBT 0 ms). Dostępność, Best Practices i SEO: po 100/100 w obu profilach. W poprzednim przebiegu mobile osiągnął 96/100; niewielka zmienność laboratoryjna jest normalna. LCP mobilne wymaga dalszej obserwacji na hostingu — nie deklarujemy spełnienia progu 2,5 s. Wskazany przez narzędzie problem proporcji rzutu został poprawiony.

## Regresja i ponowny odbiór

- Pełny TypeScript + Vite: zaliczony.
- Kontrola źródeł: 147 warunków; kompletność dist: zaliczona.
- Logika danych, publikacji, walidacji i analityki: 82 testy zaliczone.
- Dodatkowe kontrole etapu sprzedaży, SEO i stron prawnych: 17 wybranych testów zaliczonych. Test wymagający PHP niewykonany.
- Graf spacerów i zasoby: 1154 sprawdzenia zaliczone; 30 scen wnętrza i 14 zewnętrznych.
- Istniejące testy visual i offers: zaliczone na rzeczywistym lokalnym HTTP, bez podstawiania aplikacji atrapą.
- Szerokości 320, 390, 768, 1024, 1440, 1920 px: brak poziomego przepełnienia, załadowane obrazy, prawidłowy wybór domu i formularz.
- Nowe testy obejmują brak wyboru początkowego, Dom C → formularz, fokus, błędne pola, kontrolowany błąd 503 bez utraty wpisanej treści, powodzenie jawnego preview, klawiaturę zakładek, zamykanie galerii i menu Escape.
- Axe WCAG A/AA dla desktop/mobile: brak wykrytych naruszeń po poprawkach. Nie jest to certyfikacja WCAG ani test z czytnikiem ekranu.
- Uruchomiono oba odtwarzacze, przyjęto komunikat wizualizacji, zamknięto iframe; panorama rzeczywiście renderowała WebGL w Chromium (programowy renderer).
- Obejrzano wyrenderowane sekcje desktop/mobile i poprawiono znalezione kontrasty, proporcje i nakładanie tekstów. Screenshoty: qa/.

## Warunki publikacji

Potrzebne są: test rzeczywistego odbioru maila, kontrola konfiguracji PHP/Apache/HTTPS na docelowym serwerze i potwierdzenie aktualności deklaracji formalnych. Paczka zachowuje marzec 2027 oraz I kwartał 2028, nie dane z innych rozmów. Prospekt jest nieaktywny, dziennik pusty, sprzedaż w przygotowaniu. Nie tworzono brakujących dokumentów ani fikcyjnych postępów prac.

Kolejne kroki opisuje BRAKI_I_WDROZENIE.md. Nie należy odczytywać dobrej oceny frontendu jako potwierdzenia rachunku powierniczego, skuteczności SMTP lub poprawności formalnej rozpoczęcia sprzedaży.
