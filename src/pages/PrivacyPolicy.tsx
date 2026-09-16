import type { ContactData } from '../data/runtime/types'
import { LegalLayout } from './LegalLayout'

export function PrivacyPolicy({ contact }: { contact: ContactData }) {
  return (
    <LegalLayout
      title="Polityka prywatności"
      lead="Poniżej wyjaśniamy, jakie dane przetwarzamy w serwisie Domy na Polnej, w jakim celu i jakie prawa przysługują osobom korzystającym ze strony."
      updated="16 września 2026"
      contact={contact}
    >
      <section>
        <h2>1. Administrator danych</h2>
        <p>Administratorem danych osobowych jest X-SMART DEVELOP sp. z o.o. z siedzibą w Lubsku, ul. Warszawska 58/3, 68-300 Lubsko, KRS 0001091198, NIP 8943230686, REGON 527945971.</p>
        <p>W sprawach dotyczących prywatności możesz skontaktować się przez e-mail <a href={contact.emailHref}>{contact.email}</a> lub telefonicznie pod numerem <a href={contact.phoneHref}>{contact.phoneDisplay}</a>.</p>
      </section>
      <section>
        <h2>2. Dane z formularza kontaktowego</h2>
        <p>W formularzu możemy przetwarzać: wybrany dom, imię, numer telefonu, opcjonalny adres e-mail oraz treść wiadomości. Dane są używane do odpowiedzi na zapytanie, przedstawienia informacji o inwestycji i dalszej obsługi kontaktu.</p>
        <p>Podstawą przetwarzania jest podjęcie działań na Twoje żądanie przed zawarciem umowy, prawnie uzasadniony interes administratora polegający na obsłudze zapytań oraz — w zakresie, w którym jest wymagana — udzielona zgoda na kontakt.</p>
      </section>
      <section>
        <h2>3. Analityka po zgodzie</h2>
        <p>Po wyrażeniu zgody zapisujemy wyłącznie techniczne zdarzenia związane z korzystaniem ze strony, np. wyświetlenie strony, wybór domu, pobranie karty PDF, uruchomienie spaceru lub przejście do formularza. Zdarzenie zawiera losowy identyfikator sesji, ścieżkę strony, opcjonalne oznaczenie domu oraz źródło kampanii UTM.</p>
        <p>System analityczny nie zapisuje w tych zdarzeniach imienia, numeru telefonu, adresu e-mail, treści formularza, ruchu myszy ani nagrań sesji. Zgoda może zostać w każdej chwili zmieniona w ustawieniach prywatności w stopce.</p>
      </section>
      <section>
        <h2>4. Dane techniczne i bezpieczeństwo</h2>
        <p>Serwer hostingowy może przetwarzać standardowe logi techniczne, takie jak adres IP, czas żądania, żądany zasób i informacje o błędach. Dane te służą zapewnieniu bezpieczeństwa, diagnostyce i ochronie przed nadużyciami.</p>
      </section>
      <section>
        <h2>5. Odbiorcy danych</h2>
        <p>Dane mogą być powierzane podmiotom obsługującym hosting, pocztę elektroniczną, utrzymanie infrastruktury IT oraz innym podmiotom wspierającym administratora, wyłącznie w zakresie niezbędnym do realizacji tych usług i na podstawie odpowiednich umów.</p>
      </section>
      <section>
        <h2>6. Okres przechowywania</h2>
        <p>Dane z zapytań przechowujemy przez okres potrzebny do obsługi kontaktu i ewentualnych dalszych rozmów, a następnie przez czas wymagany do zabezpieczenia lub dochodzenia roszczeń. Techniczne dane analityczne są przechowywane maksymalnie około 13 miesięcy.</p>
      </section>
      <section>
        <h2>7. Twoje prawa</h2>
        <p>W przypadkach przewidzianych przepisami masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu oraz cofnięcia zgody bez wpływu na zgodność z prawem wcześniejszego przetwarzania.</p>
        <p>Masz także prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</p>
      </section>
      <section>
        <h2>8. Dobrowolność podania danych</h2>
        <p>Podanie danych w formularzu jest dobrowolne, ale imię i numer telefonu są potrzebne, abyśmy mogli skutecznie odpowiedzieć na zapytanie. E-mail i dodatkowa wiadomość są opcjonalne.</p>
      </section>
      <section>
        <h2>9. Zautomatyzowane decyzje</h2>
        <p>Nie podejmujemy wobec użytkowników decyzji wywołujących skutki prawne w sposób wyłącznie zautomatyzowany i nie prowadzimy profilowania marketingowego na podstawie danych z tej strony.</p>
      </section>
    </LegalLayout>
  )
}
