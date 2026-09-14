export const safetyPillars = [
  {
    id: 'escrow',
    title: 'Mieszkaniowy rachunek powierniczy',
    text: 'Wpłaty trafiają na rachunek powierniczy prowadzony przez bank. Środki są wypłacane deweloperowi zgodnie z zasadami rachunku i postępem inwestycji.',
  },
  {
    id: 'dfg',
    title: 'Deweloperski Fundusz Gwarancyjny',
    text: 'Nabywca jest objęty dodatkowym mechanizmem ochrony przewidzianym w ustawie deweloperskiej i finansowanym ze składek dewelopera.',
  },
  {
    id: 'stages',
    title: 'Płatności zgodne z postępem budowy',
    text: 'Kolejne wpłaty wynikają z harmonogramu przedsięwzięcia i są powiązane z wykonaniem określonych etapów prac.',
  },
] as const

export const purchaseSteps = [
  { id: '01', title: 'Wybierasz dom', text: 'Porównujesz ofertę, działki i dostępność domów A–E.' },
  { id: '02', title: 'Otrzymujesz dokumentację', text: 'Przekazujemy cenę, standard i dokumenty dotyczące wybranego domu.' },
  { id: '03', title: 'Rezerwacja / umowa', text: 'Rezerwujesz dom, a następnie podpisujesz umowę deweloperską.' },
  { id: '04', title: 'Płatności etapowe', text: 'Wpłaty są realizowane zgodnie z harmonogramem i postępem budowy.' },
  { id: '05', title: 'Odbiór i klucze', text: 'Odbierasz dom, podpisujesz protokół i rozpoczynasz nowy rozdział.' },
] as const
