# Lista powiadomień o przedsprzedaży

Aktualne wdrożenie `npm run build:hosting` opisano w `WDROZENIE-HOSTING.md`. Plik konfiguracji leży w `hosting/private/dnp/config.php`, a dane w `hosting/private/dnp/data/` i na serwerze w analogicznym układzie obok `public_html/`.

## Co działa

Sekcja #przedsprzedaz wysyła adres i zgodę do api/presale.php. Serwer zapisuje je w katalogu presale/ wewnątrz prywatnego magazynu. Nie są zapisywane w publicznym JSON-ie, localStorage ani analityce. Rezygnacja usuwa rekord. Ponowny zapis tego samego adresu nie tworzy duplikatu. Jest to pojedynczy zapis zgody (single opt-in); nie wysyła e-maila potwierdzającego i nie oznacza adresu jako zweryfikowanego.

Lokalny preview jawnie symuluje wynik i nie zbiera listy. Prawdziwy zapis działa po wdrożeniu PHP i ustawieniu zapisywalnego prywatnego katalogu. Kampania informująca o starcie nie jest wysyłana automatycznie przy zmianie etapu sprzedaży.

## Wdrożenie

1. Wgraj wyłącznie dist/, zachowując istniejące api/config.php i prywatne dane.
2. W api/config.php ustaw security.storage_dir na zapisywalny katalog POZA publicznym katalogiem hostingu. Alternatywnie ustaw DNP_PRIVATE_DIR. Użyj tego samego magazynu dla kontaktu/analityki i zapisów.
3. Zachowaj ograniczenie do własnych originów w security.allowed_origins. Nie publikuj prywatnego magazynu; konfiguracja Apache blokuje też api/data i api/lib, ale na innym serwerze wymagane są odpowiednie reguły.
4. Zapisz kontrolny adres należący do Ciebie, potwierdź obecność rekordu, sprawdź ponowny zapis i wypisanie. Sam sukces w podglądzie nie potwierdza konfiguracji hostingu.

## Jak przygotować wysyłkę, gdy znasz datę i promocję

Narzędzie scripts/presale-list.php jest przeznaczone do uruchomienia na serwerze przez PHP CLI. Skrypt pozostaje poza katalogiem publicznym. Korzysta z ustawienia magazynu w api/config.php lub ze zmiennej DNP_PRIVATE_DIR.

```sh
DNP_PRIVATE_DIR=/sciezka/do/prywatnego/magazynu php scripts/presale-list.php export > zapisy-przedsprzedaz.csv
```

CSV zawiera e-mail, datę i wersję zgody oraz informację, że adres nie był potwierdzany przez e-mail. Importuj świeży eksport do swojego systemu mailingowego dopiero przed kampanią. W wiadomości umieść rzeczywiste warunki oferty i możliwość rezygnacji. Lista służy do zamówionej informacji o starcie i promocji, nie do innych kampanii.

Usunięcie adresu na prośbę klienta:

```sh
DNP_PRIVATE_DIR=/sciezka/do/prywatnego/magazynu php scripts/presale-list.php remove adres@example.pl
```

Każdy eksport jest kopią — wypisanie na stronie nie usuwa danych z już pobranego CSV ani z zewnętrznego systemu. Przed wysyłką aktualizuj odbiorców na podstawie bieżącej listy; respektuj wypisania w używanym systemie. Po zakończeniu jednorazowej kampanii usuń dane listy i jej eksporty zgodnie z opublikowaną informacją o prywatności. Nie umieszczaj CSV w repozytorium ani w publicznym katalogu hostingu.

## Treść zgody

Wersja presale-1.0 jest zapisywana przez serwer razem z treścią celu, czasem zapisu i źródłem. Zmiana celu przetwarzania wymaga dostosowania zgody i nie rozszerza automatycznie wcześniej udzielonych zgód. Informacje dla klienta znajdują się także w polityce prywatności strony.

## Powiadomienia dla biura (rc.6)
Po nowym zapisie lub skutecznym wypisaniu serwer próbuje wysłać powiadomienie na skonfigurowany adres odbiorcy (`mkdevelop2026@gmail.com`). Duplikat zapisu nie generuje kolejnego powiadomienia. Wymagana działająca konfiguracja SMTP. Awaria poczty nie cofa zapisu ani rezygnacji; jest odnotowana w logu PHP. Nie ma automatycznego ponawiania powiadomień. Autorytatywna lista pozostaje w prywatnym magazynie.
