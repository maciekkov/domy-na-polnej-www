# Wdrożenie na hostingu PHP — Domy na Polnej

**Uwaga o Hostinger Horizons:** ten produkt (obecnie Hostinger AI Builder w trybie agentowym) nie zapewnia tradycyjnego dostępu do plików przez FTP/File Manager ani katalogu `public_html` do ręcznego uploadu. Tę paczkę należy wdrożyć na osobnej usłudze **Custom PHP/HTML / web hosting** z obsługą PHP. Hostinger wskazuje taki typ witryny jako sposób na własne pliki. Jeśli masz jedynie projekt Horizons, sam upload paczki do niego nie jest możliwy. Źródła: https://www.hostinger.com/support/hostinger-ai-builder-agentic-mode-technical-specifications/ oraz https://www.hostinger.com/support/hostinger-ai-builder-agentic-mode-manage-files-and-data/ .

## Budowanie

Wymagany Node.js 22.12 lub nowszy. Z katalogu źródeł uruchom:

```sh
npm ci
npm run build
```

Za każdym razem zwykłe `npm run build` przebuduje stronę i odświeży `hosting/public_html/`. `npm run build:hosting` robi dokładnie to samo (zgodność ze starszymi instrukcjami). `hosting/private/` zachowuje już utworzoną konfigurację, hasło i dane. Przy pierwszym uruchomieniu powstaje losowe hasło do analityki. **Nie udostępniaj innym całej paczki wdrożeniowej, bo zawiera hasło w części private.** Katalog `hosting/` jest ignorowany przez Git.

## Co i dokąd wgrać

Umieść **zawartość** `hosting/public_html/` w katalogu WWW domeny (`public_html` w typowej konfiguracji Hostinger). Umieść **zawartość** `hosting/private/` w katalogu `private/` na tym samym poziomie co `public_html/`:

```text
katalog-domeny/
├── public_html/             ← zawartość hosting/public_html/
│   ├── index.html
│   ├── .htaccess             ← wgraj także ukryte pliki
│   ├── api/
│   ├── assets/
│   └── ...
└── private/                 ← zawartość hosting/private/
    └── dnp/
        ├── config.php       ← prywatna konfiguracja PHP
        ├── DOSTEP-ANALITYKA.txt ← login i hasło (możesz bezpiecznie zatrzymać lokalnie)
        └── data/            ← zapisy analityki, formularzy i przedsprzedaży
```

Katalog `private` musi być poza katalogiem publicznym WWW. Układ sąsiednich katalogów jest istotny: PHP szuka `private/dnp/config.php` obok `public_html`. Jeśli panel hostingu narzuca inną strukturę, zamiast tego umieść własny `api/config.php` pod `public_html/api/` (reguła `.htaccess` blokuje jego odczyt HTTP), ustaw `security.storage_dir` na bezwzględną ścieżkę poza WWW i nie wgrywaj pliku dostępu. Wariant z osobnym `private/` jest zalecany.

Nie kopiuj do WWW kodu `src`, `node_modules`, dokumentacji ani całego archiwum. Przy kolejnej aktualizacji podmieniaj część `public_html`; w `private/dnp/` zachowaj `config.php` i `data/`. Jeśli przenosisz witrynę na inny serwer, zachowaj tę samą konfigurację i magazyn, inaczej utracisz historię oraz listę zapisów.

## Dostęp do analityki

### Panel administratora v5.1 Premium

Po wgraniu paczki otwórz `https://domynapolnej.pl/administrator/`. To pełny panel z paczki v5.1: Pulpit, Domy i ceny, Budowa, Dokumenty, Zapytania, Analityka i Ustawienia. Logujesz się aktualnym kontem `analityka` i hasłem z `hosting/private/dnp/DOSTEP-ANALITYKA.txt`. Formularz logowania działa klawiszem Enter i przyciskiem „Zaloguj się”. Sesja wygasa po 30 minutach bezczynności. Po zalogowaniu otwiera się Analityka z danymi serwera.

**Zakres panelu v5.1:** edycja, zapytania demonstracyjne, historia publikacji i zapis podglądu działają lokalnie w tej przeglądarce. Kliknięcie „Zapisz podgląd demo” nie publikuje zmian na stronie WWW. W zakładce **Analityka** po zalogowaniu są automatycznie pobierane rzeczywiste statystyki z `private/dnp/data/analytics/`. Wybór odwiedzającego pokazuje jego wizyty, godziny, powroty oraz oś czasu sekcji. Pozwala to odczytać kolejność przechodzenia po stronie, ale nie dokładną pozycję scrolla w pikselach. Gdy odczyt zawiedzie, panel wyświetli błąd zamiast danych demonstracyjnych. Usunięto przykładowe osoby (także z poprzednio zapisanego lokalnego stanu przeglądarki). Istniejące, rzeczywiste logi w `private/dnp/data/analytics/` pozostają nienaruszone. Pomiar obejmuje wyłącznie zdarzenia zebrane po zgodzie analitycznej; nie importuje wizyt z `_old_copy.zip`. Klucz serwera pozostaje w PHP i nie jest wysyłany do JavaScript. Aktualny panel serwera pod `/administrator-control/` pozostaje dostępny niezależnie.

Przy aktualizacji wgraj kompletne `hosting/public_html/administrator/` razem z podkatalogiem `assets/` i plikiem `.htaccess`. W `private/dnp/` zachowaj konfigurację i dane; wtedy hasło nie zmieni się po kolejnym buildzie. Nie publikuj pliku `DOSTEP-ANALITYKA.txt` ani `config.php` w WWW.

### Poprzedni panel kontroli serwera

Otwórz `https://domynapolnej.pl/administrator-control/` (lub analogiczny adres Twojej domeny). Login to **analityka**. Hasło odczytasz z wygenerowanego pliku `hosting/private/dnp/DOSTEP-ANALITYKA.txt` na swoim komputerze. Każdy pierwszy build generuje inne hasło; dlatego nie ma jednego stałego hasła w instrukcji. Wpisz dane i kliknij **Pobierz dane**. Hasło nie jest wysyłane do strony publicznej ani zapisywane w pamięci przeglądarki; trafia nagłówkiem żądania HTTPS do API. Po odświeżeniu wpisujesz je ponownie.

`admin/admin` to dane do **lokalnego podglądu deweloperskiego** uruchamianego w trybie developerskim. Nie są loginem do produkcyjnej analityki. Analityka zbiera zdarzenia dopiero po świadomej zgodzie na cookies analityczne. Brak danych przy nowym wdrożeniu albo przy odmowie zgody jest normalny. Dane zapisują się w `private/dnp/data/analytics/`; dane formularzy i przedsprzedaży są przechowywane oddzielnie w tym samym prywatnym magazynie. Skrypt PHP i reguły Apache muszą działać na docelowym serwerze.

## Konfiguracja poczty i kontrola działania

Odbiorca formularzy: `mkdevelop2026@gmail.com`. SMTP jest ustawione na `smtp.gmail.com:587` z STARTTLS. **W tej paczce nie ma hasła aplikacji i poczta nie będzie wysyłana bez Twojej konfiguracji.** Zaloguj się do konta Google tej skrzynki, włącz weryfikację dwuetapową i utwórz osobne hasło aplikacji. Wpisz je wyłącznie do prywatnego `private/dnp/config.php` w polu `smtp.password` (zamień `getenv('DNP_SMTP_APP_PASSWORD') ?: ''` na cytowaną wartość) albo ustaw zmienną środowiskową `DNP_SMTP_APP_PASSWORD` dostępną dla PHP. Nigdy nie wpisuj zwykłego hasła Gmail ani nie umieszczaj hasła aplikacji w `public_html/`, repozytorium lub publicznej paczce. Plik `hosting/private/dnp/config.php` zachowuje istniejącą konfigurację przy kolejnych buildach — lokalne ustawienie zmiennej środowiskowej nie przeniesie się samo na hosting. Źródło Google: https://support.google.com/mail/answer/185833 .

Po ustawieniu hasła wyślij testowy formularz kontaktowy na witrynie i sprawdź, czy Gmail otrzymał wiadomość. Jeżeli nie, sprawdź log PHP: `SMTP_NOT_CONFIGURED` wskazuje brak hasła, `SMTP_DELIVERY_ERROR` oznacza błąd połączenia albo uwierzytelnienia. Zapis na przedsprzedaż trafia najpierw do prywatnej listy; awaria powiadomienia pocztowego nie kasuje zapisu. Nie da się zweryfikować doręczenia do Gmaila bez poprawnego hasła na działającym serwerze. Konfiguracja `gov_sync.mode` pozostaje `disabled`. Nadaj PHP prawo zapisu do `private/dnp/data`, a plikowi konfiguracji możliwie wąski dostęp (np. 600 przy właściwym właścicielu procesu).

Po wgraniu otwórz stronę przez HTTPS, zaakceptuj analitykę w bannerze cookies, przejdź kilka sekcji, a następnie sprawdź dane w panelu. Wyślij testowe zapytanie kontaktowe i testowy zapis na przedsprzedaż, a potem zweryfikuj odbiór wiadomości i zapis w prywatnym katalogu. Brak PHP lub brak zapisu do `private` spowoduje, że formularze i analityka nie zadziałają. Lokalny podgląd symuluje zapis i nie zastępuje tego testu. Samo Hostinger Horizons nie jest zgodnym miejscem dla tej aplikacji PHP.

W razie aktualizacji domeny popraw `security.allowed_origins` w konfiguracji. Przekierowanie do HTTPS ustaw na hostingu. Nie publikuj wygenerowanego pliku dostępu, `config.php` ani zawartości `data/` w `public_html`.


## rc.8 — panel analityki
Przycisk Zaloguj i Enter pobierają dane po autoryzacji PHP. Gov Sync jest zablokowany w kodzie PHP i nie można go uruchomić z panelu ani crona. Dotychczasowe instrukcje włączania Gov Sync nie obowiązują w tej wersji.


## rc.9 — historia wizyt
Do szybkiej aktualizacji skopiuj z małej paczki zawartość `public_html/` do istniejącego `public_html/`, nie zastępuj `private/dnp/data`. Wymagane pliki: `administrator-control/index.html`, `control.css`, `control.js`, `demo-visit.json`, `api/analytics-summary.php`, `api/analytics-journey.php`. Panel po zalogowaniu wyświetla prawdziwe zdarzenia tylko tam, gdzie wcześniej udzielono zgody na analitykę; przycisk przykładowej wizyty w starszym panelu `/administrator-control/` otwiera osobną symulację i nie miesza jej z produkcją. Jeżeli na serwerze są już pliki `private/dnp/data/analytics/analytics-*.ndjson`, ich historia pojawi się automatycznie. Dane nie są migrowane ani usuwane przy aktualizacji.
