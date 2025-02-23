import { Player } from "../domain/Player";
import { Deck } from "../domain/Deck";
import { Card } from "../domain/Card";
import { Game } from "../domain/Game";

export class InitGame {
  execute(players: Player[], idRoom: string) {
    //Inicia la partida
    console.log(`Partida empezada en room ${idRoom}`);
    this.dealCards(players);
    players.forEach((player: Player) => {
      console.log(player);
    });

    return new Game(players);
  }

  dealCards(players: Player[]) {
    let deckObj = new Deck();
    let nPlayers: number = players.length;

    deckObj.getDeck().forEach((card: Card, indexCard: number) => {
      let playerIndex = indexCard % nPlayers;
      players[playerIndex].addCardToHand(card);
    });
  }
}
