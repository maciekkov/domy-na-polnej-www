# Wdrożenie i rzeczywiste ograniczenia — v5

## Co jest gotowe

W `dist/` znajduje się rzeczywiście zbudowany frontend, publiczne dane i materiały, spacery, strony prawne, 404, panel kontroli oraz backend PHP. Kompletny projekt uruchamia się lokalnie poleceniem `node preview-server.mjs`, bez instalowania zależności npm.

## Konfiguracja środowiska produkcyjnego

1. Zrób kopię aktualnego serwisu, konfiguracji i prywatnych danych. Prześlij zawartość `dist/` do katalogu publicznego docelowej domeny. Zachowaj istniejący `api/config.php` i dane aplikacji. Nie wysyłaj `src`, `vendor`, `tests`, raportów ani archiwów na publiczny hosting.
2. Hosting musi wykonywać PHP i mieć poprawne reguły serwera. Pliki `.htaccess` dostarczono dla Apache; dla innego serwera potrzebna jest równoważna konfiguracja. Sprawdź HTTPS, poprawne 404, blokowanie kodu/configu PHP i prywatnego magazynu. Podgląd Node nie testuje konfiguracji Apache.
3. Na serwerze skonfiguruj `api/config.php` na bazie `api/config.example.php`: rzeczywisty transport SMTP, hasło, nadawcę/odbiorcę, losowy klucz administratora i właściwe pochodzenia żądań. Magazyn danych ustaw poza katalogiem publicznym, korzystając z `security.storage_dir`. Sekrety nie należą do Git ani ZIP-a źródłowego.
4. Wyślij kontrolne zapytanie na właściwym hostingu i sprawdź rzeczywisty odbiór. Wykonane tutaj 51 testów PHP korzystało z lokalnego mocka SMTP, nie z poczty inwestycji. Zweryfikuj również działanie limitów, klucza administratora i uprawnień zapisu.
5. Integracja Gov Sync pozostaje wyłączona. W paczce nie ma zweryfikowanej konfiguracji zewnętrznego endpointu/schematu/poświadczeń ani dowodu udanej transmisji. Nie traktuj obecności adaptera jako potwierdzenia realizacji obowiązku publikacyjnego.
6. Po publikacji wykonaj test w Chrome, Safari/iOS i Firefox, na realnym telefonie, test WebGL/panoramy oraz Lighthouse/CWV. W tej paczce nie ma wyniku terenowego LCP/INP/CLS ani danych konwersji.

## Materiały i fakty wymagające potwierdzenia właściciela

**Prospekt:** wpis w dostarczonych danych jest nieaktywny i nie ma działającego publicznego pliku. Nie utworzono fikcyjnego prospektu ani linku udającego istniejący dokument. W stronie można pobrać rzeczywiście dostarczone karty A–E i standard techniczny.

**Pozwolenia, rachunek powierniczy i DFG:** paczka zawiera deklaracje tekstowe, ale nie pełny zestaw dokumentów urzędowych/bankowych potwierdzających aktualny stan. Nie zastąpiono ich informacjami z pamięci innych rozmów. Przed publikacją właściciel powinien zweryfikować, czy każda deklaracja nadal odpowiada rzeczywistości. Jest to istotna bramka publikacyjna, a nie certyfikacja prawna tej strony.

**Ceny, dostępność i terminy:** zachowano źródłowe ceny 779/789/799/809/819 tys. zł, pięć statusów „Dostępny”, start wskazany w źródłach na marzec 2027 i przekazanie w I kwartale 2028. Nie oznacza to niezależnego potwierdzenia ich aktualności na dzień wdrożenia. FAQ zawiera bardziej szczegółowe sformułowanie dotyczące lutego 2028; potwierdź spójność obietnicy z rzeczywistym harmonogramem.

**Dziennik budowy:** źródłowa lista wpisów jest pusta. Zachowano uczciwy stan bez wpisów zamiast generować fikcyjne postępy, daty albo zdjęcia z budowy.

## Granice weryfikacji technicznej

Testowany build wykonano `scripts/build-portable.cjs`. Komplet zależności npm nie był dostępny w środowisku, dlatego standardowego `npm ci → tsc → vite` nie udało się ukończyć. Kontrola 57 modułów TS/TSX i 15 plików JS/MJS jest kontrolą składni, a nie pełnym typecheckiem. Przed rozwojem w standardowym toolchainie uruchom `npm ci`, `npm run typecheck`, `npm run build` w środowisku z dostępem do npm.

Chromium w środowisku QA nie udostępniał kontekstu WebGL. Przetestowano przyjazny wariant awaryjny panoramy i dostęp do źródłowej fotografii; projekcja GPU pozostaje do odbioru na docelowym urządzeniu. Pełne osadzenie iframe również wymaga końcowego smoke testu na rzeczywistym originie: osobno przetestowano komponent otwierania/anulowania oraz rzeczywiste odtwarzacze obu spacerów.

Nie przeprowadzono certyfikacji WCAG, audytu prawnego, produkcyjnego testu penetracyjnego ani badania skuteczności sprzedażowej na ruchu użytkowników. Te granice nie oznaczają brakujących plików projektu; oddzielają wykonaną implementację od weryfikacji zależnej od serwera, urządzeń i dokumentów.
