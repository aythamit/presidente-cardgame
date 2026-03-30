export { BaseAI, PlayDecision } from "./BaseAI";
export { EasyAI } from "./EasyAI";
export { HardAI } from "./HardAI";

import { BaseAI, PlayDecision } from "./BaseAI";
import { EasyAI } from "./EasyAI";
import { HardAI } from "./HardAI";
import { Player } from "../domain/Player";
import { PlayerPlay } from "../domain/PlayerPlay";

export type AIDifficulty = "easy" | "hard";

export function createAI(player: Player, difficulty: AIDifficulty, thinkTime?: number): BaseAI {
  switch (difficulty) {
    case "easy":
      return new EasyAI(player, thinkTime || 800);
    case "hard":
      return new HardAI(player, thinkTime || 1500);
    default:
      return new EasyAI(player, thinkTime || 1000);
  }
}

export async function getAIDecision(
  ai: BaseAI, 
  cardsOnTable: PlayerPlay | null
): Promise<PlayDecision> {
  return ai.decide(cardsOnTable);
}
