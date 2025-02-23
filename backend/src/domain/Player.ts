import { Card } from "./Card";
import { PlayerPlay } from "./PlayerPlay";
import { RoundType } from "./Game";
import {Socket} from "socket.io";
import { randomUUID } from "crypto";

export class Player {
  private name: string;
  private hand: Card[];
  private id: string;
  private socket: Socket|null;
  constructor(name: string, id:string, socket: Socket) {
    this.name = name;
    this.id = id;
    this.hand = [];
    this.socket = socket;
  }

  addCardToHand(card: Card) {
    this.hand.push(card);
  }

  getId() {
    return this.id;
  }

  getSocket() {
    return this.socket;
  }

  getHandLength() {
    return this.hand.length;
  }

  getHand() {
    return this.hand;
  }

  getName() {
    return this.name;
  }
  setSocket(socket: Socket|null) {
    this.socket = socket;
  }
  setHand(hand: Card[]) {
    this.hand = [];
  }

  popFromHand(index: number, array: Card[]): Card | undefined {
    if (index < 0 || index >= array.length) {
      console.error("Índice fuera de rango");
      return undefined; // O podrías lanzar un error
    }
    return array.splice(index, 1)[0];
  }

  playCard(indexCards: number[], cardsOnPlay: PlayerPlay): Card[] {
    let cards: Card[] = [];
    let typeRound: RoundType = "normal";
    const shallowCopy = [...this.hand];
    let countCards = 0;
    indexCards.forEach((cardIndex) => {
      let card = this.popFromHand(cardIndex - countCards, this.hand);
      countCards++;
      if (card) {
        cards.push(card);
      }
    });
    let cardsJugadas: Card[] | null = null;
    if (cardsOnPlay) {
      cardsJugadas = cardsOnPlay.getCardPlay();
    }
    if (!this.canPlayCards(cards, cardsJugadas, typeRound)) {
      console.log("no se pudo jugar esta carta");
      this.hand = shallowCopy;
      return [];
    }

    return cards;
  }

  canPlayCards(
    cardsPlayed: Card[],
    cardsOnBoard: Card[] | null,
    typeRound: RoundType,
  ): boolean {
    let canPlayCard = true;
    if (cardsPlayed.length == 0) {
      return false;
    }
    if (typeRound == "normal") {
      console.log(cardsPlayed);
      let cardValue = cardsPlayed[0].getValue();
      cardsPlayed.forEach((card) => {
        console.log(cardValue, card.getValue());
        if (cardValue != card.getValue()) {
          canPlayCard = false;
        }
      });
      if (!canPlayCard) {
        console.log("no se puedee");
        return canPlayCard;
      }
    }

    if (typeRound == "normal" && cardsOnBoard && cardsOnBoard.length > 0) {
      if (cardsOnBoard.length != cardsPlayed.length) {
        console.log("debes jugar el mismo numero de cartas");
        return false;
      }

      return cardsPlayed[0].getValue() > cardsOnBoard[0].getValue();
    }
    return canPlayCard;
  }
}
