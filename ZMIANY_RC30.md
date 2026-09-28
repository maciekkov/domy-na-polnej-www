# RC30 — formularz kontaktowy

Zmiana dotyczy wyłącznie warstwy backendowej poczty i dokumentacji wdrożenia. Frontend, układ strony, Standard, tabela mobile, dane domów i assety pozostają bez zmian względem RC29 MOBILE TABLE FIX.

## Co zmieniono

- `api/contact.php` nie wymaga już skonfigurowanego Gmail SMTP.
- Domyślny transport: PHP `mail()` na serwerze hostingowym.
- Odbiorca: `mkdevelop2026@gmail.com`.
- Nadawca techniczny: `kontakt@domynapolnej.pl`.
- E-mail wpisany przez klienta jest ustawiany jako `Reply-To`.
- `api/presale.php` korzysta z tej samej warstwy wysyłki dla powiadomień o zapisie/rezygnacji.
- Dodano `api/lib/mailer.php`.
- `dnpConfig()` ma bezpieczne domyślne ustawienia poczty, więc brak sekretnego pliku SMTP nie blokuje formularza.
- Starszy prywatny `config.php` nadal może być zachowany; brak `smtp.password` nie blokuje transportu `php_mail`.
- SMTP pozostaje opcjonalny i jest używany tylko po jawnym ustawieniu transportu na `smtp` lub `auto`.

## Czego nie zmieniono

- UI formularza i jego walidacja po stronie React.
- Ograniczenia rate-limit, honeypot, kontrola origin i walidacja backendowa.
- Pozostałe sekcje strony.
