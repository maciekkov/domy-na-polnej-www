# Poprawki — banner cookie + flash bez stylów

Wprowadzone zmiany:

1. **Naprawa stylów bannera cookie**
   - przeniesiono komplet stylów publicznego bannera cookie do `src/styles/sections/consent.css`,
   - banner ma poprawny layout desktop/mobile,
   - przyciski, ikona, zamknięcie i opis są już renderowane spójnie.

2. **Ograniczenie efektu FOUC / "czarny tekst na białym tle" przy starcie**
   - dodano **critical CSS** bezpośrednio do `index.html`,
   - strona od pierwszego paintu ma właściwe tło, kolor tekstu i styl fallbacku,
   - styl podstawowy obejmuje też banner cookie jeszcze zanim doładują się pełne style aplikacji.

3. **Lepszy fallback strony głównej**
   - SEO fallback (`offer-shell`) ma teraz wygląd zgodny z estetyką serwisu,
   - pierwszy widok po wejściu nie wygląda już jak surowy HTML.
