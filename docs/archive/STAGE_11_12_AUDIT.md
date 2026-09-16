# Audyt wdrożenia — etap 11–12 + footer

## Zakres
Rozwinięto checkpoint 01–10 bez przebudowy wcześniejszych sekcji. Dodano 11 Inwestor/Zespół, 12 FAQ + kontakt i footer.

## Audyt zgodności z planszą 6(5).png
1. **Hierarchia:** zachowana — intro zespołu po lewej, trzy osoby i social proof po prawej; następnie FAQ 2-kolumnowe; ciemny kontakt 2-kolumnowy; stopka.
2. **Geometria:** po pierwszym renderze poszerzono lewą kolumnę zespołu/FAQ/kontaktu dla 880–1100 px, aby układ i łamanie H2 odpowiadały planszy.
3. **Materiały:** koncepcyjne twarze z makiety zastąpiono rzeczywistymi materiałami z paczki. Brakujący portret MR Atelier nie został wygenerowany.
4. **FAQ:** 10 wierszy, pierwszy otwarty, semantyka `aria-expanded` / `aria-controls`; treść terminu zgodna z harmonogramem referencyjnym.
5. **Kontakt:** `selectedHouse` przechodzi do formularza; walidacja, honeypot, stany error/success; endpoint preview i produkcyjny PHP są rozdzielone.
6. **Footer:** prawdziwy kontakt, Instagram, menu; brakujące dokumenty nie udają aktywnych linków.
7. **Responsive:** brak overflow dla 1440×900, 1024×768, 768×1024 i 390×844; desktop przechodzi w układ pionowy/karty na mobile.
8. **Konsola:** zero błędów w testowanych viewportach.

## Iteracje
- **Iteracja A:** implementacja źródłowa + patch gotowego `dist`, pierwsze odwzorowanie planszy.
- **Iteracja B:** realne assety zespołu, korekta szerokości kolumn, FAQ image, dokładniejsza odpowiedź o terminie, czyszczenie CSS, finalny browser QA.

## Blokady niezależne od kodu
Pełny TypeScript/Vite rebuild w środowisku wykonawczym jest zablokowany przez brak `node_modules` w paczce wejściowej i brak dostępu do rejestru npm. `npm test`, PHP lint, runtime preview i browser QA przechodzą. Po `npm ci` należy wykonać `npm run typecheck && npm run build` przed wdrożeniem produkcyjnym.
