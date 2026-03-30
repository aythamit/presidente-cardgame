import {Card, SuitType, CardRank} from "./Card";

type CardData = { rank: CardRank; suit: SuitType };

export class Deck {
  private deck: Card[];
  private suits: SuitType[] = ["Treboles", "Diamantes", "Corazones", "Picas"];
  private ranks: CardRank[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

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
    return { rank: 3, suit: "Treboles" };
  }
}
