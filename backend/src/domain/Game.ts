import { Player } from "./Player";
import { PlayerPlay } from "./PlayerPlay";
import { Card } from "./Card";
import { GameSettings, GameSettingsManager, DEFAULT_GAME_SETTINGS } from "./GameSettings";

export type RoundType = "normal" | "stairs";
export type PlayType = "play" | "pass";

export interface GameEvent {
  type: "tableCleared" | "roundFinished" | "gameFinished" | "playerEliminated" | "revolutionStarted" | "revolutionEnded";
  message: string;
  data?: unknown;
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
    this.events = [];
    this.tableCleared = false;
  }

  initRound(currentPlayerIndex: number = 0) {
    if (this.revolutionActive) {
      this.revolutionActive = false;
      this.addEvent("revolutionEnded", "La revolución ha terminado");
      console.log("La revolución ha terminado");
    }
    
    this.currentRound++;
    this.cardsOnPlay = [];
    this.currentPlayerIndex = currentPlayerIndex;
    this.currentPlayer = this.players[this.currentPlayerIndex];
    this.tableCleared = false;

    this.addEvent("roundFinished", `Ronda número ${this.currentRound}`);
    console.log(`\n\nRonda número ${this.currentRound}`);
    console.log(`Empìeza el jugador: ${this.currentPlayer.getName()}`);
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
    this.addEvent("tableCleared", "¡La mesa ha sido limpiada por un 2!");
    console.log("¡La mesa ha sido limpiada por un 2!");
  }

  finishRound() {
    const lastPlays = this.getLastPlayOnTable();

    if (lastPlays != null) {
      const playerWinnerIndex = this.players.findIndex(
        (player) => player === lastPlays.getPlayer(),
      );
      this.initRound(playerWinnerIndex);
    }
  }

  private getLastPlayOnTable(): PlayerPlay | null {
    let index = this.cardsOnPlay.length - 1;
    while (index >= 0 && index < this.cardsOnPlay.length) {
      if (this.cardsOnPlay[index].getPlayType() === "play") {
        return this.cardsOnPlay[index];
      }
      index--;
    }
    return null;
  }

  private isRoundFinished(): boolean {
    const lastPlay = this.getLastPlayOnTable();
    if (lastPlay != null) {
      return this.currentPlayer === lastPlay.getPlayer();
    }
    return false;
  }

  playTurn(player: Player, playType: PlayType, cardsPlayed: number[]): GameEvent | null {
    console.log(`\n Playturn`);
    if (this.currentPlayer !== player) {
      console.error(`Aún no te toca ${player.getName()}`);
      return null;
    }

    if (playType === "play") {
      console.log(` ---- ${player.getName()} juega ----`);

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
        console.log("No se pudieron jugar las cartas");
        return null;
      }

      if (this.containsTwo(playedCards)) {
        this.cleanTable();
      }

      if (this.settingsManager.shouldEnableRevolution() && playedCards.length === 4) {
        this.revolutionActive = true;
        this.addEvent("revolutionStarted", "¡REVOLUCIÓN! La jerarquía se invierte");
        console.log("¡REVOLUCIÓN! La jerarquía se invierte");
      }

      const playerCopy = Object.assign(Object.create(Object.getPrototypeOf(player)), player);
      playerCopy.setHand([]);
      playerCopy.setSocket(null);
      this.cardsOnPlay.push(new PlayerPlay(playerCopy, playType, playedCards));

      if (this.currentPlayer.getHandLength() === 0) {
        console.log(` ---- ${this.currentPlayer.getName()} se descarta ----`);
        this.rankingPlayers.push(player);
        this.addEvent("playerEliminated", `${player.getName()} se ha descartado`);
      }
    }

    if (playType === "pass") {
      console.log(` ---- ${player.getName()} PASA ----`);
      const playerCopy = Object.assign(Object.create(Object.getPrototypeOf(player)), player);
      playerCopy.setHand([]);
      playerCopy.setSocket(null);
      this.cardsOnPlay.push(new PlayerPlay(playerCopy, playType, []));
    }

    if (this.rankingPlayers.length === this.players.length - 1) {
      console.log(`SE TERMINA EL JUEGO`);
      this.rankingPlayers.push(this.currentPlayer);
      this.addEvent("gameFinished", "La partida ha terminado");
      return this.events[this.events.length - 1];
    }

    if (!this.tableCleared) {
      this.checkNextPlayerCards();
    } else {
      console.log("El jugador que cortó juega de nuevo");
      this.tableCleared = false;
    }

    console.log(`Current player: ${this.currentPlayer.getName()}`);

    if (this.isRoundFinished()) {
      console.log("Finalizado la ronda");
      this.finishRound();
    } else {
      console.log("Se sigue jugando");
    }

    return this.events[this.events.length - 1] || null;
  }

  private checkNextPlayerCards() {
    this.currentPlayerIndex++;
    let count = 0;
    this.currentPlayer = this.players[this.currentPlayerIndex % this.players.length];

    while (
      this.currentPlayer.getHandLength() === 0 &&
      count < this.players.length - 1
    ) {
      console.log(
        `${this.currentPlayer.getName()} no tiene cartas, pasamos al siguiente`,
      );
      count++;
      this.currentPlayerIndex++;
      this.currentPlayer = this.players[this.currentPlayerIndex % this.players.length];
    }
  }

  printRankingPlayers() {
    console.log(`Imprimiendo ranking`);
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
}
