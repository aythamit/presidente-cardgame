import { Player } from "../domain/Player";
import { Card } from "../domain/Card";
import { PlayerRole, assignRoles, getRoleName } from "../domain/PlayerRole";
import { GameSettings } from "../domain/GameSettings";

export interface ExchangeResult {
  success: boolean;
  president: { receives: Card[]; gives: Card[] };
  vicePresident: { receives: Card[]; gives: Card[] };
  viceScum: { gives: Card[] };
  scum: { gives: Card[] };
  messages: string[];
}

export interface CardExchangePlan {
  playerId: string;
  cardsToGive: Card[];
  cardsToReceive: Card[];
}

export class CardExchange {
  execute(
    players: Player[],
    ranking: Player[],
    settings: GameSettings
  ): ExchangeResult {
    const result: ExchangeResult = {
      success: false,
      president: { receives: [], gives: [] },
      vicePresident: { receives: [], gives: [] },
      viceScum: { gives: [] },
      scum: { gives: [] },
      messages: []
    };

    const totalPlayers = players.length;
    const rankingNames = ranking.map(p => p.getId());
    const roleAssignments = assignRoles(rankingNames, totalPlayers);

    const presidentId = roleAssignments.find(r => r.role === PlayerRole.PRESIDENT)?.player;
    const vicePresidentId = roleAssignments.find(r => r.role === PlayerRole.VICE_PRESIDENT)?.player;
    const viceScumId = roleAssignments.find(r => r.role === PlayerRole.VICE_SCUM)?.player;
    const scumId = roleAssignments.find(r => r.role === PlayerRole.SCUM)?.player;

    const president = players.find(p => p.getId() === presidentId);
    const vicePresident = players.find(p => p.getId() === vicePresidentId);
    const viceScum = players.find(p => p.getId() === viceScumId);
    const scum = players.find(p => p.getId() === scumId);

    if (!president || !scum) {
      result.messages.push("Error: No se encontraron Presidente o Escoria");
      return result;
    }

    const presidentSwapCount = settings.presidentSwapCount;
    const viceSwapCount = settings.viceSwapCount;

    result.messages.push("=== FASE DE INTERCAMBIO DE CARTAS ===");

    result.messages.push(`${getRoleName(PlayerRole.PRESIDENT)}: ${president.getName()}`);
    result.messages.push(`${getRoleName(PlayerRole.SCUM)}: ${scum.getName()}`);

    if (totalPlayers >= 4 && vicePresident && viceScum) {
      result.messages.push(`${getRoleName(PlayerRole.VICE_PRESIDENT)}: ${vicePresident.getName()}`);
      result.messages.push(`${getRoleName(PlayerRole.VICE_SCUM)}: ${viceScum.getName()}`);
    }

    const scumBestCards = scum.getBestCards(presidentSwapCount);
    const presidentWorstCards = president.getWorstCards(presidentSwapCount);

    result.scum.gives = scumBestCards;
    result.president.receives = scumBestCards;

    result.president.gives = presidentWorstCards;

    scumBestCards.forEach(card => {
      scum.getHand().splice(scum.getHand().indexOf(card), 1);
      president.addCardToHand(card);
    });

    presidentWorstCards.forEach(card => {
      president.getHand().splice(president.getHand().indexOf(card), 1);
      scum.addCardToHand(card);
    });

    result.messages.push(`${scum.getName()} da ${presidentSwapCount} carta(s) a ${president.getName()}`);
    result.messages.push(`${president.getName()} da ${presidentSwapCount} carta(s) a ${scum.getName()}`);

    if (totalPlayers >= 4 && vicePresident && viceScum) {
      const viceScumBestCard = viceScum.getBestCards(viceSwapCount);
      const vicePresidentWorstCard = vicePresident.getWorstCards(viceSwapCount);

      result.viceScum.gives = viceScumBestCard;
      result.vicePresident.receives = viceScumBestCard;
      result.vicePresident.gives = vicePresidentWorstCard;

      viceScumBestCard.forEach(card => {
        viceScum.getHand().splice(viceScum.getHand().indexOf(card), 1);
        vicePresident.addCardToHand(card);
      });

      vicePresidentWorstCard.forEach(card => {
        vicePresident.getHand().splice(vicePresident.getHand().indexOf(card), 1);
        viceScum.addCardToHand(card);
      });

      result.messages.push(`${viceScum.getName()} da ${viceSwapCount} carta(s) a ${vicePresident.getName()}`);
      result.messages.push(`${vicePresident.getName()} da ${viceSwapCount} carta(s) a ${viceScum.getName()}`);
    }

    result.success = true;
    result.messages.push("=== INTERCAMBIO COMPLETADO ===");

    return result;
  }
}
