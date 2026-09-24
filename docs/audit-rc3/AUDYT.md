# Domy na Polnej — końcowy odbiór rc.3

Podstawa: rzeczywiście pobrana paczka 5.2.0-rc.2, nie starsze ustalenia z rozmów. Ten raport uzupełnia pełny audyt sekcji w `docs/audit-premium/AUDYT.md`. Data: 23.09.2026.

## Wniosek

Zachowano istniejącą, spójną wersję wizualną. Dalsza wymiana hero, fotografii, palety i układu dla samej nowości nie miała uzasadnienia. Strona prowadzi od produktu do wyboru działki, układu, standardu, dokumentów i zapytania. Dopracowano konkretne przerwania tej ścieżki i ponownie uruchomiono build oraz testy przeglądarkowe. Nie deklarujemy wzrostu konwersji bez pomiaru rzeczywistego ruchu.

To kandydat do wdrożenia, a nie potwierdzenie działania produkcji. Nie wykonano publikacji, push ani wysłania prawdziwego zapytania. Brak dostępu do poczty i konfiguracji docelowego hostingu uniemożliwia uczciwe zamknięcie odbioru produkcyjnego.

## Zakres ponownej oceny

| Obszar | Ocena i decyzja |
|---|---|
| Hero i identyfikacja | Produkt, miejscowość, metraż i etap sprzedaży są widoczne. Wizualizacja podpisana. Zachowano duże zdjęcie, spokojną typografię i jeden główny przycisk wyboru domu. |
| Nawigacja | Kolejność układu i lokalizacji dopasowana do treści. Aktywna sekcja ma semantyczne aria-current. Menu mobilne otrzymało bezpośrednie zapytanie, obok telefonu. |
| Domy i masterplan | Zachowano brak początkowego wyboru, geometrię działek, synchronizację mapy i listy, parametry i PDF-y. Kotwica listy obejmuje teraz także widoczny wariant mobilny. |
| Udostępnianie domu | Wcześniejszy link przeładowywał aplikację. Teraz kopiuje dokładny adres domu, zachowując rozpoczętą wiadomość. Odmowa schowka daje zaznaczone pole adresu do ręcznego skopiowania. |
| Architektura i rzut | Zachowano korzyści oraz interaktywny rzut, poprawne proporcje obrazu i opis pomieszczeń. Brak uzasadnienia do nowej, niezgodnej z projektem wizualizacji. |
| Lokalizacja | Zachowano mapę, orientacyjne czasy, kontekst otoczenia i bezpośredni link dojazdu. Nie dopisano usług ani odległości. |
| Galeria, spacery, panorama | Zachowano podział fotografii i wizualizacji, sterowanie, podpisy i klawiaturę. To użyteczne dowody produktu, nie dekoracja. |
| Standard | Czytelne instalacje, akordeony, PDF oraz wyłączenia zakresu. Nie podmieniono standardu na zapamiętane wersje dokumentów. |
| Dokumenty i zakup | Pobieranie bez formularza dobrze buduje zaufanie. Deklaracje formalne wymagają potwierdzenia właściciela przed publikacją; kod nie jest dowodem uruchomienia MRP. |
| Harmonogram i dziennik | Zachowano planowane terminy i pusty dziennik. Nie dopisano fikcyjnego postępu. |
| Zespół | Zachowano prawdziwe osoby, zdjęcia i role. Nie dodano referencji ani doświadczenia bez źródła. |
| FAQ | Zachowano pogrupowane pytania, odpowiedzi i zgodność z etapem sprzedaży. |
| Kontakt | Imię i telefon, opcjonalne e-mail i wiadomość, jawne zgody i wybór domu. Przetestowano błędy, zachowanie danych przy 503 i jawny tryb podglądu. |
| Mobile | Sześć szerokości, karta domu jako dialog, pola 16 px, dostęp do kontaktu; dodatkowo niski ekran poziomy. |
| Dostępność | Fokus, Escape, zakładki, błędy formularza, opis aktualnej nawigacji i komunikat kopiowania. Automatyczny test nie zastępuje testu z czytnikiem ekranu. |
| SEO / AEO | Zachowano generowanie metadanych, JSON-LD, statycznej treści, stron prawnych i sitemap z danych. Nie publikowano fikcyjnych cen ani nowych obietnic. |
| Wydajność | Build Vite, responsywne obrazy, kompresja i opóźnione ładowanie spacerów zachowane. Nie dodano bibliotek do aplikacji. Wyniki Lighthouse w starszym raporcie są historyczne — nie nowym pomiarem rc.3. |
| Kod i backend | Przejrzano przepływ danych, wybór domu, formularz, dialogi, nawigację, style, build, testy oraz obsługę kontaktu PHP. Backend pozostaje bez zmian. Brak PHP uniemożliwił wykonanie jego testów; przegląd kodu nie zastępuje testu serwera. |

## Porównanie z rynkiem

Ponownie sprawdzono publiczne materiały [Dom Development](https://www.domd.pl/pl/inwestycje) i [Echo Investment](https://www.echo.com.pl/). Użyteczne wzorce to bezpośredni wybór produktu, czytelna prezentacja lokalizacji i łatwy kontakt. Dla pięciu domów rozbudowana wyszukiwarka nie pomaga; plan i porównanie działek są wystarczające. To porównanie struktury informacji, nie pełny wizualny audyt konkurentów.

Odczyt https://domynapolnej.pl/ zwrócił tytuł bez treści. Nie ma podstaw, by uznać lokalny projekt za dokładną kopię obecnie opublikowanej domeny.

## Nowe zmiany rc.3

1. Udostępnianie domu bez przeładowania strony i utraty formularza; obsługa braku dostępu do schowka oraz reset komunikatu po zmianie domu.
2. Kotwica porównania działa również na telefonie, gdzie tabela jest ukryta.
3. Bezpośredni kontakt w menu mobilnym; kolejność linków zgodna z treścią; aria-current dla aktualnej sekcji.
4. Nowe scenariusze regresji, dokumentacja i aktualne oznaczenie wydania.

Wstępne podejrzenie ucinania menu nie potwierdziło się: istniejący arkusz editorial już zapewniał przewijanie. Zachowano je i sprawdzono ekran 844×390.

## Dane zachowane

`preservation.json` potwierdza identyczność bajtową publicznego site-data.json i wszystkich PDF-ów względem rc.2. Sprzedaż pozostaje prelaunch, ceny nieopublikowane, start budowy marzec 2027, odbiory I kwartał 2028, prospekt nieaktywny, dziennik pusty. Nie zmieniono statusów, parametrów, dokumentów ani geometrii planu.

## Testy tej iteracji

- Pełny TypeScript i build Vite: zaliczone.
- Źródła: 147 warunków; kontrola dist: zaliczona.
- `npm test`: 99 testów zaliczonych, jeden zatrzymany przez brak wykonywalnego PHP. Nie oznaczono całego polecenia jako sukces.
- Spacery: 1154 kontroli danych; 30 scen wewnętrznych i 14 zewnętrznych.
- Przeglądarka Chromium, rzeczywiste lokalne HTTP: 320, 390, 768, 1024, 1440 i 1920 px. Bez poziomego overflow, błędów aplikacji i brakujących obrazów.
- Wybór C → formularz, fokus, walidacja, kontrolowane 503, zachowanie wpisanej treści, wynik preview, zakładki, galeria i menu Escape.
- Pięć dodatkowych scenariuszy opisanych w regression.json: schowek, jego odmowa, bezpośredni adres domu, kontakt na niskim ekranie i mobilna lista/dialog.
- Wyniki dostępności: accessibility.json. Ponowny test spacerów i panoramy: docs/audit-premium/qa/immersive.json.
- Aktualne zrzuty wszystkich głównych sekcji: docs/audit-premium/qa/. Obejrzano zestaw desktop oraz mobilną kartę i sekcję wyboru domu.

## Pozostałe warunki publikacji

Potwierdzenie aktualnych danych formalnych, konfiguracja PHP/SMTP/HTTPS na docelowym hostingu, próbna wiadomość z potwierdzonym odbiorem oraz test Safari/iOS i Firefox. Nie ma tu obietnicy, że przetestowany lokalny formularz dostarcza produkcyjną pocztę. Szczegóły wdrożenia: BRAKI_I_WDROZENIE.md.
