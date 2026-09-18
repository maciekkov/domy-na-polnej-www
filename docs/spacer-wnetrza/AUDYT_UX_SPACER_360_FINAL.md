# Audyt UX spacerów 360 — wnętrze + zewnętrze

## Reguły zastosowane w refaktorze

1. Wszystkie kadry pozostają w projekcie: 30 wnętrza i 14 zewnętrza.
2. Pin powinien oznaczać kierunek przestrzenny, który użytkownik widzi lub intuicyjnie rozumie z aktualnego kadru.
3. Otwarte strefy mają docelowo 2–4 piny. Pięć pozostawiono tylko w korytarzu, gdzie cztery drzwi i oś komunikacji są rzeczywistym skrzyżowaniem.
4. Usunięto skróty pomijające naturalne kadry pośrednie, jeżeli ten sam cel jest dostępny przez sąsiedni kadr.
5. Powrót z pomieszczenia prowadzi najpierw do widoku wejściowego/komunikacyjnego, nie kilka kadrów dalej.
6. Strzałki lewo/prawo/skos/góra/dół odzwierciedlają położenie celu na fotografii. Strzałki obrotu są używane tylko do zmiany kierunku patrzenia.
7. Portal służy przejściu wnętrze–zewnętrze. Przejścia przez ogród i taras są wzajemnie logiczne.
8. Główna treść architektoniczna pozostaje możliwie odsłonięta; w scenach gęstych piny i etykiety są delikatnie mniejsze.
9. Dodano subtelną animację kierunkową między zdjęciami. Jest to tylko wskazówka przestrzenna, nie imitacja panoramy 3D, a `prefers-reduced-motion` nadal ją wyłącza.

## Najważniejsze korekty wnętrza

- Hol przy kuchni: 5 skrótów -> 3 lokalne kierunki: wiatrołap, strefa dzienna, korytarz.
- Kuchnia/barek: 5 -> 4; salon prowadzi przez osobny kadr „Widok na salon”.
- „Widok na salon”: 4 -> 3; usunięto nielokalny skrót do spiżarni/korytarza.
- Salon z ogrodem: usunięto podwójny link do korytarza.
- Przejście z sypialni: usunięto skok do wiatrołapu; pozostają sypialnia, jadalnia i salon.
- Łazienka ogólna: wyjście z wnętrza łazienki prowadzi przez kadr wejściowy, a dopiero potem na korytarz.
- Korytarze: zachowano 5 pinów, bo odpowiadają czterem widocznym drzwiom i osi komunikacji.

## Najważniejsze korekty zewnętrzne

- Każdy hotspot dostał kierunkową ikonę zamiast domyślnej ukośnej strzałki.
- Kadr z góry jest teraz osiągalny bezpośrednio ze spaceru, nie tylko z karuzeli.
- Dodano logiczny powrót z ogrodu do sypialni przez jej przeszklenie, odpowiadający wyjściu z sypialni do ogrodu.
- Piny odsunięto od skrajnych 3–5% obrazu, gdzie etykiety łatwo wypadały poza czytelny obszar.
