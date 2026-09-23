# Wydanie po poprawkach 1–12

Aktualny zakres i wyniki: `AUDYT_POPRAWEK_7-12.md`. Paczka zawiera źródła, nie potwierdzony `dist` — w środowisku przygotowania npm nie było dostępne. Do budowania służy `BUDUJ-WDROZENIE.cmd` lub standardowe polecenia npm. Wszystkie ceny, terminy i 44 kadry spacerów zachowano.

Aktualna wersja: oferta A–E jest obsługiwana bez osobnych podstron — wybór odbywa się przez masterplan, tabelę i kartę domu, z możliwością pobrania PDF. Formularz kontaktowy ma kompaktowy układ desktopowy przy zachowaniu czytelności i 16 px w polach. Cena wejściowa jest liczona tylko z dostępnych domów, a zmiany danych publikuj przez `content:publish`, aby odświeżyć **JSON i statyczne SEO**, nie przez samotne ręczne podmienianie JSON-a.

Oprócz `npm test` przygotowano `npm run test:offers` dla gotowego builda oraz `python3 tests/api-security-qa.py` (PHP wymagane). Uruchomienie CI/E2E po instalacji zależności jest wymaganym krokiem przed publikacją. SMTP uzupełnia się wyłącznie na hostingu.

---

# Domy na Polnej — poprawki audytu 1–6

Aktualizacja źródeł na podstawie `domy-na-polnej-www-INSTALL-spacer360-UX-refactor.zip`.
Zakres: wybór domu, dane produkcyjne / panel demo, nieużywane zasoby, testy, masterplan i cache.
Zachowane: wygląd publicznej strony, ceny, terminy, rzut 2D, galerie i konfiguracja obu spacerów (30 + 14 kadrów).

**To paczka źródłowa. Nie zawiera gotowego `dist` ani `node_modules`.** W środowisku przygotowania paczki rejestr npm był niedostępny (DNS `EAI_AGAIN`), dlatego pełny build React/Vite i jego E2E nie są oznaczone jako zaliczone. Wyniki rzeczywiście wykonanych kontroli są w `docs/cleanup-six/` i `AUDYT_POPRAWEK_1-6.md`.

## Uruchomienie i testy

Wymagany Node.js 22.12 lub nowszy z linii 22 oraz npm. Nie zmieniono wersji zależności; `package-lock.json` jest dołączony.

```bash
npm ci
npm test
npm run build
npm run test:dist
npm run preview
```

Podgląd produkcyjny działa na `http://127.0.0.1:4173`. Serwer podglądu nie wysyła e-maili; formularz jawnie informuje o testowym przyjęciu. Na serwerze produkcyjnym e-maile obsługuje istniejące API PHP z własną konfiguracją SMTP.

Do pracy z kodem: `npm run dev`.
Do testów całego interfejsu po buildzie:

```bash
npx playwright install chromium
npm run test:visual
npm run test:admin
```

`npm run test:all` wykonuje kontrolę źródeł, logiki, danych spacerów, builda oraz E2E. Nie oznaczaj wersji jako sprawdzonej produkcyjnie, dopóki cały proces nie zakończy się poprawnie. Dołączony workflow GitHub Actions wykonuje ten zestaw w środowisku z dostępem do npm.

## Panel demo / edycja oferty

Demo jest wyłączone domyślnie. Włącz je świadomie:

```bash
npm run dev:admin
```

Alternatywnie Windows: `EDYTUJ-DANE-DEMO.cmd`. Lokalny panel otwiera `/administrator`; login i hasło demonstracyjne to `admin`. Te dane nie są uwierzytelnieniem produkcyjnym. Panel wymaga równocześnie trybu DEV, jawnej flagi oraz adresu loopback. Kompilacja produkcyjna nie powinna zawierać modułów CRM/admina; kontroluje to `test:dist`.

„Zapisz podgląd demo” zmienia tylko dane tej przeglądarki. Produkcyjna strona ignoruje lokalny stan demo, także pod localhost. „Eksport danych produkcyjnych” eksportuje wyłącznie publiczny kontrakt `SiteData`, bez leadów, prywatnych notatek i historii demo. „Kopia demo” pozostaje inną, prywatną operacją — nie publikuj takiej kopii.

## Dane produkcyjne bez ponownego builda

Jednym źródłem danych jest `public/data/site-data.json`. Po buildzie odpowiada mu `dist/data/site-data.json`, dostępny pod `/data/site-data.json`. Strona pobiera i waliduje ten plik przy otwarciu oraz ponownie po powrocie do karty, nie częściej niż raz na minutę. Przy błędzie zachowuje ostatni działający snapshot i wyświetla ostrzeżenie o konieczności potwierdzenia oferty.

Obsługiwane dane: pięć domów A–E (ceny, statusy, parametry i zdjęcia), kontakt, pięć etapów harmonogramu, dziennik budowy oraz aktywne dokumenty. Aktywną kartę PDF ustawia się w Dokumentach — nie w dwóch sprzecznych miejscach.

Przepływ aktualizacji:

1. Wczytaj aktualny `site-data.json` do panelu demo, zmień dane i wyeksportuj publiczny JSON.
2. Dodaj nowe pliki zdjęć/PDF do właściwego katalogu publicznego, jeżeli JSON do nich odsyła. Sam JSON nie przesyła plików.
3. Zweryfikuj, a następnie zapisz nowy JSON poleceniem poniżej. Publikator kontroluje kontrakt, rewizję i istnienie zasobów, dodaje wersje URL, robi kopię poza katalogiem publicznym oraz atomowo zastępuje plik.

Dla istniejącego, zbudowanego `dist` — bez ponownego builda:

```bash
npm run content:publish -- "/sciezka/do/site-data.json" --target dist --check
npm run content:publish -- "/sciezka/do/site-data.json" --target dist
```

Na Windows podaj lokalną ścieżkę w cudzysłowie. Po powodzeniu prześlij `dist/data/site-data.json` i ewentualne nowe zasoby na własny serwer. **Polecenie nie łączy się z hostingiem i niczego samo nie publikuje w internecie.** Nie kopiuj na hosting katalogu `backups`.

Aktualizacja źródeł przed przyszłym buildem:

```bash
npm run content:publish -- "/sciezka/do/site-data.json" --target public --check
npm run content:publish -- "/sciezka/do/site-data.json" --target public
```

Nowa rewizja musi być większa od bieżącej. Cofnięcie jest możliwe tylko świadomie z `--allow-rollback`. Przy zatwierdzonej zmianie danych biznesowych zaktualizuj również ich fixture regresyjne w testach — nie zmieniaj ich wyłącznie po to, aby ukryć nieoczekiwaną różnicę.

To nie jest zdalny CMS z logowaniem, bazą danych ani niezmiennym rejestrem historii cen. Nie dodano automatycznego przeliczania ceny „od …” w hero/SEO — należało to do punktu 9 audytu. Przy zmianie ceny wejściowej trzeba osobno skontrolować te teksty marketingowe.

## Spacer i edytor pinezek

`PODGLAD-SPACERU.cmd` / `npm run preview:tour` działają bez zależności npm poza Node.js. Edytor: `EDYTUJ-SPACER.cmd` lub istniejący parametr `?edit=1`. Został zachowany — ten zakres prac go nie usuwa.

Obie konfiguracje, kolejność, nazwy, cele, pozycje i kierunki pinezek pozostają niezmienione. Zmieniły się jedynie wersje URL zasobów (`?v=…`). Aktualizacja wersji zdjęcia w lokalnym szkicu nie nadpisuje ręcznie poprawionych pinezek.

## Cache i publikacja plików

`predev`, `predev:admin` i `prebuild` automatycznie wykonują `scripts/version-assets.mjs`. Skrypt deterministycznie aktualizuje `?v=hash_tresci` w URL zdjęć/PDF oraz wersję skryptów samodzielnego playera. Uruchomienie drugi raz bez zmian nie zmienia kodu. Skrypt obsługuje także ścieżki Windows.

Stałe nazwy plików mają obowiązek rewalidacji; HTML i JSON mają `no-store`. Długi `immutable` dotyczy wyłącznie katalogu `assets/build`, w którym Vite tworzy nazwy z hashem. Skopiuj ukryte pliki `.htaccess` wraz z zawartością `dist`. Ustawienia dotyczą Apache / kompatybilnego hostingu; na Nginx lub CDN trzeba zapewnić równoważne reguły po stronie serwera. Nie nadpisuj reguł własnego hostingu bez kopii.

Publikuj **zawartość `dist`**, nie cały katalog źródeł. Nie nadpisuj działającego `api/config.php` na hostingu; paczka go nie zawiera. Przy pierwszym wdrożeniu tej aktualizacji usuń cache CDN, jeżeli jest używany. Nowe wersje URL omijają stare obrazy zapisane w przeglądarce pod poprzednimi adresami.

Historyczne raporty z wcześniejszych iteracji w `docs/archive` i `docs/spacer-wnetrza` nie są wynikami testów tej wersji. Bieżącym raportem jest `AUDYT_POPRAWEK_1-6.md`.

---

# Aktualizacja: ceny/m², analityka powrotów i Gov Sync Ready

## Jawność cen

Publiczna oferta pokazuje dokładną powierzchnię użytkową, cenę brutto całego domu oraz cenę brutto za 1 m² powierzchni użytkowej. Każdy dom ma także publiczną historię ceny i listę obowiązkowych dodatkowych świadczeń (`priceHistory`, `mandatoryPayments`).

Historia jest utrzymywana przez `scripts/publish-site-data.mjs`: przy zmianie ceny publikator zachowuje poprzednią cenę wraz z okresem obowiązywania. Pole `publishedAt` może być w ISO albo w dotychczasowym formacie `DD.MM.YYYY, HH:mm`; publikator normalizuje datę do `YYYY-MM-DD`.

Nie zmieniaj ceny przez ręczne nadpisanie HTML. Publikuj dane przez `content:publish`, aby jednocześnie odświeżyć publiczny JSON, ofertę, SEO i historię ceny.

## Analityka first-party

Po świadomej zgodzie na analityczne pliki cookie serwis tworzy losowy pseudonimowy identyfikator przeglądarki ważny maksymalnie 180 dni oraz krótkotrwały identyfikator wizyty. Rejestrowane są m.in.:

- odsłony i wizyty,
- powroty tej samej przeglądarki,
- desktop / tablet / mobile,
- źródło i parametry kampanii,
- sekcje strony i czas ich oglądania,
- uruchomienie spaceru, konkretne sceny i czas w scenach,
- wybór domu, pobranie PDF, rozpoczęcie i wysłanie formularza.

Do analityki nie trafiają imię, telefon, e-mail, wiadomość formularza, pełny User-Agent, ruch kursora, naciśnięcia klawiszy ani nagrania sesji. Opcja „Tylko niezbędne” wyłącza analitykę i usuwa identyfikatory analityczne.

Produkcja zapisuje zdarzenia w prywatnym katalogu serwera. `/api/analytics-summary.php` zwraca wyłącznie zagregowane/pseudonimowe podsumowanie i wymaga nagłówka `X-DNP-Admin-Key`.

## Produkcyjna kontrola serwera

Po wdrożeniu dostępne jest prywatne narzędzie:

`/administrator-control/`

Nie jest linkowane z publicznej strony i ma `noindex`. Nie zawiera żadnego sekretu. Do każdej operacji trzeba podać `admin.control_key` z `api/config.php`; klucz pozostaje wyłącznie w `sessionStorage` bieżącej karty.

Narzędzie umożliwia:

- odczyt analityki za 7/30/90/180 dni,
- podgląd payloadu Gov Sync,
- sprawdzenie transportu,
- włączenie/wyłączenie Gov Sync,
- ręczne „Publikuj teraz”.

## Gov Sync

Warstwa raportowania celowo rozdziela dane od transportu. Aplikacja ma stabilny znormalizowany payload i dzienny skrypt `api/gov-sync-cron.php`, ale **nie udaje działającego połączenia z serwisem państwowym bez oficjalnego endpointu, schematu i credentiali**.

Dopóki oficjalny transport nie jest skonfigurowany, w `api/config.php` pozostaw:

```php
'gov_sync' => [
  'mode' => 'disabled',
  'endpoint' => '',
  'bearer_token' => '',
  'official_schema_id' => '',
]
```

Po opublikowaniu oficjalnej specyfikacji należy przygotować mapper końcowego dokumentu, wpisać oficjalny endpoint/credentiale, przetestować wysyłkę w środowisku testowym i dopiero wtedy ustawić `mode => 'http'`. Panel serwerowy odmówi włączenia synchronizacji, jeśli transport nie jest poprawnie skonfigurowany.

Automatyczna wysyłka raz na dobę wymaga crona uruchamiającego PHP CLI, np. `api/gov-sync-cron.php`. Dokładne polecenie zależy od hostingu.
