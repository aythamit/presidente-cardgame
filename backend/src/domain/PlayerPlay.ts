import { Card } from "./Card";
import { Player } from "./Player";
import { PlayType } from "./Game";

export type PlayCombination = "individual" | "pair" | "triplet" | "quartet";

export class PlayerPlay {
  private player: Player;
  private playType: PlayType;
  private cardPlay: Card[];

  constructor(player: Player, playType: PlayType, cardPlay: Card[]) {
    this.player = player;
    this.cardPlay = cardPlay;
    this.playType = playType;
  }

  toString(): string {
    return `${this.player.getName()} ha jugado ${this.cardPlay}`;
  }

  getCardPlay() {
    return this.cardPlay;
  }

  getPlayer() {
    return this.player;
  }

  getPlayType() {
    return this.playType;
  }

  getCombinationType(): PlayCombination {
    const count = this.cardPlay.length;
    switch (count) {
      case 1:
        return "individual";
      case 2:
        return "pair";
      case 3:
        return "triplet";
      case 4:
        return "quartet";
      default:
        throw new Error(`Invalid combination type: ${count} cards`);
    }
  }

  getValue(): number {
    if (this.cardPlay.length === 0) {
      return 0;
    }
    return this.cardPlay[0].getValue();
  }

  isValidCombination(): boolean {
    if (this.cardPlay.length === 0) {
      return true;
    }
    if (this.cardPlay.length > 4) {
      return false;
    }
    const firstRank = this.cardPlay[0].getRank();
    return this.cardPlay.every(card => card.getRank() === firstRank);
  }
}
