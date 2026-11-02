import type { Quote } from './quotes';

// Alle logica staat hier, als pure functies. Geen DOM, geen opslag, geen klok
// die van buiten binnensluipt. Daardoor zijn de unit tests voorspelbaar.

export function volgendeIndex(huidige: number, aantal: number): number {
  if (aantal <= 0) throw new RangeError('er moet minstens één quote zijn');
  return (huidige + 1) % aantal;
}

export function vorigeIndex(huidige: number, aantal: number): number {
  if (aantal <= 0) throw new RangeError('er moet minstens één quote zijn');
  return (huidige - 1 + aantal) % aantal;
}

/** YYYY-MM-DD, zodat de sleutel niet van de tijdzone afhangt. */
export function datumSleutel(datum: Date): string {
  const maand = String(datum.getMonth() + 1).padStart(2, '0');
  const dag = String(datum.getDate()).padStart(2, '0');
  return `${datum.getFullYear()}-${maand}-${dag}`;
}

/** Simpele, stabiele hash. Dezelfde dag geeft altijd dezelfde quote. */
export function hash(waarde: string): number {
  let resultaat = 0;
  for (const teken of waarde) {
    resultaat = (resultaat * 31 + teken.codePointAt(0)!) % 2147483647;
  }
  return resultaat;
}

export function quoteVanDeDag(datum: Date, aantal: number): number {
  if (aantal <= 0) throw new RangeError('er moet minstens één quote zijn');
  return hash(datumSleutel(datum)) % aantal;
}

export function bronregel(quote: Quote): string {
  const bron = quote.bron.trim();
  return bron.length === 0 ? 'onbekend' : `— ${bron}`;
}

// --- favorieten ---

export function isFavoriet(favorieten: readonly string[], id: string): boolean {
  return favorieten.includes(id);
}

/** Zet een favoriet aan of uit. Geeft altijd een nieuwe lijst terug. */
export function wisselFavoriet(favorieten: readonly string[], id: string): string[] {
  return isFavoriet(favorieten, id)
    ? favorieten.filter((bestaande) => bestaande !== id)
    : [...favorieten, id];
}

/** Leest wat er uit de opslag komt. Rommel levert een lege lijst op, geen crash. */
export function parseFavorieten(ruw: string | null): string[] {
  if (!ruw) return [];
  try {
    const geparsed: unknown = JSON.parse(ruw);
    if (!Array.isArray(geparsed)) return [];
    return geparsed.filter((waarde): waarde is string => typeof waarde === 'string');
  } catch {
    return [];
  }
}

/** Favorieten in de volgorde van de quotes zelf, en zonder onbekende ids. */
export function favorieteQuotes(alle: readonly Quote[], favorieten: readonly string[]): Quote[] {
  return alle.filter((quote) => favorieten.includes(quote.id));
}
