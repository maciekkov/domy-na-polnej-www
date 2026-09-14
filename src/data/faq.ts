export type FaqItem = { id: string; question: string; answer: string }

export const faqItems: FaqItem[] = [
  {
    id: 'completion',
    question: 'Kiedy planowane jest zakończenie?',
    answer: 'Planowane zakończenie budowy to I kwartał 2026 roku. Harmonogram może ulec niewielkim zmianom, o których zawsze informujemy z wyprzedzeniem.',
  },
  {
    id: 'standard',
    question: 'Co obejmuje standard?',
    answer: 'Standard obejmuje m.in. pompę ciepła, rekuperację, ogrzewanie podłogowe, rolety elektryczne, stolarkę trzyszybową, duże przeszklenia, przygotowanie PV oraz ogrodzenie. Pełny zakres znajduje się w dokumencie Standard techniczny.',
  },
  {
    id: 'plot',
    question: 'Czy działka jest własnością kupującego?',
    answer: 'Każdy dom jest oferowany wraz z przypisaną działką. Szczegółowy sposób przeniesienia własności i dokumentacja prawna są przedstawiane kupującemu przed podpisaniem umowy.',
  },
  {
    id: 'changes',
    question: 'Czy można wprowadzać zmiany?',
    answer: 'Możliwość zmian zależy od etapu budowy, zakresu technicznego i wpływu na dokumentację. Każdą zmianę oceniamy indywidualnie przed jej potwierdzeniem.',
  },
  {
    id: 'reservation',
    question: 'Jak działa rezerwacja?',
    answer: 'Po wyborze konkretnego domu przekazujemy dokumentację i warunki rezerwacji. Następnie uzgadniany jest termin podpisania właściwej umowy i dalszy harmonogram płatności.',
  },
  {
    id: 'visit',
    question: 'Czy można obejrzeć działkę?',
    answer: 'Tak. Termin prezentacji terenu inwestycji ustalamy indywidualnie. Skontaktuj się z nami telefonicznie lub przez formularz poniżej.',
  },
  {
    id: 'attic',
    question: 'Czy dom ma strych?',
    answer: 'Tak. Budynek ma poddasze nieużytkowe przewidziane jako dodatkowa przestrzeń techniczna i magazynowa; szczegóły zakresu i dostępu wynikają z dokumentacji domu.',
  },
  {
    id: 'finance',
    question: 'Jak wygląda finansowanie?',
    answer: 'Zakup jest prowadzony w modelu deweloperskim, a płatności są powiązane z etapami realizacji. Szczegóły finansowania własnego lub kredytowego ustala kupujący ze swoim bankiem.',
  },
  {
    id: 'extra-costs',
    question: 'Jakie są koszty dodatkowe?',
    answer: 'Koszty zależą od wybranego domu, sposobu finansowania oraz ewentualnych zmian ponad standard. Przed decyzją klient otrzymuje zestawienie ceny i dokumentów dotyczących konkretnego domu.',
  },
  {
    id: 'security',
    question: 'Jak zabezpieczony jest zakup?',
    answer: 'Proces przewiduje mieszkaniowy rachunek powierniczy, ochronę Deweloperskiego Funduszu Gwarancyjnego oraz płatności zgodne z postępem budowy. Mechanizmy opisujemy szczegółowo w sekcji Bezpieczeństwo i proces zakupu.',
  },
]
