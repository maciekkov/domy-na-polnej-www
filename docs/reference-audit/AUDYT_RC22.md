# Audyt rc.22

## Zrealizowane korekty

1. Usunięto blok „Każdy dom ma ten sam układ” oraz jego link. Zmniejszono dolne odstępy sekcji porównania.
2. Treść hero przesunięto w dół o 28 px na desktopie, 20 px na tablecie i 16 px na telefonie.
3. Masterplan zajmuje pełną szerokość dokumentu. Usunięto boczną kartę. Karta przy tabeli pozostaje, a tabela, SVG i formularz współdzielą wybór domu. Proporcja obrazu 1672:941 i identyczne rozmiary nakładki są sprawdzane testem. Na telefonie zachowano panel wyboru domu.
4. Architektura codzienności: własny kadr frontu domu. FAQ: własny kadr podcienia wejściowego.
5. Wysoki sufit: wymiary panelu, główna typografia i odstępy zmniejszone około 5%; bez transformacji z pozostawioną pustą przestrzenią.
6. Spacer 360 / panorama: desktop 460 px zamiast 560 px, proporcje bliższe dostarczonemu renderowi. Na mniejszych ekranach 500 px dla czytelności treści.
7. Standard: ilustracje powiększone o 20% względem poszczególnych breakpointów. Kolaż desktop 416 px zamiast 320 px, laptop 351 px zamiast 270 px. Górna krawędź kontenera kolażu jest w tym samym wierszu siatki co kafle ikon. Na telefonie zachowane proporcje obrazu i pionowy układ.
8. Proces: pięć szczegółowszych ikon wektorowych; ikona, numer i nagłówek wyśrodkowane na jednej osi. Opisy zaczynają się na wspólnej wysokości desktopowej.
9. Ikona Instagram otrzymała delikatny gradient w barwach marki i biały symbol.

## Kontrola

Build TypeScript/Vite oraz kontrola źródeł i dist. Testy interakcji na szerokościach 320, 390, 768, 1024, 1440 px, w tym kontrola pełnej szerokości masterplanu i pokrycia obrazu przez SVG. Sprawdzono wybór domu, galerię, rzut pomieszczeń, formularze oraz spacer. Aktualny raport: interaction-report.json. Zrzuty desktop/laptop/mobile znajdują się w screenshots/.

Nie wykonywano wdrożenia ani rzeczywistej wysyłki SMTP. PHP pozostaje do sprawdzenia na hostingu. Poprzednie raporty rc.20 i rc.21 są historyczne. Bieżący arkusz zmian: src/styles/audit-polish.css.
