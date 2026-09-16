# V6.1 — production hardening

Data: 16.09.2026

## Najważniejsze

- pełny masterplan SVG został zachowany/przywrócony jako nadrzędny asset; brak zamiennika `masterplan.webp`,
- build generuje kompletny `dist` wraz z API, stronami prawnymi i 404,
- `api/config.php` pozostaje prywatny i wykluczony z repo,
- canonical, robots.txt, sitemap.xml, Open Graph, Twitter Card i JSON-LD,
- prawdziwe HTTP 404 i lokalny-only panel administratora DEMO,
- first-party analytics wyłącznie po zgodzie, identyfikator sesji bez danych formularza,
- Hero renderuje jeden aktywny obraz i respektuje `prefers-reduced-motion`,
- cena od 779 000 zł pokazana w Hero,
- CTA telefonu zmienione na jednoznaczne „Zadzwoń”,
- FAQ: 17 pytań w 3 grupach; przy 880–1100 px układ 2-kolumnowy i większa typografia,
- formularz waliduje opcjonalny e-mail i linkuje do polityki prywatności,
- usunięty newsletter DEMO z dziennika budowy,
- poprawiona obsługa klawiatury tabów i focus-trap w modalach spaceru,
- dodane Polityka prywatności i Polityka cookies,
- dodany argument sprzedażowy względem samodzielnego prowadzenia budowy.

## Uwaga dotycząca wydajności

Pozostałe optymalizacje ładowania pozostają, ale masterplan nie podlega kompresji do rastra. Jakość i kompletność pełnego SVG mają w tej sekcji pierwszeństwo przed wagą pliku.
