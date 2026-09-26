# Audyt poprawionej wersji rc.21

Poprzednia wersja za mocno redukowała wysokość obrazów. Narzucone wysokości kontenera rzutu kolidowały z naturalnym obrazem i mogły rozjechać nakładkę SVG. Kilka kolejnych zielonych sekcji tworzyło nieczytelny blok. To zostało poprawione w rc.21.

## Zmiany

- Hero: usunięta biała karta i strzałka w dół; zachowana własna tapeta.
- Rytm: wspólna skala odstępów 76 / 60 / 48 px na desktopie, tablecie i telefonie. Galeria oraz proces zakupu są jasne. Kolejność: lokalizacja → jasna galeria → ciemny spacer → jasny standard → ciemne bezpieczeństwo → jasny proces.
- Galeria: trzy zdjęcia zamiast czterech nierówno spłaszczonych kadrów. Główne zdjęcie ma szeroki format, obok dwa mniejsze. Wszystkie zdjęcia nadal są w lightboxie. Na telefonie główne zdjęcie nad parą mniejszych.
- Spacer: większe karty, nagłówki szeryfowe, okrągłe ikony, złote detale, czytelny opis. Panorama korzysta z istniejącego zdjęcia okolicy z drona; nie dodano fikcyjnego krajobrazu.
- Wysoki sufit: jedna kompozycja w marginesach, duży zielony panel i własne zdjęcie strefy dziennej, większy wymiar i dolny opis ogrodu.
- Rzut: kontener, obraz i SVG mają jednakową proporcję 1195:896. Brak sztywnej wysokości i ucinania do wysokości viewportu. Obrys i wypełnienie pomieszczenia używają parametrów masterplanu: maska rgba(192,236,121,.065), obrys #c9f37e, 2.2 px i delikatna poświata. Hover ma pierwszeństwo przed zaznaczeniem; wybór pozostaje aktywny po opuszczeniu planu.
- Panel pomieszczeń: zdjęcie, tytuł, metraż i korzyści mają osobne czytelne poziomy. Ucięte kapsułki zastąpiono pełną listą wyboru.

## Sprawdzenie

Wykonano build TypeScript/Vite, kontrolę źródeł i dist. Testy przeglądarkowe obejmują 320, 390, 768, 1024 i 1440 px, w tym nowy test zgodności wymiarów obrazu i SVG, wybór pomieszczenia, kolor lasera i zmianę na widok umeblowany. Ponownie sprawdzono galerię, formularze, domy, zakładki i spacer wnętrza. Wynik jest w interaction-report.json.

Zrzuty wszystkich sekcji: screenshots/ dla 1440×900, 1366×768 i 390×900. Zrzuty zaznaczenia kuchni: plan-laser-1440.png i plan-laser-390.png. Sekcje z większą ilością treści mogą przekroczyć jeden ekran — priorytetem są pełne zdjęcia i czytelność.

Nie wykonywano publikacji ani rzeczywistej wysyłki e-mail. PHP/SMTP pozostają do weryfikacji na docelowym serwerze. Historyczny AUDYT_REFERENCJI.md opisuje rc.20; ten dokument dotyczy bieżącej wersji.

Główny arkusz korekt: src/styles/flow-refinement.css. Źródła i gotowy dist znajdują się w paczce.
