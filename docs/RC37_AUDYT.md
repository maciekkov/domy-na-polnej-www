# RC37 — przejścia 360° → Standard → Bezpieczeństwo → Proces zakupu

Baza: `domy-na-polnej-www-5.2.0-rc.36-EDITORIAL-FLOW.zip`. Wersja wynikowa: `5.2.0-rc.37`. Data: 29.09.2026.

## Co wdrożono

Zatwierdzoną drugą koncepcję odwzorowano w trzech granicach rozdziałów. Dół „Dwa sposoby oglądania” odsłania jasną powierzchnię Standardu przez szeroki, asymetryczny łuk z cienkim złotym obrysem. Na końcu pełnego Standardu jasna powierzchnia schodzi zakrzywioną krawędzią na istniejące zielone tło „Najpierw konkret. Potem decyzja.”. Ostatnie, płytsze przejście odsłania jasny Proces zakupu.

To są rzeczywiste warstwy SVG/CSS, nie zrzut referencji podłożony jako tło. Każda granica korzysta z własnej krzywej, wspólnego koloru ivory i nieskalującej się grubości linii. Szerokość wynosi 100% obszaru strony, bez poszerzania dokumentu przez 100vw. Na telefonie wysokości krawędzi zmniejszają się do 44–45 px.

Warstwy dekoracyjne znajdują się w rezerwie przy granicach sekcji. Nie maskują całych komponentów ani nie wymagają ujemnych marginesów wokół tekstu lub przycisków. Rozwinięcie treści technicznych nadal zwiększa wysokość Standardu i przesuwa następny rozdział w normalnym przepływie dokumentu. Dekoracje mają `aria-hidden`, nie przyjmują fokusu i nie przechwytują kliknięć.

## Zachowanie treści i zakres zmian

**Nie usunięto żadnego pliku wejściowej paczki. Wszystkie 186 plików w `public/` są identyczne bajtowo z RC36.** Obejmuje to zdjęcia, ilustracje, panoramy, dokumenty, opublikowane dane oraz samodzielne spacery. Nie dodano nowych zdjęć, zależności ani systemowych fontów. Nie zmieniano API, formularzy, danych handlowych, nagłówka nawigacji ani wcześniej zaakceptowanego połączenia rzutu, salonu i mapy.

W istniejącym kodzie uruchamianej strony zmodyfikowano tylko trzy pliki:

- `Gallery.tsx`: import oraz wstawienie jednej dekoracyjnej granicy po treści spacerów. Oryginalne komponenty, obsługa stanów, linki i przyciski pozostają takie same.
- `SecurityProcess.tsx`: import oraz dwie granice dekoracyjne. Trzy filary, dokumenty, proces i ich logika pozostają takie same.
- `site.css`: dodanie importu izolowanego arkusza. Oryginalny `standard-editorial.css` nadal jest ostatni w kaskadzie.

Dodano pomocniczy `ChapterFlowEdge.tsx` i arkusz `chapter-flow.css`. Komponent `Standard.tsx` pozostawiono bez zmiany choćby jednego bajtu. Pozostałe różnice obejmują metadane wydania, changelog, raport i testy. Pełna lista znajduje się w `CHANGED_FILES_RC37.txt`.

**W szczególności zachowano „Przemyślane rozwiązania na lata”, wszystkie sześć rozwijanych grup, osiem wyróżników standardu, trzy ilustracje, pełny standard PDF, zastrzeżenie o charakterze ilustracji i PV, dokumenty zakupu oraz opisy pięciu kroków.** Wygenerowana wizualizacja nie pokazywała całej części technicznej, dlatego wynikowy fragment jest od niej dłuższy. Nie skracano treści dla pozornego podobieństwa całego zrzutu. Zachowano oryginalne fotografie zamiast domów i wnętrz dorysowanych na mockupie.

## Weryfikacja wizualna i iteracje

Uruchomiono całą rzeczywistą stronę React z `App`, `SiteDataProvider`, oryginalnymi komponentami i arkuszami, a nie ręcznie odtworzony fragment HTML. Użyto lokalnej transpilacji TypeScript 5.8.3 i dostępnego w środowisku runtime React 19.1.1, zgodnego z wersją projektu. Ten mechanizm służył tylko QA; nie dodano go do aplikacji i nie podmieniono zależności.

Przewinięto badane sekcje, poczekano na obrazy ładowane leniwie i potwierdzono ich `naturalWidth`. Dzięki temu audyt obejmuje rzeczywiste ilustracje, a nie puste pola oczekujące na zdjęcia. Render odbywał się w trybie ograniczenia animacji. W harnessie wyłączono wyłącznie płynne przewijanie na czas pomiarów i screenshotów; nie ukrywano treści strony.

Pierwsza iteracja ujawniła zbyt szerokie puste odstępy przy łukach i drobną różnicę tonu między powierzchnią SVG a Standardem. Skrócono te odstępy i dopasowano kolor powierzchni. Druga iteracja została obejrzana na komputerze i telefonie. Następnie skorygowano pozycję i bardzo subtelne wygaszenie górnej krawędzi istniejącego zdjęcia przy wejściu do bezpieczeństwa. Ponownie wyrenderowano wynik dla szerokości pośrednich oraz dużego monitora.

Finalne podglądy: [cały fragment — desktop](flow-rc37/desktop.jpg) i [cały fragment — telefon](flow-rc37/mobile.jpg). Są to zrzuty renderu kodu, nie obrazy generowane przez AI.

## Testy przeglądarkowe: 157/157 wykonanych kontroli

Sprawdzono szerokości **320, 390, 768, 960, 1024, 1440, 1672, 1920 i 2560 px**. Szczegóły każdej kontroli: [runtime-results.json](flow-rc37/runtime-results.json).

Porównanie DOM z bazą RC36 potwierdziło identyczność tekstów, etykiet, adresów linków, przycisków, źródeł ilustracji i liczby rozwijanych grup w czterech rozdziałach. Sprawdzono załadowanie wszystkich badanych obrazów, trzy pełnoszerokie granice SVG, brak poziomego przewijania, nieprzechwytywanie kliknięć przez dekoracje i niezasłonięte przyciski PDF oraz dokumentów.

Otworzono wszystkie sześć grup standardu jednocześnie i potwierdzono przesunięcie kolejnej sekcji zamiast przycięcia zawartości. Sprawdzono obsługę grup klawiaturą, otwieranie wyboru spaceru, działanie fokusu w oknie, zamknięcie przez Escape i przywrócenie fokusu do przycisku. Dodatkowo na 390 i 1672 px sprawdzono otwieranie okna panoramy, dostępność zamknięcia i odblokowanie strony po wyjściu.

Weryfikacja pełnej szerokości odnosi się do szerokości głównego obszaru strony. Oryginalny `scrollbar-gutter: stable` może rezerwować 15 px po stronie paska przewijania; nie jest to biały margines kompozycji.

## Testy źródeł

- `source-check`: **151/151** warunków.
- Dostępne dotychczasowe testy logiki i regresji, łącznie z RC36: **116/116**.
- Nowe testy RC37: **8/8**. Sprawdzają również skróty oryginalnych komponentów i niezmienność ich logiki po usunięciu dekoracyjnych wstawek.
- Integracja spacerów: **1136 sprawdzeń**, pozytywnie; 29 widoków wnętrza i 14 na zewnątrz.
- Kontrola składni: **60 modułów TS/TSX i 17 plików JS/MJS**, pozytywnie. Nowy test uruchomiono również oddzielnie.

W jednym istniejącym teście RC36 zmieniono zamrożony numer wydania na kontrolę prawidłowego formatu i zgodności wersji w package/lockfile. Jego asercje chroniące wcześniejsze flow i kolejność CSS pozostają. Nowy test RC37 sprawdza dokładny aktualny numer we wszystkich plikach wersji.

## Ograniczenia audytu

**Nie wykonano produkcyjnego buildu Vite ani pełnego typechecku z zależnościami projektu.** Rejestr npm nie był osiągalny przez DNS, a próba `npm ci --offline` zakończyła się `ENOTCACHED`. Skrypt `npm test` uruchamia też dotychczasowy test SSR wymagający zainstalowanego pakietu React w Node; ten plik nie wystartował (`ERR_MODULE_NOT_FOUND`). Pełne `npm test` nie jest raportowane jako sukces: wykonało 110 zaliczonych testów i jeden błąd uruchomienia pliku SSR. Dostępne regresje RC36 i RC37 uruchomiono oddzielnie z wynikami podanymi powyżej.

**Środowisko Chromium nie udostępnia WebGL.** Zweryfikowano okno panoramy, jego niezmieniony komunikat zastępczy, sterowanie fokusem i zamknięcie, ale nie potwierdzono renderowania sceny 3D ani przybliżania/obracania obrazu na GPU. Kod renderera, zdjęcie panoramiczne, moduły okien i zawartość spacerów są niezmienione. Nie modyfikowano aplikacji w celu obchodzenia ograniczenia środowiska.

Telefon był emulowany w Chromium. Nie wykonano testu na fizycznym urządzeniu iOS/Safari. Nie wysyłano formularzy ani nie zmieniano produkcji, repozytorium GitHub lub hostingu.

## Powtórzenie na środowisku z npm

```sh
npm ci
npm test
npm run test:flow
npm run test:chapters
npm run build
```

Powyższe polecenia opisują pełną weryfikację możliwą z kompletnymi zależnościami. Nie oznaczają, że produkcyjny build został wykonany w tym audycie.
