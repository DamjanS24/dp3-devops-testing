import './styles.css';
import { quotes } from './quotes';
import {
  bronregel,
  datumSleutel,
  favorieteQuotes,
  isFavoriet,
  quoteVanDeDag,
  volgendeIndex,
  vorigeIndex,
  wisselFavoriet
} from './quote';
import { leesFavorieten, schrijfFavorieten } from './opslag';

const datumRegel = document.querySelector<HTMLParagraphElement>('[data-testid="datum"]')!;
const tekst = document.querySelector<HTMLQuoteElement>('[data-testid="quote-tekst"]')!;
const bron = document.querySelector<HTMLElement>('[data-testid="quote-bron"]')!;
const vorige = document.querySelector<HTMLButtonElement>('[data-testid="vorige"]')!;
const volgende = document.querySelector<HTMLButtonElement>('[data-testid="volgende"]')!;
const favorietKnop = document.querySelector<HTMLButtonElement>('[data-testid="favoriet"]')!;
const favorietLabel = document.querySelector<HTMLElement>('[data-testid="favoriet-label"]')!;
const teller = document.querySelector<HTMLParagraphElement>('[data-testid="teller"]')!;
const lijst = document.querySelector<HTMLUListElement>('[data-testid="bewaard-lijst"]')!;
const leeg = document.querySelector<HTMLParagraphElement>('[data-testid="bewaard-leeg"]')!;

let index = quoteVanDeDag(new Date(), quotes.length);
let favorieten = leesFavorieten();

function toonBewaard(): void {
  lijst.replaceChildren();

  for (const quote of favorieteQuotes(quotes, favorieten)) {
    const item = document.createElement('li');
    item.dataset.testid = 'bewaard-item';

    const spring = document.createElement('button');
    spring.type = 'button';
    spring.className = 'bewaard-tekst';
    spring.dataset.testid = 'bewaard-spring';
    spring.textContent = quote.tekst;
    spring.title = `toon de quote van ${quote.bron}`;
    spring.addEventListener('click', () => {
      index = quotes.findIndex((kandidaat) => kandidaat.id === quote.id);
      toon();
    });

    const weg = document.createElement('button');
    weg.type = 'button';
    weg.className = 'bewaard-weg';
    weg.dataset.testid = 'bewaard-weg';
    weg.textContent = 'Verwijderen';
    weg.setAttribute('aria-label', `Verwijderen, de quote van ${quote.bron}`);
    weg.addEventListener('click', () => {
      favorieten = wisselFavoriet(favorieten, quote.id);
      schrijfFavorieten(favorieten);
      toon();
    });

    item.append(spring, weg);
    lijst.append(item);
  }

  leeg.hidden = favorieten.length > 0;
}

function toon(): void {
  const quote = quotes[index];
  tekst.textContent = quote.tekst;
  bron.textContent = bronregel(quote);
  teller.textContent = `${index + 1} van ${quotes.length}`;

  const bewaard = isFavoriet(favorieten, quote.id);
  favorietKnop.setAttribute('aria-pressed', String(bewaard));
  favorietKnop.dataset.bewaard = String(bewaard);
  favorietLabel.textContent = bewaard ? 'Bewaard' : 'Bewaren';

  toonBewaard();
}

vorige.addEventListener('click', () => {
  index = vorigeIndex(index, quotes.length);
  toon();
});

volgende.addEventListener('click', () => {
  index = volgendeIndex(index, quotes.length);
  toon();
});

favorietKnop.addEventListener('click', () => {
  favorieten = wisselFavoriet(favorieten, quotes[index].id);
  schrijfFavorieten(favorieten);
  toon();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    index = volgendeIndex(index, quotes.length);
    toon();
  }
  if (event.key === 'ArrowLeft') {
    index = vorigeIndex(index, quotes.length);
    toon();
  }
});

datumRegel.textContent = datumSleutel(new Date());
toon();
