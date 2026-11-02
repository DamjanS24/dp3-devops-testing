export interface Quote {
  id: string;
  tekst: string;
  bron: string;
}

export const quotes: Quote[] = [
  {
    id: 'aurelius-geest',
    tekst: 'Je hebt macht over je eigen geest, niet over wat er buiten je gebeurt. Besef dat, en je vindt kracht.',
    bron: 'Marcus Aurelius'
  },
  {
    id: 'seneca-verbeelding',
    tekst: 'We lijden vaker in onze verbeelding dan in werkelijkheid.',
    bron: 'Seneca'
  },
  {
    id: 'epictetus-reactie',
    tekst: 'Het gaat niet om wat je overkomt, maar om hoe je erop reageert.',
    bron: 'Epictetus'
  },
  {
    id: 'laozi-stap',
    tekst: 'Een reis van duizend mijl begint met één stap.',
    bron: 'Lao Tzu'
  },
  {
    id: 'heraclitus-rivier',
    tekst: 'Niemand stapt twee keer in dezelfde rivier.',
    bron: 'Heraclitus'
  },
  {
    id: 'montaigne-tegenslagen',
    tekst: 'Mijn leven zat vol verschrikkelijke tegenslagen, waarvan de meeste nooit gebeurd zijn.',
    bron: 'Michel de Montaigne'
  }
];
