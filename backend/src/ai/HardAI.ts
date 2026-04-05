import { BaseAI, PlayDecision } from "./BaseAI";
import { PlayerPlay } from "../domain/PlayerPlay";
import { Card } from "../domain/Card";

export class HardAI extends BaseAI {
  async decide(cardsOnTable: PlayerPlay | null): Promise<PlayDecision> {
    await this.simulateThinking();

    const hand = this.player.getHand();
    const validPlays = this.getValidPlays(cardsOnTable);

    if (validPlays.length === 0) {
      return {
        action: "pass",
        cards: [],
        reason: "No tiene cartas válidas para jugar"
      };
    }

    if (hand.length <= 3) {
      const lowestPlay = validPlays[0];
      return {
        action: "play",
        cards: lowestPlay,
        reason: "IA difícil: pocas cartas, juega para avanzar"
      };
    }

    const boardCards = cardsOnTable?.getCardPlay() || [];
    const boardCount = boardCards.length;
    const twos = hand.filter(card => card.isTwo());
    const aces = hand.filter(card => card.getValue() === 14);

    if (twos.length > 0 && boardCards.length > 0) {
      const boardValue = boardCards[0].getValue();
      if (boardValue >= 10) {
        return {
          action: "play",
          cards: [twos[0]],
          reason: "IA difícil: corta la mesa con un 2 (mesa alta)"
        };
      }
    }

    const pairsOnTable = boardCount === 2 ? boardCards : [];
    if (pairsOnTable.length === 2) {
      const boardPairValue = boardCards[0].getValue();
      const myPairs = this.getCardsByCount(hand, 2);
      const higherPairs = myPairs.filter(pair => pair[0].getValue() > boardPairValue);
      
      if (higherPairs.length > 0 && Math.random() > 0.5) {
        return {
          action: "play",
          cards: higherPairs[0],
          reason: "IA difícil: rompe pareja del tablero"
        };
      }
    }

    const lowestPlay = validPlays.reduce((lowest, current) => {
      const lowestValue = lowest[0].getValue();
      const currentValue = current[0].getValue();
      return currentValue < lowestValue ? current : lowest;
    });

    if (aces.length > 0 && hand.length > 5) {
      const playableAces = aces.filter(ace => {
        if (!cardsOnTable) return true;
        return ace.getValue() > cardsOnTable.getCardPlay()[0].getValue();
      });

      if (playableAces.length > 0 && lowestPlay[0].getValue() < 10) {
        return {
          action: "play",
          cards: lowestPlay,
          reason: "IA difícil: guarda los Ases para el final"
        };
      }
    }

    const isHighestPlay = validPlays.every(
      play => play[0].getValue() === lowestPlay[0].getValue()
    );

    if (isHighestPlay && lowestPlay[0].getValue() >= 12) {
      return {
        action: "pass",
        cards: [],
        reason: "IA difícil: pasa, no quiere tirar cartas altas"
      };
    }

    return {
      action: "play",
      cards: lowestPlay,
      reason: "IA difícil: juega carta válida más baja"
    };
  }
}
