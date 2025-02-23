import { Card } from "./Card";
import { Player } from "./Player";
import { PlayType } from "./Game";

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
}
