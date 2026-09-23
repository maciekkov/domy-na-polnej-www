# Domy na Polnej — analityka, jawność cen i Gov Sync Ready

Data: 18.09.2026

## Zakres

Aktualizacja rozwija wersję po audycie 1–12. Nie zmieniono cen nominalnych domów, statusów sprzedaży, harmonogramu inwestycji ani konfiguracji spacerów 360 (30 scen wnętrza + 14 scen zewnętrznych).

## 1. Cena brutto za m² i publiczna historia ceny

Publiczna lista domów pokazuje teraz:

- dokładną powierzchnię użytkową 110,82 m²,
- cenę całkowitą brutto,
- cenę brutto za 1 m² powierzchni użytkowej,
- publiczną historię wcześniejszych cen,
- obowiązkowe dodatkowe świadczenia pieniężne, jeżeli wystąpią.

Te same informacje są obecne na stronach `/dom-a/`–`/dom-e/`.

Aktualne wartości wynikające z danych aplikacji:

- Dom A — 779 000 zł / 110,82 m² = 7 029,42 zł/m²,
- Dom B — 789 000 zł / 110,82 m² = 7 119,65 zł/m²,
- Dom C — 799 000 zł / 110,82 m² = 7 209,89 zł/m²,
- Dom D — 809 000 zł / 110,82 m² = 7 300,13 zł/m²,
- Dom E — 819 000 zł / 110,82 m² = 7 390,36 zł/m².

Publikator danych automatycznie dopisuje poprzednią cenę do historii przy zmianie ceny. Obsługuje dotychczasowy format daty `DD.MM.YYYY, HH:mm` oraz ISO i zapisuje historię jako `YYYY-MM-DD`.

Podstawa przyjętego modelu: art. 19a ustawy deweloperskiej nakazuje podawanie ceny m² powierzchni użytkowej oraz ceny całej nieruchomości, z VAT, wraz z zachowaniem wcześniejszych informacji po zmianie ceny. Od 13.02.2026 r. art. 5a określa także cenę domu w umowie jako iloczyn powierzchni użytkowej i ceny za 1 m².

## 2. Analityka powrotów i zaangażowania

Po zgodzie na analityczne pliki cookie tworzony jest losowy first-party identyfikator przeglądarki z maksymalnym okresem 180 dni. System rejestruje:

- nowe i powracające przeglądarki,
- wizyty i sesje,
- desktop / tablet / mobile,
- stronę i sekcję,
- czas w sekcji,
- źródło wejścia i UTM,
- wybór domu i otwarcie karty,
- pobranie PDF,
- galerię,
- start i zaangażowanie w spacer,
- każdą scenę spaceru oraz czas w scenie,
- rozpoczęcie i skuteczne wysłanie formularza,
- kliknięcia telefonu, e-maila i trasy dojazdu.

Zdarzenia NIE zawierają imienia, telefonu, e-maila, treści formularza, pełnego User-Agent, klawiszy, ruchu kursora ani nagrań sesji.

Dane produkcyjne są agregowane po stronie serwera przez `/api/analytics-summary.php`. Endpoint wymaga prywatnego klucza administratora i zwraca m.in. użytkowników, wizyty, powroty, urządzenia, sekcje, spacery i pseudonimową listę ostatnich odwiedzających.

### Ważne: opcja „Tylko niezbędne”

Nie włączono śledzenia zachowania po wybraniu „Tylko niezbędne”. Analityczne identyfikatory są wtedy usuwane, a pomiar zostaje wyłączony. Jest to celowe: art. 399 Prawa komunikacji elektronicznej wymaga uprzedniej zgody na zapis/odczyt informacji w urządzeniu użytkownika, poza mechanizmami ściśle koniecznymi do transmisji lub usługi żądanej przez użytkownika. Wielomiesięczny identyfikator powrotów i pomiar zachowania nie został potraktowany jako mechanizm niezbędny.

Banner ma formę ustawień plików cookie: `Akceptuj wszystkie`, `Tylko niezbędne`, `Ustawienia`.

## 3. Produkcyjna kontrola analityki

Dodano stronę `/administrator-control/`.

Nie jest linkowana publicznie, ma `noindex`, nie zawiera haseł ani sekretów. Każda operacja wymaga nagłówka `X-DNP-Admin-Key`; klucz użytkownik wpisuje ręcznie i jest przechowywany tylko w `sessionStorage` bieżącej karty.

Panel pokazuje analitykę za 7/30/90/180 dni i kontroluje Gov Sync.

## 4. Gov Sync Ready

Dodano:

- `api/lib/gov-sync.php` — generator znormalizowanego payloadu,
- `api/gov-sync.php` — status, preview, enable, disable, publish,
- `api/gov-sync-cron.php` — tryb CLI do automatycznej wysyłki raz dziennie,
- prywatny stan synchronizacji poza publicznym katalogiem,
- kontrolę autoryzacji przez `admin.control_key`,
- zabezpieczenie przed fikcyjnym sukcesem wysyłki.

Payload obejmuje minimalny zestaw danych oferty, które aplikacja już posiada: identyfikator domu, działkę, status, powierzchnię użytkową, działkę, cenę brutto, wyliczoną cenę brutto/m², obowiązkowe świadczenia, historię ceny i URL publicznej oferty oraz dane dewelopera/inwestycji.

### Stan oficjalnej integracji na 18.09.2026

Art. 19b nakazuje przekazywanie danych z art. 19a raz na dobę ministrowi właściwemu do spraw informatyzacji. Jednocześnie w RCL upoważnienie z art. 19b ust. 2a do wydania rozporządzenia określającego strukturę danych nadal ma status `Otwarte - niezaległe`, z terminem 11.11.2026.

Z tego powodu aplikacja NIE zawiera zmyślonego endpointu ani zmyślonego schematu. `Gov Sync` pozostaje `disabled`, dopóki w `api/config.php` nie zostaną wpisane oficjalne:

- endpoint,
- sposób uwierzytelnienia,
- identyfikator/wersja schematu,
- ewentualne dodatkowe nagłówki.

Przycisk `Włącz publikację` odmawia włączenia, jeśli transport nie jest skonfigurowany. Po oficjalnej publikacji specyfikacji należy jedynie dopisać końcowy mapper/transport według tej specyfikacji i przetestować połączenie. Nie wolno uznać obecnego adaptera za faktyczne połączenie z państwowym systemem przed udostępnieniem oficjalnego interfejsu.

## 5. Zabezpieczenia API

- prywatny klucz admina min. 24 znaki,
- stałoczasowe porównanie klucza,
- rate-limit kontaktu i analityki,
- blokada prywatnych plików,
- ograniczenie rozmiaru payloadu,
- retencja logów analitycznych do 200 dni,
- brak PII w pliku analityki,
- testy równoległego limitera,
- Gov Sync działa tylko po HTTPS i dla jawnie skonfigurowanego transportu.

## 6. Weryfikacja wykonana

- `npm test`: PASS — 94 testy Node + 1152 sprawdzenia grafu spacerów,
- `npm run test:api`: PASS — 51 testów PHP/HTTP/SMTP/rate-limit,
- `npm run test:syntax`: PASS — 50 TS/TSX + 14 JS/MJS,
- `php -l`: PASS dla wszystkich plików PHP,
- `source-check`: PASS — 147 warunków; public ~26,10 MiB; brak brakujących i nieodwoływanych zasobów,
- bez zmian w 30 scenach wnętrza i 14 scenach zewnętrznych.

Dodatkowo poprawiono regresję publikatora historii cen: polska data `13.09.2026, 22:00` jest poprawnie normalizowana do `2026-09-13`.

## 7. Niepotwierdzony element

Pełny `npm ci` / `npm run build` nie został wykonany w tym środowisku — instalacja pakietów npm nie ukończyła się z powodu braku dostępu do rejestru. Składnia i testy niezależne od node_modules przeszły. Przed wdrożeniem uruchom lokalnie `BUDUJ-WDROZENIE.cmd` albo:

```bash
npm ci
npm test
npm run build
npm run test:dist
npm run preview
```

Dopiero po przejściu pełnego builda traktuj katalog `dist` jako gotowy do publikacji.

## Źródła prawne sprawdzone 18.09.2026

- Dz.U. 2026 poz. 880 — jednolity tekst ustawy deweloperskiej, art. 19a i 19b.
- Dz.U. 2026 poz. 27 — art. 5a dotyczący ceny jako iloczynu m² i ceny za m².
- Dz.U. 2024 poz. 1221 — Prawo komunikacji elektronicznej, art. 399.
- Publiczny Portal Informacji o Prawie RCL — upoważnienie art. 19b ust. 2a, status `Otwarte - niezaległe`, termin 11.11.2026.
