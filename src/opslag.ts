import { parseFavorieten } from './quote';

const SLEUTEL = 'quote-van-de-dag.favorieten.v1';

// localStorage kan geblokkeerd zijn of vol zitten, dus nooit zonder vangnet.
export function leesFavorieten(): string[] {
  try {
    return parseFavorieten(localStorage.getItem(SLEUTEL));
  } catch {
    return [];
  }
}

export function schrijfFavorieten(favorieten: readonly string[]): void {
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(favorieten));
  } catch {
    // Opslaan is een extraatje, de pagina werkt ook zonder.
  }
}
