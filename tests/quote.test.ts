import { describe, expect, it } from 'vitest';
import {
  bronregel,
  datumSleutel,
  favorieteQuotes,
  parseFavorieten,
  quoteVanDeDag,
  volgendeIndex,
  vorigeIndex,
  wisselFavoriet
} from '../src/quote';
import { quotes } from '../src/quotes';

// Elke test is opgebouwd als arrange, act, assert. Eerst de uitgangssituatie,
// dan de handeling, dan één duidelijke controle. De namen beschrijven gedrag
// in gewone taal, zonder functienamen en zonder het woord "should", zodat
// iemand die geen programmeur is ze ook kan lezen.

describe('bladeren door de quotes', () => {
  it('na de laatste quote kom je weer bij de eerste uit', () => {
    const aantal = 3;              // arrange
    const resultaat = volgendeIndex(2, aantal); // act
    expect(resultaat).toBe(0);     // assert
  });

  it('een stap vooruit brengt je bij de volgende quote', () => {
    const resultaat = volgendeIndex(0, 3);
    expect(resultaat).toBe(1);
  });

  it('voor de eerste quote kom je bij de laatste uit', () => {
    const resultaat = vorigeIndex(0, 3);
    expect(resultaat).toBe(2);
  });

  it('bladeren in een lege verzameling wordt geweigerd', () => {
    expect(() => volgendeIndex(0, 0)).toThrow(RangeError);
    expect(() => vorigeIndex(0, 0)).toThrow(RangeError);
  });
});

describe('de quote van vandaag', () => {
  it('een datum wordt een sleutel met voorloopnullen', () => {
    expect(datumSleutel(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(datumSleutel(new Date(2026, 10, 23))).toBe('2026-11-23');
  });

  it('dezelfde dag laat de hele dag dezelfde quote zien', () => {
    const ochtend = new Date(2026, 10, 3, 8, 0);
    const avond = new Date(2026, 10, 3, 23, 30);

    const vroeg = quoteVanDeDag(ochtend, quotes.length);
    const laat = quoteVanDeDag(avond, quotes.length);

    expect(laat).toBe(vroeg);
    expect(vroeg).toBeGreaterThanOrEqual(0);
    expect(vroeg).toBeLessThan(quotes.length);
  });

  it('over twee maanden verschijnen er meerdere verschillende quotes', () => {
    const tweeMaanden = Array.from({ length: 60 }, (_, dag) =>
      quoteVanDeDag(new Date(2026, 0, 1 + dag), quotes.length)
    );

    expect(new Set(tweeMaanden).size).toBeGreaterThan(1);
  });
});

describe('de bronvermelding onder een quote', () => {
  it('een bekende bron krijgt een gedachtestreepje ervoor', () => {
    expect(bronregel({ id: 'x', tekst: 't', bron: 'Seneca' })).toBe('— Seneca');
  });

  it('een lege bron wordt onbekend genoemd', () => {
    expect(bronregel({ id: 'x', tekst: 't', bron: '   ' })).toBe('onbekend');
  });
});

describe('quotes bewaren', () => {
  it('een quote bewaren en daarna weer weghalen laat niets achter', () => {
    const leeg: string[] = [];

    const naBewaren = wisselFavoriet(leeg, 'seneca-verbeelding');
    const naWeghalen = wisselFavoriet(naBewaren, 'seneca-verbeelding');

    expect(naBewaren).toEqual(['seneca-verbeelding']);
    expect(naWeghalen).toEqual([]);
    expect(leeg).toEqual([]);
  });

  it('onleesbare opgeslagen gegevens leveren een lege lijst op in plaats van een crash', () => {
    expect(parseFavorieten(null)).toEqual([]);
    expect(parseFavorieten('dit is geen json')).toEqual([]);
    expect(parseFavorieten('{"nope":1}')).toEqual([]);
    expect(parseFavorieten('["a", 42, "b"]')).toEqual(['a', 'b']);
  });

  it('de bewaarde quotes staan in dezelfde volgorde als op de pagina', () => {
    const bewaard = ['bestaat-niet', 'heraclitus-rivier', 'seneca-verbeelding'];

    const gekozen = favorieteQuotes(quotes, bewaard);

    expect(gekozen.map((quote) => quote.id)).toEqual([
      'seneca-verbeelding',
      'heraclitus-rivier'
    ]);
  });
});
