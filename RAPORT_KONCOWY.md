# Domy na Polnej — audyt, redesign i implementacja v5

**Rezultat:** kompletne źródła oraz rzeczywiście zbudowany i przetestowany `dist/`. Nie wykonano publikacji na hostingu ani push do repozytorium. Dokładna baza to przesłany ZIP `natural-flow-v4-final`, identyfikowany SHA-256 w `VERSION.json`. Wcześniejsze oceny na podstawie pamięci innych rozmów nie są podstawą tego audytu.

## 1. Ocena wejściowej wersji

V4 miała wartościowy produkt: pięć domów na wspólnym planie, porównanie cen, rzuty, dokumenty, galerie, dwa spacery i kompletny proces kontaktu. Największym problemem nie był brak kolejnej sekcji. Były nim nakładające się warstwy stylistyczne, dekoracje konkurujące z ofertą, niespójna hierarchia oraz zbyt mało dopracowane przypadki interakcyjne.

Nie przyznawano ocen 8/10 ani nie deklarowano wzrostu konwersji. Bez porównawczego badania użytkowników i pomiaru ruchu byłyby to pozorne liczby. Audyt przełożono na zmiany kodu, sprawdzalne zachowania oraz jawne ograniczenia.

## 2. Problemy i wdrożone rozwiązania

| Priorytet | Problem | Co rzeczywiście zmieniono |
|---|---|---|
| Krytyczny dla działania | Odmowa cookies mogła rzucić wyjątek przy zablokowanym storage | Obsłużono błąd, a baner zamyka się także w takim środowisku; dodano regresję. |
| Krytyczny dla interakcji | Niepełna kontrola fokusu i tła w oknach | Wspólny mechanizm dialogu, portale do body, Escape, trap i powrót fokusu. Naprawiono również błąd restore w galerii. |
| Istotny | Wybór domu na telefonie wymagał wyraźniejszego rezultatu | Karta mobilna pokazuje wybrany dom, cenę, działkę i PDF; zapytanie przenosi tę samą pozycję do formularza. |
| Istotny | HERO sam zmieniał obrazy bez pełnej kontroli | Ręczne cztery widoki, poprawna semantyka przycisków, czytelna lokalizacja, produkt i oferta w pierwszym ekranie. |
| Istotny | Obrazy i dane niezwiązane z pierwszym ekranem obciążały start | Responsywne WebP i preload, pełne dane scen dopiero przy otwieraniu spaceru, lekka fotografia podglądowa panoramy. |
| Istotny | Wzornictwo i dekoracje nie tworzyły jednej hierarchii | Tokeny, spokojniejsza typografia, mniej ozdobników, jednolite SVG, większy udział faktycznych zdjęć i rzutów. |
| Istotny | Komunikacja standardu sugerowała zbyt szeroki zakres | Wyraźnie opisano standard deweloperski i wyłączenia; PV Ready nie udaje gotowej fotowoltaiki. |
| Istotny | Zaufanie zbyt łatwo sprowadzało się do deklaracji | Widoczny zestaw istniejących dokumentów, bez fikcyjnego prospektu i bez wymuszania kontaktu przed pobraniem. |
| Istotny | Kontynuacja kontaktu i walidacja miały dodatkowe tarcie | Spójny wybór domu, fokus w polu, konkretne błędy i jawny komunikat, że lokalny podgląd nie wysyła maila. |
| Istotny | Obrazy/okna wymagały lepszych podpisów i obsługi | Rozróżnienie wizualizacji, galeria klawiaturowa, czytelne zakładki i zamykanie. |
| Istotny | Pierwszy HTML i aplikacja wymagały spójności | Generowany pierwszy ekran oraz oferta bez JavaScript pochodzą z tych samych danych; podstrony prawne i 404 zachowano. |
| Kosmetyczny, lecz mylący | W kartach PDF B–E akapit zaczynał się od „Dom A” | Poprawiono wyłącznie literę domu. Układ, rysunki, numery działek i powierzchnie zachowano; oryginały są w archiwum. |
| Porządkowy | Stare grafiki i raporty utrudniały rozpoznanie aktualnej wersji | Nieużywane zasoby przeniesiono poza publikację, a raporty v4 do jawnie historycznego katalogu. |

Całą stronę sprawdzono, nie tylko HERO. Zmiany objęły plan, produkt, lokalizację, rzuty, galerię, standard, zakup i dokumenty, harmonogram, dziennik, zespół, FAQ, kontakt, strony prawne oraz błędy. Nie dodano fikcyjnych referencji ani nowych obietnic terminu realizacji.

## 3. Kierunek wizualny i ścieżka klienta

Przyjęto jeden kierunek: współczesna architektura i spokojny, konkretny produkt. Ciepłe jasne powierzchnie, leśna zieleń, oszczędna typografia i duże wizualizacje mają pracować razem. Akcenty roślinne pozostały dodatkiem, nie treścią każdej sekcji. Strona nadal przypomina ofertę domu, a nie demonstrację efektów studia animacji.

Pierwszy ekran mówi, gdzie i co jest sprzedawane. Następny etap pozwala wybrać dom i zobaczyć cenę, działkę i dokument. Sekcje produktu pokazują układ, architekturę i standard. Dopiero na tej podstawie użytkownik przechodzi do dokumentów, procesu i kontaktu. CTA mają określoną rolę; nie rozmnożono przycisków tylko po to, by było ich więcej.

Najważniejsze interakcje są bezpośrednie. Nie ma automatycznych liczników ani przejmowania scrolla. Każdy efekt ma wariant ograniczonego ruchu. Na telefonie wybór domu, menu, galerie i formularz potraktowano odrębnie od desktopu.

## 4. Co zachowano i dlaczego

Wszystkie główne pola `site-data.json` są semantycznie zgodne z v4; różnią się jedynie techniczne wersje URL assetów. Ceny to 779/789/799/809/819 tys. zł, działki 810/809/807/806/1006 m² i pięć statusów „Dostępny”. Nie podmieniono ich na dane zapamiętane z późniejszych rozmów.

Zachowano oryginalne ścieżki działek i geometrię interaktywnego SVG na obrazie masterplanu, 110,82 m², rzuty, wartościowe zdjęcia, standard PDF i 44 sceny spacerów. Nie generowano alternatywnej architektury. Zachowano harmonogram i pustą listę dziennika zamiast dopisywać fikcyjne postępy. Zachowano backend PHP i źródła panelu administracyjnego; dane demo nie wchodzą do publicznego bundla.

## 5. Wydajność, SEO i uruchamialność

Źródła zawierają aktualne formaty responsywnych grafik, kontrolę zasobów, cache busting, lekkie dane spacerów i podgląd panoramy bez ładowania pełnej tekstury na starcie. W publikowanej części nie ma fontów ani niepotrzebnych bibliotek ikon czy ciężkiego silnika 3D. Nieużywane materiały zachowano w archiwum, a nie usunięto bezpowrotnie.

Metadane, canonical, structured data i sitemap pozostają zsynchronizowane ze źródłową ofertą. W HTML bez JavaScript dostępne są ceny, PDF-y i kontakt. To nie jest obietnica określonej pozycji w Google.

Dołączono gotowy build i lokalny serwer. Rozpakowanie projektu oraz uruchomienie jednego pliku CMD lub `node preview-server.mjs` nie wymaga pobierania paczek. Ponowne zbudowanie umożliwia dostarczony portable builder. Wersja standardowego npm/Vite toolchainu pozostaje w repozytorium, ale jej pełnego typechecka i builda nie ukończono w tym środowisku z powodu niedostępnych zależności.

## 6. Wykonane QA

Przeszło 147 warunków źródeł, 79 testów logiki, 1154 asercje grafów 30+14 scen oraz 51 testów PHP/HTTP/mock SMTP i limitowania. Zbadano sześć szerokości od 320 do 1920 px bez wykrytego poziomego overflow, błędów JavaScript i brakujących zasobów. Przeszło 14 scenariuszy interakcji i 7 dodatkowych scenariuszy podstron, działania bez JavaScript, odtwarzaczy oraz HTTP. Wyniki i screenshoty znajdują się w `docs/qa/`; szczegółowe warunki w `docs/QA_V5.md`.

Te liczby nie są certyfikatem dostępności ani gwarancją zachowania na każdym urządzeniu. Przeglądarka testowa wymagała jawnej adaptacji origin/history w harnessie. WebGL nie było dostępne: wariant awaryjny panoramy jest sprawdzony, jej projekcja GPU wymaga testu na urządzeniu docelowym. Nie wykonano pomiarów CWV na produkcyjnym serwerze.

## 7. Co zależy od danych i środowiska właściciela

Przed publikacją pozostają realne sprawy serwerowe: konfiguracja SMTP i klucza administratora, potwierdzenie uprawnień i odbioru poczty, konfiguracja integracji zewnętrznych oraz końcowy test na domenie i urządzeniach. Prospekt nie był aktywnym dostarczonym dokumentem. Deklaracje dotyczące pozwoleń, MRP/DFG i terminów wymagają weryfikacji właściciela z aktualnymi dokumentami. Nie tworzyłem pozornych dowodów ich prawdziwości.

Pełny wykaz granic oraz konkretna instrukcja znajduje się w `BRAKI_I_WDROZENIE.md`. Finalna paczka jest kompletnym projektem i gotowym buildem do dalszego wdrożenia — nie zastępuje dokumentacji bankowej, potwierdzenia prawnego ani konfiguracji rzeczywistego hostingu.
