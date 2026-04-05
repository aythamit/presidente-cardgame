import { Player } from "../domain/Player";
import { Deck } from "../domain/Deck";
import { Card } from "../domain/Card";
import { Game } from "../domain/Game";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const TOTAL_CARDS = 40;

export class InitGame {
  execute(players: Player[], idRoom: string): Game {
    console.log(`Partida empezada en room ${idRoom} con ${players.length} jugadores`);

    if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
      throw new Error(`Se necesitan entre ${MIN_PLAYERS} y ${MAX_PLAYERS} jugadores`);
    }

    this.dealCards(players);
    
    players.forEach((player: Player) => {
      console.log(`${player.getName()} tiene ${player.getHandLength()} cartas`);
    });

    return new Game(players);
  }

  dealCards(players: Player[]) {
    const deckObj = new Deck();
    const nPlayers = players.length;
    const cards = deckObj.getDeck();
    
    let cardIndex = 0;
    const cardsPerPlayer = Math.floor(TOTAL_CARDS / nPlayers);
    const extraCards = TOTAL_CARDS % nPlayers;

    for (let i = 0; i < cardsPerPlayer * nPlayers; i++) {
      const playerIndex = i % nPlayers;
      players[playerIndex].addCardToHand(cards[cardIndex++]);
    }

    console.log(`Cartas por jugador: ${cardsPerPlayer}`);
    if (extraCards > 0) {
      console.log(`Cartas extra: ${extraCards} (para jugador(es) con más cartas)`);
      for (let i = 0; i < extraCards; i++) {
        players[i].addCardToHand(cards[cardIndex++]);
      }
    }
  }
}
