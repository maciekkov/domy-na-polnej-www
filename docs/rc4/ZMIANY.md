# Domy na Polnej 5.2.0-rc.4

Aktualizacja zaakceptowanego projektu rc.3 zgodnie z uwagami i dostarczonymi zrzutami.

## Zmiany

- Dziennik budowy: cztery karty zapowiedzi w poziomej karuzeli. Strzałki, przewijanie dotykowe i klawiatura; brak wymuszonej automatycznej animacji. Prawdziwe wpisy z public/data/site-data.json zastępują zapowiedzi i zachowują galerie zdjęć. Nie dodano fikcyjnych dat ani ukończonych prac.
- Instagram: wyróżniona sekcja pod dziennikiem, link z istniejących danych: https://www.instagram.com/domynapolnej/.
- Przedsprzedaż: osobny blok po dzienniku, formularz e-mail, niewstępnie zaznaczona zgoda, informacja o promocji przygotowywanej przed rozpoczęciem budowy. Nie podano kwoty rabatu ani niepotwierdzonego porównania z całym rynkiem. Bezpośredni dostęp także z sekcji domów, menu mobilnego i stopki.
- Backend zapisu: api/presale.php zapisuje e-mail, czas i treść zgody w prywatnym magazynie. Normalizacja adresów, brak duplikatów, blokady plików i atomowy zapis, limity prób, kontrola originu, honeypot, wypisanie bez ujawniania, czy adres był na liście. Po przełączeniu sprzedaży na selling nowe zapisy są blokowane, wypisanie nadal działa. Nie wdrożono automatycznego wysyłania kampanii.
- Dokumenty: dwie pozycje — przykładowa karta domu oraz nowy standard. Karty A–E pozostają przy odpowiednich domach: mimo wspólnego układu różnią się działką i identyfikacją, więc nie zastąpiono wszystkich kart kartą A.
- Nowy standard: stary plik public/documents/Domy_na_Polnej_Standard_Techniczny_1.0.pdf został nadpisany dostarczonym PDF-em. Ta sama nazwa i wersja 1.0 w witrynie, nowy hash cache i nowa okładka. PDF jest identyczny bajtowo z załącznikiem; wewnętrzne oznaczenia 4.2 i klikalny spis treści zachowane. Starego standardu nie ma w aktywnych źródłach ani dist.
- Standard: górna krawędź prawego bloku obrazów zrównana z wierszem ikon. Architektura: obraz ogrodu zrównany z początkiem akapitu „Strefa dzienna otwarta na ogród”. Wyrównanie strukturalne w CSS Grid, niezależne od długości nagłówka.
- Lokalizacja mobilna: opis, parametry dojazdu i osobny blok mapy z kadrem obejmującym Grabik oraz Żary. Koniec z rozciągniętym tłem za całym tekstem. Desktop pozostaje w dotychczasowym układzie.
- Kompas: oszczędny, okrągły SVG w kolorach witryny. Północ nadal 135° od góry ekranu, tj. godzina 4:30. Nie zmieniono orientacji działek.
- Tabela: stała kolumna „Cena brutto”, w prelaunch „W przygotowaniu”. Karty mobilne mają ten sam komunikat.
- Pasek kontaktowy na telefonie chowa się przy sekcji zapisu, aby nie zasłaniać formularza.

## Testy

- TypeScript i produkcyjny build Vite — zaliczone.
- 148 kontroli źródeł oraz kontrola dist — zaliczone.
- 100 testów logiki — zaliczone; test wymagający PHP wykonano przez PHP WASM CLI.
- 1154 kontrole danych spacerów — zaliczone.
- 11 kontroli zapisu, zgody, deduplikacji i usuwania — realny interpreter PHP 8.5 WASM, bez wysyłania poczty.
- 18 żądań do wykonywanego kodu endpointu — PHP 8.3 WASM. Rejestracja, błędne dane, brak zgody, origin, metoda, honeypot, wypisanie, etap selling i limit 429. To test interpretera z wejściem HTTP, nie test Apache na hostingu.
- Przeglądarka Chromium: 320, 390, 768, 1024, 1440, 1920 px; brak poziomego overflow i błędów aplikacji. Karuzela, zapisy, walidacja, 503 bez utraty e-maila, preview i wypisanie. Test rzeczywistego wpisu z galerią.
- Automatyczna kontrola axe: zero naruszeń w wybranych regułach WCAG A/AA na 390 i 1440 px. Nie jest to certyfikacja WCAG.
- Screenshoty i wyniki znajdują się w tym katalogu. Kontrole geometrii potwierdzają wyrównanie obrazów do wskazanych wierszy. Zrzuty sekcji mogą zawierać stały nagłówek/pasek na wysokości aktualnego viewportu.

Dostarczony PDF ma około 26 MB. Pobiera się dopiero po kliknięciu; nie jest częścią początkowego ładowania strony. Test budżetu rozdziela ten plik od zasobów strony, zachowując limit 32 MiB dla pozostałych materiałów.

## Dane i publikacja

Ceny, statusy, parametry, harmonogram, geometria działek i lista rzeczywistych wpisów pozostają bez zmian. Zaktualizowano rewizję danych oraz datę i rozmiar dokumentu standardu. Rewizja danych nie zmienia publicznej wersji dokumentu 1.0.

Nie wykonano publikacji ani push do zewnętrznego repozytorium. Paczka zawiera cały projekt oraz gotowy dist. Nadal potrzebne jest uruchomienie na hostingu PHP, sprawdzenie uprawnień prywatnego magazynu, HTTPS i test odbioru poczty kontaktowej. Zapisy przedsprzedaży nie wymagają SMTP, lecz kampania do zapisanych osób jest osobnym działaniem opisanym w PRZEDSPRZEDAZ.md.

Źródło pomocnicze przy informacji o zgodzie i wypisaniu: [UODO — zgoda i jej wycofanie](https://uodo.gov.pl/pl/701/4467).
