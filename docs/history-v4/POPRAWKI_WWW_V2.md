# Domy na Polnej — poprawki WWW v2

Baza: `domy-na-polnej-www-aesthetic-flow-v1.zip` z tej rozmowy.
Zakres: korekta istniejącej strony React, przede wszystkim sekcji „Wybierz swój dom”. To nie jest projekt prospektu ani wygenerowana makieta strony.

## Uruchomienie

Rozpakuj ZIP do nowego folderu. Nie nakładaj go na stary `dist`.
W Windows uruchom `URUCHOM-PODGLAD-WWW.cmd`. Skrypt instaluje brakujące zależności przez `npm ci`, uruchamia Vite na porcie 5174 i otwiera przeglądarkę. Wymagany Node.js zgodny z `package.json`: co najmniej 22.12.0. Pierwsza instalacja wymaga dostępu do rejestru npm.

Ręcznie:

```sh
npm ci
npm run dev -- --port 5174 --open
```

Do wdrożenia użyj dotychczasowej procedury `npm run build`. W tej paczce nie ma gotowego katalogu `dist` ani `node_modules`.

## Co faktycznie zmieniono

### 1. Usunięto błędną dekorację

Usunięto `foliage-photo-blur.png`, `foliage-blur.svg` i ich użycia w czterech sekcjach. Cały plik `atmosphere.css` napisano ponownie, zamiast dokładać kolejne nadpisania do poprzedniego efektu. Nie ma obracanej prostokątnej nakładki, mlecznych plam ani rozmywania całego tła.

Nowy `foliage-corner-natural.webp` zawiera wyseparowane liście z narożnika przykładu dostarczonego przez użytkownika. Ma kanał alfa; około 80% jego powierzchni jest całkowicie przezroczyste. Nie zawiera podpisów ani fragmentu strony PDF. Dekoracja znajduje się tylko w prawym górnym narożniku sekcji wyboru domu, częściowo poza kadrem. Nie przechwytuje kliknięć. Przy szerokości do 700 px jest ukryta.

### 2. Uporządkowano nagłówek

„Własny ogród. Blisko natury.” nie jest już tekstem wygenerowanym przez pseudoelement i pozycjonowanym nad treścią. Jest zwykłym elementem w dwukolumnowym nagłówku, z cienką linią rozdzielającą i niewielkim podpisem „Przestrzeń dla Ciebie”. Na węższych ekranach znika. Zmniejszono pionowe odstępy i utrzymano istniejący krój pisma strony — bez przenoszenia typografii prospektu na całe WWW.

### 3. Poprawiono masterplan i kartę

Zachowano zdjęcie, proporcje obrazu, współrzędne wszystkich pięciu obrysów i położenie oznaczeń działek. Zmieniono obramowania, cienie i odstępy, aby mapa i karta domu były spójne. Aktywna działka ma lżejsze wypełnienie, wyraźny cienki obrys i mniejszą poświatę; dom pod kolorem pozostaje widoczny. Zachowano osobne kolory dostępności, rezerwacji i sprzedaży.

Pod mapą umieszczono krótką instrukcję wyboru i podpis kierunku północy. Poprawiono układ karty w stanie bez wybranego domu oraz układ na tabletach i telefonach.

### 4. Nowy kompas

`NorthIndicator.tsx` jest wektorowym komponentem SVG, a nie kolejną bitmapą. Jedyna litera „N” i wyróżniona igła znajdują się na dole po prawej. Czubek igły leży w punkcie (49,49), środek odniesienia w (31,31): to dokładnie 135° od góry ekranu, czyli godzina 4:30, zgodnie z kierunkiem przyjętym dla tego masterplanu. Nie zastosowano obrotu w CSS.

Rozmiary: 72 px na desktopie, 56 px na telefonach, 48 px na ekranach do 360 px. W ostatnim wariancie skorygowano kolizję z obszarem działki E. Kompas ma opis dla czytnika ekranu, jest nieinteraktywny i nie zasłania klikalnych parceli w sprawdzonych szerokościach. Z arkusza `homes.css` usunięto 15 nieużywanych reguł starego kompasu.

### 5. Pozostałe sekcje

Usunięto dodatkowy fotograficzny pas narzucony na górę galerii. Zrezygnowano z rozrzucania ozdobników po układzie domu, standardzie i FAQ. Pozostały spokojne jasne tła oraz dotychczasowe ciemne sekcje. Nie przebudowywano hero, galerii, spacerów ani formularza.

## Co pozostało bez zmian

Ceny, statusy, numery i powierzchnie działek, dane kontaktowe, dokumenty, współrzędne masterplanu oraz konfiguracje spacerów. Nie zmieniono zależności w `package.json` ani blokady wersji. Standardowy skrypt wersjonowania odświeżył część parametrów cache assetów; nie oznacza to zmian działania spaceru lub formularza.

## Podglądy i zakres kontroli

Pliki `qa-natural-flow-v2/po-1440.png`, `po-390.png` i `po-1865.png` pokazują render rzeczywistych zmienionych komponentów w Chromium. `przed-1440.png` pokazuje ten sam komponent z v1 w takich samych warunkach.

To kontrola komponentów, nie potwierdzenie pełnego buildu Vite. Szczegóły środowiska, testów i zastanych błędów znajdują się w `RAPORT_TESTOW_WWW_V2.md`. Poprzednie dokumenty audytowe dołączone do projektu opisują wcześniejsze wersje i nie są raportem kontroli tej poprawki.
