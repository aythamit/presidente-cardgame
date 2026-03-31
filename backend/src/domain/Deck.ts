import {Card, SuitType, CardRank} from "./Card";

export class Deck {
  private deck: Card[];
  private suits: SuitType[] = ["Espadas", "Bastos", "Oros", "Copas"];
  private ranks: CardRank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

  constructor() {
    this.deck = [];
    this.createDeck();
  }

  private createDeck(): void {
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        this.deck.push(new Card(rank, suit));
      }
    }
  }

  getDeck(): Card[] {
    return this.shuffleArray(this.deck);
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  getCardsByRank(rank: CardRank): Card[] {
    return this.deck.filter(card => card.getRank() === rank);
  }

  static getStartingCard(): { rank: CardRank; suit: SuitType } {
    return { rank: 1, suit: "Oros" };
  }

  static getTotalCards(): number {
    return 40;
  }
}
