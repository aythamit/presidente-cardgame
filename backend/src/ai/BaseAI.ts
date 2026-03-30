import { Player } from "../domain/Player";
import { Card } from "../domain/Card";
import { PlayerPlay } from "../domain/PlayerPlay";

export type PlayDecision = {
  action: "play" | "pass";
  cards: Card[];
  reason: string;
};

export abstract class BaseAI {
  protected player: Player;
  protected thinkTime: number;

  constructor(player: Player, thinkTime: number = 1000) {
    this.player = player;
    this.thinkTime = thinkTime;
  }

  abstract decide(cardsOnTable: PlayerPlay | null): Promise<PlayDecision>;

  protected async wait(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.thinkTime));
  }

  protected getCardsOfSameRank(hand: Card[], rank: number): Card[] {
    return hand.filter(card => card.getRank() === rank);
  }

  protected getCardsByCount(hand: Card[], count: number): Card[][] {
    const result: Card[][] = [];
    const rankGroups = new Map<number, Card[]>();

    hand.forEach(card => {
      const rank = card.getRank();
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, []);
      }
      rankGroups.get(rank)!.push(card);
    });

    rankGroups.forEach((cards) => {
      if (cards.length === count) {
        result.push(cards);
      }
    });

    return result;
  }

  protected getValidPlays(cardsOnTable: PlayerPlay | null): Card[][] {
    const hand = this.player.getHand();
    const validPlays: Card[][] = [];

    if (!cardsOnTable || cardsOnTable.getCardPlay().length === 0) {
      return hand.map(card => [card]);
    }

    const boardCards = cardsOnTable.getCardPlay();
    const boardCount = boardCards.length;
    const boardValue = boardCards[0].getValue();

    const matchingGroups = this.getCardsByCount(hand, boardCount);

    matchingGroups.forEach(group => {
      if (group[0].getValue() > boardValue) {
        validPlays.push(group);
      }
    });

    return validPlays;
  }

  protected async simulateThinking(): Promise<void> {
    await this.wait();
  }
}
