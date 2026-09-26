# Audyt rc.23

Zmiany dotyczą tylko hero, tabeli porównania, etykiet dokumentów i stopki. Pozostałe sekcje i funkcje pozostają zgodne z rc.22.

- Hero: usunięta cała lista parametrów pod CTA, zachowany tekst i przyciski.
- Porównanie: usunięta wymuszona minimalna szerokość tabeli 1060 px i poziomy przewijak. Aktywne wiersze A–E mają równe, prostokątne krawędzie. Przy szerokości do 640 px ukryta jest wyłącznie kolumna „Pok.”, bo pięć pokoi w każdym domu jest widoczne w karcie. Cena, status, numer działki, powierzchnia domu i działki pozostają w tabeli.
- Materiały: linki PDF zachowano, pod głównym tytułem pliku nie ma drugiego wiersza „PDF · wersja 1.0”.
- Stopka: mniejsza szerokość i odstępy, czytelne oddzielenie danych rejestrowych; ikona Instagram ma dyskretny gradient.

Build TypeScript/Vite oraz test źródeł i paczki produkcyjnej przeszły. Chromium: testy interakcji na 320, 390, 768, 1024 i 1440 px. Dodatkowo sprawdzono faktyczne wymiary i brak przewijania tabeli, prosty róg po wybraniu domu A oraz brak błędów JavaScript. Zrzuty i dane: folder `rc23` oraz `rc23/audit.json`. PHP i wysyłka SMTP wymagają docelowego hostingu.
