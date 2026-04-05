export type SuitType = "Espadas" | "Bastos" | "Oros" | "Copas";
export type CardRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;

const RANK_DISPLAY: Record<CardRank, string> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  10: "10",
  11: "11",
  12: "12",
};

const RANK_VALUES: Record<CardRank, number> = {
  1: 9,    // 1 is second highest
  2: 10,   // 2 is highest
  3: 1,    // 3 is lowest
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  10: 6,
  11: 7,
  12: 8,   // 12 is third highest
};

export class Card {
  private rank: CardRank;
  private suit: SuitType;
  private gameValue: number;

  constructor(rank: CardRank, suit: SuitType) {
    this.rank = rank;
    this.suit = suit;
    this.gameValue = RANK_VALUES[rank];
  }

  getValue(): number {
    return this.gameValue;
  }

  getRawRank(): number {
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
    return `${RANK_DISPLAY[this.rank]} de ${this.suit}`;
  }

  getDisplayValue(): string {
    return RANK_DISPLAY[this.rank];
  }

  compareTo(other: Card): number {
    return this.gameValue - other.gameValue;
  }

  toJSON(): { rank: number; suit: string } {
    return {
      rank: this.rank,
      suit: this.suit
    };
  }
}

export const SUIT_ORDER: Record<SuitType, number> = {
  "Oros": 0,
  "Copas": 1,
  "Espadas": 2,
  "Bastos": 3,
};

export const RANK_ORDER: CardRank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

export const GAME_RANK_ORDER: CardRank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
