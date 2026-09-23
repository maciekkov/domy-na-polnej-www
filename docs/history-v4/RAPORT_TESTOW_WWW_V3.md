# Raport QA — Domy na Polnej / natural flow v3

## Zakres
Zmiana jest pass'em estetycznym na bazie zaakceptowanej wersji v2. Nie zmieniono danych ofertowych, cen, statusów, geometrii masterplanu, formularzy, spacerów 360 ani logiki wyboru domu.

## Regresje źródłowe
- `node tests/aesthetic-flow-v2.mjs` — PASS po doprecyzowaniu starego testu: transformacje ozdobników nie są już mylone z transformacją kompasu.
- `node tests/aesthetic-flow-v3.mjs` — PASS.
- Kompas nadal ma `data-north-angle="135"`, czyli północ wskazuje 4:30.
- Oryginalne ścieżki działek A–E i viewBox masterplanu pozostają bez zmian.

## QA przeglądarkowe
Do kontroli użyto bieżących plików TSX przetranspilowanych TypeScriptem do izolowanego harnessu z React 19.1.1 oraz oryginalnych CSS i assetów projektu. Nie jest to build Vite, ale renderuje realne komponenty strony.

Sprawdzone szerokości: 320, 390, 768, 900, 1024, 1180, 1440 i 1865 px.

Wynik:
- 0 błędów JS / page errors w harnessie;
- 0 px poziomego overflow na wszystkich sprawdzonych szerokościach;
- dodatkowe ozdobniki są ukryte przy `max-width: 900px`;
- na desktopie widoczne są tylko wybrane akcenty: sekcja 02, 03, 07, 10 oraz istniejący detal botaniczny w kontakcie;
- elementy dekoracyjne mają `pointer-events: none`, więc nie blokują map, formularzy ani CTA.

## Build produkcyjny
`npm run build` nie został w tym środowisku potwierdzony, ponieważ dostarczona lokalna kopia `node_modules` zawierała tylko puste/niepełne katalogi typów. Próba odtworzenia zależności offline nie powiodła się z powodu brakującego pakietu w cache npm. Zmiana v3 dotyczy CSS oraz testów QA; pliki TSX aplikacji nie były modyfikowane względem v2.

Dodatkowo istniejący `tests/source-check.mjs` nie przechodzi już w bazowej v2 z powodu historycznego assetu `public/assets/images/hero-desktop.webp`; identyczny błąd występuje przed zmianami v3 i nie jest skutkiem tego passa.
