import type { ContactData } from '../data/runtime/types'
import { LegalLayout } from './LegalLayout'

export function CookiePolicy({ contact }: { contact: ContactData }) {
  return (
    <LegalLayout
      title="Polityka cookies i pamięci przeglądarki"
      lead="Serwis korzysta z minimalnego zestawu mechanizmów potrzebnych do działania strony i opcjonalnej analityki uruchamianej dopiero po Twojej zgodzie."
      updated="16 września 2026"
      contact={contact}
    >
      <section>
        <h2>1. Mechanizmy niezbędne</h2>
        <p>W pamięci przeglądarki zapisujemy informację o Twojej decyzji dotyczącej analityki. Dzięki temu baner prywatności nie pojawia się przy każdym wejściu. Przy wysyłaniu formularza serwer może użyć krótkotrwałego identyfikatora sesji wyłącznie do ochrony formularza przed nadużyciami.</p>
      </section>
      <section>
        <h2>2. Analityka</h2>
        <p>Po wybraniu opcji „Akceptuj analitykę” dla bieżącej sesji tworzony jest losowy identyfikator techniczny. Służy on do rozróżnienia sesji i policzenia zdarzeń takich jak wybór domu, pobranie PDF czy uruchomienie spaceru 360°. Analityka nie jest uruchamiana, jeśli wybierzesz „Tylko niezbędne”.</p>
      </section>
      <section>
        <h2>3. Brak reklamowych trackerów</h2>
        <p>Ta wersja serwisu nie zawiera pikseli reklamowych ani zewnętrznych skryptów śledzących użytkownika pomiędzy różnymi serwisami. Jeżeli w przyszłości takie narzędzia zostaną dodane, zakres zgody i niniejsza polityka zostaną odpowiednio zaktualizowane.</p>
      </section>
      <section>
        <h2>4. Zmiana decyzji</h2>
        <p>Ustawienia analityki możesz zmienić w każdej chwili, wybierając „Ustawienia cookies” w stopce strony głównej. Możesz także usunąć dane witryny bezpośrednio w ustawieniach swojej przeglądarki.</p>
      </section>
      <section>
        <h2>5. Kontakt</h2>
        <p>Pytania dotyczące prywatności możesz kierować na adres <a href={contact.emailHref}>{contact.email}</a>.</p>
      </section>
    </LegalLayout>
  )
}
