## 5.2.0-rc.16 · 24.09.2026

- Naprawiono otwieranie obu spacerów i panoramy w podglądzie HTTP: znaczniki historii nie wymagają `crypto.randomUUID()`.
- Dodano test odtwarzający brak tej funkcji w przeglądarce.

## 5.2.0-rc.15 · 24.09.2026

- Jeden okrągły pin w każdym kierunku spaceru wewnętrznego i zewnętrznego; po najechaniu podświetlenie i podpis.
- Zachowane przejścia między scenami, geometria znaczników oraz nazwy przycisków dla czytników ekranu.

## 5.2.0-rc.14 · 24.09.2026

- Ilustracje standardu powiększone o 20% (76 → 91 px); w widoku telefonu zachowane dwie ikony w rzędzie.

## 5.2.0-rc.13 · 24.09.2026

- Historia wizyty w panelu: ciągła linia na osi czasu i czytelne przejścia między sekcjami.
- Lokalny edytor oznaczony zgodnie z faktycznym zapisem; usunięto etykietę DEMO z panelu głównego.
- Uzupełniono politykę prywatności i cookies zgodnie z formularzami oraz pierwszostronną analityką.
- Dokumenty PDF w zwartej formie poziomej na desktopie; standard z dostarczonymi ilustracjami instalacji i elementów domu.

## 5.2.0-rc.12 — 2026-09-24

- Panel `/administrator/`: czytelna hierarchia analityki, nazwy sekcji, czas oglądania i widok odwiedzających z powrotami.
- Historia wybranego odwiedzającego pokazuje jego wizyty i oś czasu (godzina poziomo, sekcja pionowo) z pomiarem aktywnego czasu; poniżej dostępna chronologiczna lista zdarzeń. Pomiar nie zapisuje pozycji w pikselach.
- Usunięto przykładowych klientów i stare demonstracyjne wpisy z nowego stanu oraz z zapisanych w przeglądarce wcześniejszych kopii. Produkcyjnych logów serwera nie usuwano ani nie importowano.

## 5.2.0-rc.2 — 2026-09-23

Audyt premium, poprawa czytelności i ścieżki wyboru, responsywność, naprawa TS2322, kompresja, finalny build Vite. Pełne uzasadnienie i wyniki: docs/audit-premium/AUDYT.md. Fakty i PDF-y bez zmian. Bez publikacji na hostingu.

# CHANGELOG — v5.2.0-rc.1 / 23.09.2026

Baza: odtworzony snapshot main `27fcf7f`; lokalna gałąź `audit/six-layers-2026-09-23`. Status: brak push i brak publikacji produkcyjnej.

- Wspólna polityka prelaunch/selling, brak kwot w bieżącym publicznym JSON-ie i bundlu; walidacja eksportu, ochrony rewizji i historii cen.
- Spójne komunikaty w HERO, na planie, w tabeli, mobilnej karcie, FAQ, SEO i wersji bez JavaScript.
- Czytelny nagłówek nad jasnym HERO, mały podpis „Wizualizacja”, brak slidera, ujednolicone critical CSS i adresy zdjęcia.
- Menu mobilne z ograniczeniem fokusu i wyłączeniem tła; odporna synchronizacja URL oraz obsługa błędnego fragmentu.
- Lepszy title/OG; 17 pytań FAQ, polityki i 404 w realnym HTML przed JS; idempotentny generator.
- Panel kontroli: bez innerHTML z danych API, klucz wyłącznie w pamięci, jawne czyszczenie, zewnętrzny skrypt i polityka CSP panelu.
- Nagłówki i ochrona przed omyłkową publikacją źródeł; blokada Gov Sync przed sprzedażą i walidacja transportu.
- Poprawiony pomiar aktywnego czasu sekcji po powrocie do karty i przy zmianie domu.
- Aktualne testy cen, rewizji, eksportu, DOM, API i instrukcje CI; zachowane testy trybu sprzedaży.
- Bez zmian geometrii masterplanu, 145 obrazów/SVG/PDF oraz grafów 30 + 14 scen (po pominięciu technicznych query wersji).

Wyniki i ograniczenia: `docs/audit-2026-09-23/02-AUDYT-PO-I-ODBIOR.md`. Nie deklarujemy wzrostu konwersji, wyniku Lighthouse, pełnego typechecka, wdrożonej oficjalnej integracji Gov Sync ani ukończonego porównania z działającą domeną.

---

# CHANGELOG — v5.1.0 Premium refinement / 21.09.2026

## Poprawki po wizualnym przeglądzie v5

- HERO skompresowany do pełnego viewportu; naprawiona warstwa obrazu i kontrolki mieszczą się także na 390×844 i 360×780.
- Masterplan: usunięty błąd `transform`, który po wyborze A–E kasował `translateX(-50%)` i przesuwał etykietę w prawo.
- Panel wybranego domu skrócony i zagęszczony; tabela pod mapą podchodzi bliżej, a typografia tabeli jest mocniejsza.
- Globalny rytm pionowy zmniejszony; mniej przypadkowego „powietrza” pomiędzy sekcjami.
- „Architektura codzienności”: obraz 16:10 oraz cztery autorskie, liniowe piktogramy architektoniczne.
- Galeria: nowy stabilny segmented control, bez uciętych zakładek; mniejsze karty Spacer 360 / Panorama.
- Dodane trzy lekkie, wektorowe akcenty botaniczne SVG używane oszczędnie po lewej/prawej stronie wybranych sekcji.
- Proces zakupu: autorskie piktogramy oraz subtelne łączniki-strzałki bez kwadratowych boxów.
- Harmonogram: stała siatka wierszy; wszystkie statusy mają tę samą wysokość i baseline.
- Dziennik budowy: całkowicie nowy stan startowy image-led, oparty na prawdziwym zdjęciu terenu, statusie i torze kolejnych aktualizacji.
- Mobile: ponowne strojenie HERO, galerii i masterplanu; brak poziomego overflow w testowanych szerokościach.

## QA

Szczegółowe pomiary i zrzuty: `docs/qa-v5.1/QA_REPORT.md`.

---

# CHANGELOG — v5.0.0 Premium / 21.09.2026

Baza: rzeczywiście dostarczone `domy-na-polnej-www-natural-flow-v4-final.zip`; nie wcześniejsza V6.1 ani stan repozytorium.

## Zmieniono

1. HERO: nowa hierarchia informacji, ręczny wybór czterech widoków, faktografia i czytelne CTA; oddzielny mobilny kadr oraz responsywne WebP. Zlikwidowano automatyczny slider.
2. Spójne tokeny kolorów, typografii i odstępów; spokojniejsza kompozycja, ograniczenie dekoracji, nowe jednolite ikony SVG produktu.
3. Masterplan: czytelne stany, klawiatura, synchronizacja plan–lista–karta–URL–formularz; mobilna karta domu otwierana nad całym viewportem.
4. Galerie i okna: portale do `body`, poprawiona pułapka fokusu, Escape, powrót do elementu otwierającego i blokada tła.
5. Formularz: prowadzenie do wybranego domu, lepsza prezentacja błędów oraz jawny komunikat symulacji w podglądzie.
6. Standard i prezentacja produktu: konkretne korzyści, czytelne wyłączenia, rozróżnienie PV Ready i paneli; dokumenty bez wymuszania kontaktu.
7. Baner zgód: naprawiony przypadek zablokowanych cookies/storage. Opcjonalna analityka pozostaje wyłączona przed zgodą.
8. Spacery: lekki indeks scen zamiast ładowania całych grafów na stronie głównej; zachowane 30 kadrów wnętrza i 14 kadrów zewnętrznych.
9. Panorama: lekki renderer WebGL, brak ciągłej animacji bez interakcji, bezpieczny komunikat i oryginalna fotografia przy braku WebGL.
10. SEO i pierwszy render: aktualne dane w HTML, działające ceny/PDF-y/kontakt bez JavaScript, spójne obrazki preload i widok React, legal pages i prawdziwe 404.
11. Źródła i waga: nieużywane zasoby zachowane poza publikacją, usunięte zbędne zależności frontendowe, gotowy deterministyczny build portable.
12. PDF-y B–E: poprawiono błędne „Dom A” w pierwszym zdaniu na właściwą literę. Oryginały zachowano w `reference-assets/public/pdf/`; reszty rysunków i danych nie zmieniano.
13. Dodano rzeczywiste wyniki QA, screenshoty, testy nowych scenariuszy, instrukcje uruchomienia i wdrożenia.

## Celowo zachowano

Wartości i statusy domów A–E, powierzchnie, działki, dane kontaktowe, harmonogram i rejestr dokumentów z v4. Zachowano geometrię planu, rzuty, zdjęcia/wizualizacje źródłowe, wszystkie sceny i połączenia spacerów, backend PHP oraz źródła narzędzi administracyjnych. Panel demo nie jest częścią publicznego bundla.

## Status

Build i opisane testy wykonano. Nie wykonano produkcyjnego wdrożenia, push do repozytorium, realnej wysyłki SMTP, pomiarów CWV na hostingu ani pełnego typechecka standardowego toolchainu. GPU panoramy nie było dostępne w środowisku QA — przetestowano wariant awaryjny.

## 5.2.0-rc.9 — historia wizyt
Produkcyjny panel: historia pojedynczych wizyt z istniejących logów, oś czasu sekcji/spacerów, źródła, urządzenia, zainteresowanie domami. Osobno oznaczona symulacja 19 etapów. Autoryzowany endpoint PHP z podpisanymi identyfikatorami odwiedzających; Gov Sync nadal zablokowany.
## 5.2.0-rc.10 — panel `/administrator/` z v5.1 Premium

- Dodano pełny panel demonstracyjny v5.1 w osobnym pakiecie JS/CSS, oddzielonym od publicznego kodu strony.
- Dostęp produkcyjny przez sesję PHP i hasło z bieżącej prywatnej konfiguracji; przycisk Zaloguj się i Enter. Zakładka Analityka odczytuje bieżące zbiorcze statystyki bez przekazywania klucza do przeglądarki.
- Wersja deweloperska `/administrator` nadal działa przez `npm run dev:admin`. Archiwum `_old_copy.zip` oraz jego dane nie są używane.
## 5.2.0-rc.11 — 2026-09-24

- Zakładka Analityka w panelu `/administrator/` pobiera automatycznie statystyki serwera i otwiera historię wizyt z czasu w sekcjach. W produkcji nie podstawia danych demo, gdy serwer zwróci błąd.
- Pasek panelu odróżnia rzeczywiste dane analityki od lokalnego edytora demo. Historii wizyt z `_old_copy.zip` nie przenoszono.
- SMTP Gmail pozostaje bez hasła, dopóki nie skonfigurujesz hasła aplikacji na serwerze. Formularz kontaktowy zgłasza niedostępność wysyłki; konfiguracja obsługuje `DNP_SMTP_APP_PASSWORD`. W archiwum nie ma hasła Gmail.
- Testy sesji PHP oraz historii odwiedzającego i pliki wdrożeniowe aktualizowane wspólnie.
