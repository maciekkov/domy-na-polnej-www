# Korekta UI — oferta i kontakt

## Oferta domów
- usunięto rząd `Pełna oferta: Dom A–E`,
- usunięto link `Pełna oferta` z karty wybranego domu,
- usunięto osobne statyczne podstrony `/dom-a/`–`/dom-e/`,
- usunięto je z sitemap.xml i generatora SEO,
- pozostawiono masterplan, tabelę, kartę domu, cenę brutto, cenę/m², historię ceny, CTA oraz pobieranie PDF,
- JSON-LD oferty A–E nadal opisuje produkty i ceny, ale prowadzi do wyboru domu na stronie głównej.

## Formularz kontaktowy
- zmniejszono wysokość całej sekcji na desktopie,
- siatka: 0.9 / 1.1 z mniejszym odstępem,
- formularz ma mniejszy padding i odstępy pionowe,
- pola desktop: min. 44 px, tekst 16 px,
- textarea desktop: 84 px zamiast 122 px,
- zgody są zwarte, ale nadal czytelne,
- przycisk ma 46 px wysokości,
- mobile nadal utrzymuje 48 px dla pól i 16 px tekstu, aby nie pogorszyć obsługi dotykowej.

## Weryfikacja
`npm test` zakończony powodzeniem:
- 147 warunków source-check,
- 78 testów Node,
- 1152 sprawdzenia danych i grafu spacerów,
- 30 scen wnętrza + 14 scen zewnętrznych bez zmian.
