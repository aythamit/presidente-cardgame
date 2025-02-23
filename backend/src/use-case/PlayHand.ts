import { Player } from "../domain/Player";
import { Card } from "../domain/Card";

class PlayHand {
  execute(player: Player, cardsPlayed: Card[]) {
    console.log(player);
    console.log(`Play Hand: ${cardsPlayed}`);
  }
}
