import type { ContactData } from '../data/runtime/types'
import { LegalLayout } from './LegalLayout'

export function PrivacyPolicy({ contact }: { contact: ContactData }) {
  return (
    <LegalLayout
      title="Polityka prywatności"
      lead="Poniżej wyjaśniamy, jakie dane przetwarzamy w serwisie Domy na Polnej, w jakim celu i jakie prawa przysługują osobom korzystającym ze strony."
      updated="18 września 2026"
      contact={contact}
    >
      <section><h2>1. Administrator danych</h2><p>Administratorem danych osobowych jest X-SMART DEVELOP sp. z o.o. z siedzibą w Lubsku, ul. Warszawska 58/3, 68-300 Lubsko, KRS 0001091198, NIP 8943230686, REGON 527945971.</p><p>Kontakt: <a href={contact.emailHref}>{contact.email}</a>, <a href={contact.phoneHref}>{contact.phoneDisplay}</a>.</p></section>
      <section><h2>2. Dane z formularza</h2><p>Możemy przetwarzać wybrany dom, imię, telefon, opcjonalny e-mail i treść wiadomości w celu odpowiedzi na zapytanie i obsługi kontaktu. Dane formularza nie są dołączane do zdarzeń analitycznych.</p></section>
      <section><h2>3. Pseudonimowa analityka po zgodzie</h2><p>Po zgodzie na analityczne pliki cookie losowy identyfikator first-party może być utrzymywany do 180 dni. System rejestruje wizyty i powroty, ścieżkę strony, wybraną ofertę, źródło kampanii, kategorię urządzenia i zakres szerokości ekranu, wejścia do sekcji oraz czas w sekcjach i scenach spaceru.</p><p>Identyfikator nie zawiera imienia, telefonu ani e-maila. Nie prowadzimy nagrań sesji, keyloggingu ani zapisu ruchu myszy. Dane są używane do oceny zainteresowania ofertą i poprawy serwisu.</p></section>
      <section><h2>4. Dane techniczne i bezpieczeństwo</h2><p>Hosting może przetwarzać standardowe logi bezpieczeństwa, takie jak adres IP, czas żądania, zasób i informacje o błędach. Są one oddzielone od pseudonimowej analityki zachowania i służą ochronie infrastruktury oraz diagnostyce.</p></section>
      <section><h2>5. Odbiorcy danych</h2><p>Dane mogą być powierzane podmiotom obsługującym hosting, pocztę i utrzymanie IT wyłącznie w niezbędnym zakresie i na odpowiedniej podstawie prawnej.</p></section>
      <section><h2>6. Okres przechowywania</h2><p>Zdarzenia analityczne są przechowywane maksymalnie około 200 dni, a identyfikator odwiedzającego w przeglądarce maksymalnie 180 dni od ostatniego odświeżenia zgody i korzystania. Dane z zapytań są przechowywane przez okres potrzebny do obsługi kontaktu oraz zabezpieczenia roszczeń.</p></section>
      <section><h2>7. Twoje prawa</h2><p>W przypadkach przewidzianych przepisami przysługuje Ci prawo dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, sprzeciwu, przenoszenia danych i cofnięcia zgody. Możesz także złożyć skargę do Prezesa UODO.</p></section>
      <section><h2>8. Dobrowolność danych</h2><p>Podanie danych w formularzu jest dobrowolne, lecz imię i telefon są potrzebne do skutecznej odpowiedzi. E-mail i wiadomość dodatkowa są opcjonalne.</p></section>
      <section><h2>9. Zautomatyzowane decyzje</h2><p>Nie podejmujemy wobec użytkowników decyzji wywołujących skutki prawne wyłącznie automatycznie i nie prowadzimy profilowania reklamowego na podstawie tej analityki.</p></section>
    </LegalLayout>
  )
}
