# Domy na Polnej — audyt estetyczny WWW i pass „natural flow”

## Ocena stanu wyjściowego

Strona ma już solidny poziom: spójna paleta oliwka–kość słoniowa–grafit, poprawna hierarchia treści, dobre materiały wizualne, konsekwentne zaokrąglenia i poprawne przejście od produktu do lokalizacji, układu, standardu i kontaktu. Najmocniejsze są hero, sekcja wyboru domu, lokalizacja oraz ciemne sekcje galerii/bezpieczeństwa.

Największy problem estetyczny nie polega na braku kolejnych kart lub ozdobników, tylko na zbyt równym rytmie. Kilka jasnych sekcji po sobie ma podobną temperaturę tła, podobny sposób budowania nagłówka i podobne karty. Przez to po pierwszych ekranach strona traci trochę charakteru i zaczyna wyglądać bardziej jak bardzo dobrze uporządkowany produkt webowy niż jak strona konkretnej inwestycji położonej przy naturze.

## Co wymagało poprawy

1. **Za mało warstw atmosfery.** Tła jasnych sekcji są poprawne, ale zbyt płaskie. Brak subtelnych planów pierwszego i trzeciego: rozmytych liści, lekkiej mgły, krajobrazowego pasa lub zróżnicowanej tekstury.
2. **Rytm sekcji jest za regularny.** Hero i lokalizacja są fotograficzne, lecz pomiędzy nimi i po nich część jasnych sekcji ma niemal identyczny ciężar wizualny. Potrzebny jest kontrolowany „oddech” i przejście między warstwami informacji.
3. **Masterplan jest funkcjonalnie dobry, ale kompas wygląda jak element pomocniczy z prototypu.** To detal, który leży na jednym z najważniejszych elementów sprzedażowych strony, więc powinien być wykonany jak część identyfikacji, a nie jak techniczna ikonka.
4. **Glow działek można uspokoić.** Sam pomysł jest trafny, lecz lepiej wygląda miękka obwódka + subtelne drugie halo niż jeden mocny neon.
5. **Brakuje jednego editorialnego akcentu.** Broszury mają charakter dzięki bardzo małym detalom — krótkiej frazie, cienkiej linii, liściom poza kadrem. W WWW warto zastosować to wybiórczo, nie na każdym ekranie.
6. **Mobile nie powinien kopiować dekoracji desktopowych.** Przy 390 px priorytetem jest czytelność; ozdobniki powinny znikać lub być mocno redukowane.

## Wdrożony kierunek

- dodano rozmytą, transparentną warstwę liści jako własny SVG; używana tylko w wybranych jasnych sekcjach,
- dodano subtelny panoramiczny pas krajobrazu na wejściu w ciemną galerię — bez dokładania nowej sekcji i bez wydłużania strony,
- dodano jeden editorialny podpis „Własny ogród. Blisko natury.” w nagłówku wyboru domu na szerokich ekranach,
- zmieniono pełne, płaskie tła jasnych sekcji na bardzo delikatne warstwowe gradienty,
- przebudowano kompas masterplanu na dedykowaną różę wiatrów w palecie DNP; północ pozostaje skierowana na ok. 4:30,
- zmiękczono glow dostępnej działki: jaśniejszy obrys + podwójne, mniej agresywne halo,
- dekoracje są `pointer-events: none`, nie wchodzą w interakcję i są wyłączane na mobile,
- nie zmieniono logiki wyboru domu, cen, formularzy, spacerów, tabel, danych ani struktury sprzedażowej.

## Zasada dalszych zmian

Nie dodawać rozmytych liści do każdej sekcji. Maksymalnie 3–4 użycia na całej stronie desktop. Krajobrazowe pasy maksymalnie 1–2. Inaczej efekt bardzo szybko przechodzi z „premium / natura” w gotowy motyw szablonowy. Najlepiej traktować te elementy jak warstwę fotograficzną w magazynie architektonicznym: widoczną peryferyjnie, nigdy konkurującą z domem, ceną, CTA ani planem.
