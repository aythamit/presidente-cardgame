import { Player } from "./Player";
import { PlayerPlay } from "./PlayerPlay";
import { Card } from "./Card";
import { GameSettings, GameSettingsManager } from "./GameSettings";

export type RoundType = "normal" | "stairs";
export type PlayType = "play" | "pass";

export interface GameEvent {
  type: "tableCleared" | "roundFinished" | "gameFinished" | "playerEliminated" | "revolutionStarted" | "revolutionEnded";
  message: string;
  data?: unknown;
}

export interface TurnInfo {
  currentPlayerId: string;
  currentPlayerName: string;
  isMyTurn: boolean;
  passCount: number;
  playersWithCards: number;
}

export class Game {
  private players: Player[];
  private rankingPlayers: Player[];
  private currentPlayer: Player;
  private currentRound: number;
  private currentPlayerIndex: number;
  private cardsOnPlay: PlayerPlay[];
  private events: GameEvent[];
  private tableCleared: boolean;
  private revolutionActive: boolean;
  private settingsManager: GameSettingsManager;
  private consecutivePasses: number;
  private lastPlayerWhoPlayed: Player | null;
  private activePlayerCount: number;

  constructor(players: Player[], settings: Partial<GameSettings> = {}) {
    this.players = players;
    this.currentPlayer = players[0];
    this.currentPlayerIndex = 0;
    this.currentRound = 0;
    this.cardsOnPlay = [];
    this.rankingPlayers = [];
    this.events = [];
    this.tableCleared = false;
    this.revolutionActive = false;
    this.settingsManager = new GameSettingsManager(settings);
    this.consecutivePasses = 0;
    this.lastPlayerWhoPlayed = null;
    this.activePlayerCount = players.length;
  }

  initRound(currentPlayerIndex: number = 0) {
    if (this.revolutionActive) {
      this.revolutionActive = false;
      this.addEvent("revolutionEnded", "La revolucion ha terminado");
    }
    
    this.currentRound++;
    this.cardsOnPlay = [];
    this.currentPlayerIndex = currentPlayerIndex;
    this.currentPlayer = this.players[this.currentPlayerIndex];
    this.tableCleared = false;
    this.consecutivePasses = 0;
    this.lastPlayerWhoPlayed = null;
    this.activePlayerCount = this.getActivePlayersCount();

    // Don't emit roundStarted - just update internal state
    // The frontend will know who's playing via sendCurrentPlayer
  }

  private getActivePlayersCount(): number {
    return this.players.filter(p => p.getHandLength() > 0).length;
  }

  private addEvent(type: GameEvent["type"], message: string, data?: unknown) {
    this.events.push({ type, message, data });
  }

  private containsTwo(cards: Card[]): boolean {
    return cards.some(card => card.isTwo());
  }

  private cleanTable() {
    this.cardsOnPlay = [];
    this.tableCleared = true;
    this.consecutivePasses = 0;
    this.addEvent("tableCleared", "La mesa ha sido limpiada por un 2!");
  }

  private getLastPlayOnTable(): PlayerPlay | null {
    for (let i = this.cardsOnPlay.length - 1; i >= 0; i--) {
      if (this.cardsOnPlay[i].getPlayType() === "play") {
        return this.cardsOnPlay[i];
      }
    }
    return null;
  }

  private getActivePlayers(): Player[] {
    return this.players.filter(p => p.getHandLength() > 0);
  }

  playTurn(player: Player, playType: PlayType, cardsPlayed: number[]): { event: GameEvent | null; turnInfo: TurnInfo } {
    if (this.currentPlayer !== player) {
      return { event: null, turnInfo: this.getTurnInfo() };
    }

    if (playType === "play") {
      const lastPlay = this.getLastPlayOnTable();
      const playedCards = player.playCard(
        cardsPlayed,
        lastPlay,
        {
          allowEqualCards: this.settingsManager.shouldAllowEqualCards(),
          revolutionActive: this.revolutionActive
        }
      );

      if (playedCards.length <= 0) {
        return { event: null, turnInfo: this.getTurnInfo() };
      }

      if (this.containsTwo(playedCards)) {
        this.cleanTable();
        this.lastPlayerWhoPlayed = player;
      }

      if (this.settingsManager.shouldEnableRevolution() && playedCards.length === 4) {
        this.revolutionActive = true;
        this.addEvent("revolutionStarted", "REVOLUCION! La jerarquia se invierte");
      }

      this.consecutivePasses = 0;
      
      if (!this.tableCleared) {
        this.lastPlayerWhoPlayed = player;
      }

      const playerCopy = Object.assign(Object.create(Object.getPrototypeOf(player)), player);
      playerCopy.setHand([]);
      playerCopy.setSocket(null);
      this.cardsOnPlay.push(new PlayerPlay(playerCopy, playType, playedCards));

      if (player.getHandLength() === 0) {
        this.rankingPlayers.push(player);
        this.activePlayerCount--;
        this.addEvent("playerEliminated", `${player.getName()} se ha descartado`);
      }
    }

    if (playType === "pass") {
      const playerCopy = Object.assign(Object.create(Object.getPrototypeOf(player)), player);
      playerCopy.setHand([]);
      playerCopy.setSocket(null);
      this.cardsOnPlay.push(new PlayerPlay(playerCopy, playType, []));
      this.consecutivePasses++;
    }

    if (this.activePlayerCount === 0 || this.rankingPlayers.length === this.players.length - 1) {
      if (this.rankingPlayers.length < this.players.length - 1) {
        const remainingPlayers = this.getActivePlayers();
        if (remainingPlayers.length > 0) {
          this.rankingPlayers.push(...remainingPlayers);
        }
      }
      this.addEvent("gameFinished", "La partida ha terminado");
      return { event: this.events[this.events.length - 1], turnInfo: this.getTurnInfo() };
    }

    // Check if round should end:
    // - With 2 players: if one passes, the other wins the round (round ends)
    // - With 3+ players: all must pass consecutively
    const roundEnds = this.activePlayerCount === 2 
      ? this.consecutivePasses >= 1 
      : this.consecutivePasses >= this.activePlayerCount;

    if (roundEnds) {
      this.addEvent("roundFinished", "La ronda ha terminado");
      if (this.lastPlayerWhoPlayed) {
        const winnerIndex = this.players.findIndex(p => p.getId() === this.lastPlayerWhoPlayed!.getId());
        this.initRound(winnerIndex);
      } else {
        this.initRound(this.currentPlayerIndex);
      }
      return { event: this.events[this.events.length - 1], turnInfo: this.getTurnInfo() };
    }

    if (!this.tableCleared) {
      this.moveToNextPlayer();
    } else {
      this.tableCleared = false;
    }

    return { event: this.events[this.events.length - 1] || null, turnInfo: this.getTurnInfo() };
  }

  private moveToNextPlayer() {
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length <= 1) return;

    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.currentPlayer = this.players[this.currentPlayerIndex];
    } while (
      this.currentPlayer.getHandLength() === 0 &&
      this.currentPlayerIndex !== this.findLastPlayerWhoPlayedIndex()
    );
  }

  private findLastPlayerWhoPlayedIndex(): number {
    if (!this.lastPlayerWhoPlayed) return -1;
    return this.players.findIndex(p => p.getId() === this.lastPlayerWhoPlayed!.getId());
  }

  getTurnInfo(): TurnInfo {
    return {
      currentPlayerId: this.currentPlayer.getId(),
      currentPlayerName: this.currentPlayer.getName(),
      isMyTurn: true,
      passCount: this.consecutivePasses,
      playersWithCards: this.activePlayerCount
    };
  }

  printRankingPlayers() {
    this.rankingPlayers.forEach((player, index) => {
      console.log(`#${index + 1}. ${player.getName()}`);
    });
  }

  getPlayers() {
    return this.players;
  }

  getPlayer(id: string) {
    return this.players.find(player => player.getId() === id);
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getCardsOnPlay() {
    return this.cardsOnPlay;
  }

  getEvents() {
    return this.events;
  }

  getRankingPlayers() {
    return this.rankingPlayers;
  }

  isTableCleared() {
    return this.tableCleared;
  }

  isRevolutionActive() {
    return this.revolutionActive;
  }

  getConsecutivePasses() {
    return this.consecutivePasses;
  }
}
