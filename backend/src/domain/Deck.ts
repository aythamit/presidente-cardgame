import {Card, CardType} from "./Card";

export class Deck {
  private deck: Card[];

  constructor() {
    this.deck = [];
    this.CardPool.forEach((item, index) => {
      this.deck.push(new Card(item.n, item.value, item.type));
    });
  }

  getDeck(): Card[] {
    // return this.deck;
    return this.shuffleArray(this.deck);
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]; // Crea una copia del array original para no modificarlo

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Índice aleatorio entre 0 e i
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Intercambia elementos
    }

    return newArray;
  }

  private CardPool: { n: number; value: number; type: CardType }[] = [
    { n: 1, value: 1, type: "Espada" },
    { n: 2, value: 2, type: "Espada" },
    { n: 3, value: 3, type: "Espada" },
    { n: 4, value: 4, type: "Espada" },
    { n: 5, value: 5, type: "Espada" },
    { n: 6, value: 6, type: "Espada" },
    { n: 7, value: 7, type: "Espada" },
    { n: 10, value: 10, type: "Espada" },
    { n: 11, value: 11, type: "Espada" },
    { n: 12, value: 12, type: "Espada" },
    { n: 1, value: 1, type: "Basto" },
    { n: 2, value: 2, type: "Basto" },
    { n: 3, value: 3, type: "Basto" },
    { n: 4, value: 4, type: "Basto" },
    { n: 5, value: 5, type: "Basto" },
    { n: 6, value: 6, type: "Basto" },
    { n: 7, value: 7, type: "Basto" },
    { n: 10, value: 10, type: "Basto" },
    { n: 11, value: 11, type: "Basto" },
    { n: 12, value: 12, type: "Basto" },
    { n: 1, value: 1, type: "Oro" },
    { n: 2, value: 2, type: "Oro" },
    { n: 3, value: 3, type: "Oro" },
    { n: 4, value: 4, type: "Oro" },
    { n: 5, value: 5, type: "Oro" },
    { n: 6, value: 6, type: "Oro" },
    { n: 7, value: 7, type: "Oro" },
    { n: 10, value: 10, type: "Oro" },
    { n: 11, value: 11, type: "Oro" },
    { n: 12, value: 12, type: "Oro" },
    { n: 1, value: 1, type: "Copa" },
    { n: 2, value: 2, type: "Copa" },
    { n: 3, value: 3, type: "Copa" },
    { n: 4, value: 4, type: "Copa" },
    { n: 5, value: 5, type: "Copa" },
    { n: 6, value: 6, type: "Copa" },
    { n: 7, value: 7, type: "Copa" },
    { n: 10, value: 10, type: "Copa" },
    { n: 11, value: 11, type: "Copa" },
    { n: 12, value: 12, type: "Copa" },
  ];
}
