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
