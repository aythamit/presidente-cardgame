import { Card } from "./Card";
import { PlayerPlay } from "./PlayerPlay";
import { RoundType } from "./Game";
import {Socket} from "socket.io";

export class Player {
  private name: string;
  private hand: Card[];
  private id: string;
  private socket: Socket|null;

  constructor(name: string, id: string, socket: Socket) {
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
    this.hand = hand;
  }

  popFromHand(index: number, array: Card[]): Card | undefined {
    if (index < 0 || index >= array.length) {
      console.error("Índice fuera de rango");
      return undefined;
    }
    return array.splice(index, 1)[0];
  }

  playCard(
    indexCards: number[], 
    cardsOnPlay: PlayerPlay | null,
    options: { allowEqualCards?: boolean; revolutionActive?: boolean } = {}
  ): Card[] {
    const cards: Card[] = [];
    const typeRound: RoundType = "normal";
    const shallowCopy = [...this.hand];
    let countCards = 0;
    
    indexCards.forEach((cardIndex) => {
      const card = this.popFromHand(cardIndex - countCards, this.hand);
      countCards++;
      if (card) {
        cards.push(card);
      }
    });
    
    let cardsJugadas: Card[] | null = null;
    if (cardsOnPlay) {
      cardsJugadas = cardsOnPlay.getCardPlay();
    }
    
    if (!this.canPlayCards(cards, cardsJugadas, typeRound, options)) {
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
    options: { allowEqualCards?: boolean; revolutionActive?: boolean } = {}
  ): boolean {
    const { allowEqualCards = false, revolutionActive = false } = options;

    if (cardsPlayed.length === 0) {
      return false;
    }

    const allSameRank = cardsPlayed.every(card => card.getRank() === cardsPlayed[0].getRank());
    if (!allSameRank) {
      console.log("Las cartas deben tener el mismo valor");
      return false;
    }

    if (cardsOnBoard && cardsOnBoard.length > 0) {
      if (cardsOnBoard.length !== cardsPlayed.length) {
        console.log("debes jugar el mismo numero de cartas");
        return false;
      }

      const playedValue = this.getInvertedValue(cardsPlayed[0].getValue(), revolutionActive);
      const boardValue = this.getInvertedValue(cardsOnBoard[0].getValue(), revolutionActive);

      if (allowEqualCards) {
        return playedValue >= boardValue;
      }
      return playedValue > boardValue;
    }

    return true;
  }

  private getInvertedValue(value: number, revolution: boolean): number {
    if (revolution) {
      return 15 - value;
    }
    return value;
  }

  hasTwo(): boolean {
    return this.hand.some(card => card.isTwo());
  }

  getLowestValidCards(cardsOnBoard: Card[] | null): Card[] {
    const count = cardsOnBoard ? cardsOnBoard.length : 1;
    const boardValue = cardsOnBoard ? cardsOnBoard[0].getValue() : 0;

    const validCards = this.hand.filter(card => {
      if (cardsOnBoard) {
        return card.getValue() > boardValue;
      }
      return true;
    });

    if (validCards.length === 0) {
      return [];
    }

    validCards.sort((a, b) => a.getValue() - b.getValue());
    
    return validCards.slice(0, count);
  }

  getBestCards(count: number): Card[] {
    const sorted = [...this.hand].sort((a, b) => b.getValue() - a.getValue());
    return sorted.slice(0, count);
  }

  getWorstCards(count: number): Card[] {
    const sorted = [...this.hand].sort((a, b) => a.getValue() - b.getValue());
    return sorted.slice(0, count);
  }
}
