# Demo analityki użytkownika

W panelu `/administrator` → `Analityka` dodano demonstracyjną wizytę jednego pseudonimowego użytkownika.

## Symulacja

- visitorId: `visitor_demo_7f2c91a8`
- urządzenie: desktop / 1440+
- źródło: Google / organic
- zainteresowanie: Dom B
- łączny aktywny czas: 22 min 30 s
- spacer zewnętrzny: 3 min
- spacer wnętrza: 4 min
- 19 etapów wizyty
- pokazane są również powroty do wcześniejszych sekcji.

## Wykres

Oś Y zachowuje kolejność sekcji strony. Oba spacery są potraktowane jako podsekcje galerii.
Oś X pokazuje czas od wejścia na stronę.

- zielony pasek = czas w sekcji strony,
- złoty pasek = czas w spacerze,
- linia = przejście do kolejnej sekcji,
- przerywana linia = powrót w górę strony.

Po rozwinięciu `Pokaż przebieg krok po kroku` widoczna jest także lista wszystkich etapów z czasem i opisem aktywności.

Gdy lokalna analityka jest pusta, liczniki w panelu również korzystają z danych symulacyjnych, więc panel nie wygląda na pusty.

## Dostęp lokalny

W tej wersji `/administrator` jest dostępny na `localhost` również przy zwykłym:

```
npm run dev
```

Panel nadal nie trafia do produkcyjnego builda — jest ładowany tylko w trybie Vite DEV i tylko na adresach loopback (`localhost`, `127.0.0.1`).
