import type { ContactData } from '../data/runtime/types'
import { LegalLayout } from './LegalLayout'

export function CookiePolicy({ contact }: { contact: ContactData }) {
  return (
    <LegalLayout
      title="Polityka cookies"
      lead="Wyjaśniamy, jakie pliki cookie i podobne mechanizmy wykorzystuje serwis Domy na Polnej oraz jak możesz nimi zarządzać."
      updated="18 września 2026"
      contact={contact}
    >
      <section>
        <h2>1. Niezbędne pliki cookie i pamięć</h2>
        <p>Mechanizmy niezbędne służą do działania strony, ochrony formularza oraz zapamiętania Twojej decyzji dotyczącej plików cookie. Nie są wykorzystywane do analizy zachowania użytkownika.</p>
      </section>
      <section>
        <h2>2. Analityczne pliki cookie — tylko po zgodzie</h2>
        <p>Po wybraniu „Akceptuj wszystkie” tworzymy losowy, pseudonimowy identyfikator odwiedzającego na maksymalnie 180 dni oraz krótkotrwały identyfikator wizyty. Pozwala to rozpoznać powrót tej samej przeglądarki, policzyć wizyty, typ urządzenia oraz czas spędzony w sekcjach strony i scenach wirtualnego spaceru.</p>
        <p>Jeśli wybierzesz „Tylko niezbędne”, analityczne identyfikatory nie są tworzone, a pomiar zachowania użytkownika jest wyłączony. Zmiana decyzji na „Tylko niezbędne” usuwa nasze identyfikatory analityczne z przeglądarki.</p>
      </section>
      <section>
        <h2>3. Czego nie rejestrujemy w analityce</h2>
        <p>Nie zapisujemy w zdarzeniach analitycznych imienia, telefonu, e-maila, treści formularza, pełnego User-Agent, ruchu kursora, wpisywanych klawiszy ani nagrań sesji. Serwis nie używa zewnętrznych reklamowych trackerów do śledzenia użytkownika pomiędzy różnymi stronami.</p>
      </section>
      <section>
        <h2>4. Zmiana decyzji</h2>
        <p>Ustawienia możesz zmienić w każdej chwili przez „Ustawienia cookies” w stopce. Możesz również usunąć dane witryny w ustawieniach przeglądarki.</p>
      </section>
      <section>
        <h2>5. Kontakt</h2>
        <p>Pytania dotyczące cookies i prywatności możesz kierować na adres <a href={contact.emailHref}>{contact.email}</a>.</p>
      </section>
    </LegalLayout>
  )
}
