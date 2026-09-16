# Audyt wdrożenia Domy na Polnej

## Wynik

Warstwa publiczna zawiera komplet sekcji 01–12 i stopkę, zachowuje desktop-first premium layout z dokumentacji oraz ma responsywne warianty 1440, 1024 i 390 px. Interakcje galerii, spaceru, panoramy, planu funkcjonalnego, kart domów, FAQ i modali przeszły test przeglądarkowy.

## Korekty wykonane w tej wersji

- dodano panel demonstracyjny pod `/administrator` oraz aliasem `/administracja`;
- spięto ofertę A–E, kontakt, harmonogram, dziennik i dokumenty przez model draft/publish;
- dodano nieusuwalną historię zmian cen, rewizje, audyt operacji i eksport kopii JSON;
- formularz w lokalnym podglądzie zapisuje zapytania w mini-CRM;
- dodano prywatną analitykę first-party uruchamianą dopiero po zgodzie, bez PII i bez GA4;
- ujednolicono dane kontaktowe w headerze, kontakcie, modalu domu i stopce;
- dodano obsługę bezpośrednich tras panelu dla hostingu Apache (`.htaccess`);
- zachowano Gov Sync wyłącznie jako bezpieczny podgląd DEMO bez możliwości wysyłki.

## Elementy wymagające danych od inwestora przed produkcją

- potwierdzenie rzeczywistych dat i stanów etapów harmonogramu;
- potwierdzenie treści oraz fotografii wpisów dziennika budowy;
- dostarczenie aktywnych plików: prospekt, polityka prywatności, polityka cookies, dane dewelopera;
- finalne adresy profili społecznościowych;
- produkcyjny backend, baza danych, bezpieczne sesje i hasła; login `admin/admin` jest wyłącznie demonstracyjny;
- docelowy adapter Gov Sync może zostać odblokowany dopiero po wdrożeniu potrójnej bramki środowiska, konfiguracji i jawnej zgody administratora.

## Uruchomienie

1. `npm install`
2. `npm run dev`
3. strona: `http://localhost:5173/`
4. panel: `http://localhost:5173/administrator`

Login demonstracyjny: `admin`  
Hasło demonstracyjne: `admin`

Weryfikacja: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:visual`, `npm run test:admin`.
