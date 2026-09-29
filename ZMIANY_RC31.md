# RC31 — e-mail z formularza przedsprzedaży

Zmiana dotyczy wyłącznie backendu formularza „Daj znać, kiedy ruszy przedsprzedaż”. Wygląd strony nie został zmieniony.

## Co poprawiono

- każde prawidłowe kliknięcie „Powiadom mnie o przedsprzedaży” wysyła e-mail do skonfigurowanej skrzynki biura;
- dotyczy to także ponownego wpisania adresu, który już znajduje się na liście — lista nie tworzy duplikatu, ale e-mail do biura jest wysyłany;
- temat wiadomości rozróżnia `NOWY ZAPIS` oraz `PONOWNY ZAPIS`;
- adres osoby zapisującej się jest ustawiany jako `Reply-To`;
- gdy zapis do listy się uda, ale transport pocztowy zawiedzie, API nie udaje sukcesu: zwraca błąd 502 z `saved: true`, dzięki czemu można ponowić wysłanie bez utraty zapisu;
- faktyczna rezygnacja z listy również generuje powiadomienie do biura.

Odbiorca i transport są wspólne z formularzem kontaktowym (`api/lib/mailer.php`).
