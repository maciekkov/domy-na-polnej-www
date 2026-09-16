# TEST REPORT — V6.1

Data: 16.09.2026

Repozytorium zawiera zsynchronizowane testy źródłowe i przeglądarkowe dla V6.1.

`npm test` sprawdza m.in.: oryginalny `dnp-masterplan.svg`, brak `masterplan.webp`, routing/404, API, SEO, 17 FAQ, harmonogram 0/1/4, formularz, analitykę i responsywność.

`npm run test:visual` sprawdza 1440/1024/390 px, aktywny SVG masterplanu, 17 FAQ, układ 2-kolumnowy FAQ przy 1024 px, harmonogram oraz strony prawne i HTTP 404.

Pełny przebieg po instalacji zależności:

```bash
npm run test:all
```

Sekrety SMTP nie są częścią testów ani repozytorium.
