import { BaseAI, PlayDecision } from "./BaseAI";
import { PlayerPlay } from "../domain/PlayerPlay";

export class EasyAI extends BaseAI {
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

    const lowestPlay = validPlays.reduce((lowest, current) => {
      const lowestValue = lowest[0].getValue();
      const currentValue = current[0].getValue();
      return currentValue < lowestValue ? current : lowest;
    });

    const twos = hand.filter(card => card.isTwo());
    if (twos.length > 0 && lowestPlay[0].getValue() < 10) {
      const nonTwoLowest = lowestPlay;
      return {
        action: "play",
        cards: nonTwoLowest,
        reason: `IA fácil juega ${nonTwoLowest[0].getValue()} (guarda los 2s)`
      };
    }

    return {
      action: "play",
      cards: lowestPlay,
      reason: `IA fácil juega ${lowestPlay[0].getValue()} (menor valor válido)`
    };
  }
}
