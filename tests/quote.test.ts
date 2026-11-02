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

describe('bladeren', () => {
  it('gaat vooruit en loopt aan het eind rond naar het begin', () => {
    expect(volgendeIndex(0, 3)).toBe(1);
    expect(volgendeIndex(2, 3)).toBe(0);
  });

  it('gaat achteruit en loopt aan het begin rond naar het eind', () => {
    expect(vorigeIndex(2, 3)).toBe(1);
    expect(vorigeIndex(0, 3)).toBe(2);
  });

  it('weigert te bladeren zonder quotes', () => {
    expect(() => volgendeIndex(0, 0)).toThrow(RangeError);
    expect(() => vorigeIndex(0, 0)).toThrow(RangeError);
  });
});

describe('quote van de dag', () => {
  it('maakt een datumsleutel met voorloopnullen', () => {
    expect(datumSleutel(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(datumSleutel(new Date(2026, 10, 23))).toBe('2026-11-23');
  });

  it('geeft dezelfde dag altijd dezelfde quote, binnen de lijst', () => {
    const ochtend = new Date(2026, 10, 3, 8, 0);
    const avond = new Date(2026, 10, 3, 23, 30);
    const gekozen = quoteVanDeDag(ochtend, quotes.length);

    expect(quoteVanDeDag(avond, quotes.length)).toBe(gekozen);
    expect(gekozen).toBeGreaterThanOrEqual(0);
    expect(gekozen).toBeLessThan(quotes.length);
  });

  it('verdeelt over de dagen heen, niet elke dag dezelfde', () => {
    const uitkomsten = new Set(
      Array.from({ length: 60 }, (_, dag) => quoteVanDeDag(new Date(2026, 0, 1 + dag), quotes.length))
    );
    expect(uitkomsten.size).toBeGreaterThan(1);
  });
});

describe('bronregel', () => {
  it('zet een gedachtestreepje voor de bron, en vangt een lege bron op', () => {
    expect(bronregel({ id: 'x', tekst: 't', bron: 'Seneca' })).toBe('— Seneca');
    expect(bronregel({ id: 'x', tekst: 't', bron: '   ' })).toBe('onbekend');
  });
});

describe('favorieten', () => {
  it('bewaart en verwijdert, en laat de oude lijst ongemoeid', () => {
    const begin: string[] = [];
    const na = wisselFavoriet(begin, 'seneca-verbeelding');

    expect(na).toEqual(['seneca-verbeelding']);
    expect(begin).toEqual([]);
    expect(wisselFavoriet(na, 'seneca-verbeelding')).toEqual([]);
  });

  it('overleeft rommel in de opslag zonder te klappen', () => {
    expect(parseFavorieten(null)).toEqual([]);
    expect(parseFavorieten('dit is geen json')).toEqual([]);
    expect(parseFavorieten('{"nope":1}')).toEqual([]);
    expect(parseFavorieten('["a", 42, "b"]')).toEqual(['a', 'b']);
  });

  it('houdt de volgorde van de quotes aan en negeert onbekende ids', () => {
    const gekozen = favorieteQuotes(quotes, ['bestaat-niet', 'heraclitus-rivier', 'seneca-verbeelding']);
    expect(gekozen.map((quote) => quote.id)).toEqual(['seneca-verbeelding', 'heraclitus-rivier']);
  });
});
