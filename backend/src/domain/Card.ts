export type SuitType = "Treboles" | "Diamantes" | "Corazones" | "Picas";
export type CardRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

const RANK_DISPLAY: Record<CardRank, string> = {
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
};

export class Card {
  private rank: CardRank;
  private suit: SuitType;

  constructor(rank: CardRank, suit: SuitType) {
    this.rank = rank;
    this.suit = suit;
  }

  getValue(): number {
    return this.rank;
  }

  getRank(): CardRank {
    return this.rank;
  }

  getSuit(): SuitType {
    return this.suit;
  }

  isTwo(): boolean {
    return this.rank === 2;
  }

  toString(): string {
    return `${RANK_DISPLAY[this.rank]} ${this.suit}`;
  }

  getDisplayValue(): string {
    return RANK_DISPLAY[this.rank];
  }
}
