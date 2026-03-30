import { Player } from "../domain/Player";
import {Socket} from "socket.io";
import {Game} from "../domain/Game";
import {InitGame} from "../use-case/InitGame";

interface Room {
  id: string;
  players: Player[];
  game: Game | null;
}

interface PlayerInfo {
  id: string;
  name: string;
  handLength: number;
}

class RoomController {
  private rooms: Map<string, Room> = new Map();

  public createRoom(roomId: string): void {
    if (this.rooms.has(roomId)) {
      throw new Error(`La sala ${roomId} ya existe.`);
    }

    const newRoom: Room = {
      id: roomId,
      players: [],
      game: null,
    };

    this.rooms.set(roomId, newRoom);
  }

  public joinRoom(roomId: string, playerId: string, playerName: string, socket: Socket): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`La sala ${roomId} no existe.`);
    }

    if (room.players.find((p) => p.getId() === playerId)) {
      socket.emit('message', `El jugador ${playerName} ya esta en la sala ${roomId}.`);
      throw new Error(`El jugador ${playerId} ya esta en la sala ${roomId}.`);
    }

    const newPlayer = new Player(playerName, playerId, socket);
    room.players.push(newPlayer);
    
    socket.emit('message', `Bienvenido a la sala ${roomId}`);
    this.sendHistoryMessage(roomId, `Jugador ${playerName} se unio a la sala.`);
    this.sendPlayerList(roomId);

    socket.on('disconnect', () => {
      this.leaveRoom(roomId, playerId);
    });
  }

  public leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.getId() === playerId);
    const playerName = player?.getName() || playerId;
    
    room.players = room.players.filter((p) => p.getId() !== playerId);
    this.sendHistoryMessage(roomId, `${playerName} ha abandonado la sala.`);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    } else {
      this.sendPlayerList(roomId);
    }
  }

  public sendPlayerList(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerInfos: PlayerInfo[] = room.players.map(player => ({
      id: player.getId(),
      name: player.getName(),
      handLength: room.game ? room.game.getPlayer(player.getId())?.getHandLength() || 0 : 0
    }));

    room.players.forEach(player => {
      player.getSocket()?.emit('sendPlayerList', playerInfos);
    });
  }

  public sendHistoryMessage(roomId: string, message: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    room.players.forEach(player => {
      player.getSocket()?.emit('sendHistoryMessages', message);
    });
  }

  public initGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`La sala ${roomId} no existe.`);
    }

    if (room.players.length < 2) {
      throw new Error(`Se necesitan al menos 2 jugadores para iniciar.`);
    }

    room.game = new InitGame().execute(room.players, room.id);
    room.game.initRound();

    this.sendGameState(roomId);
  }

  private sendGameState(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.game) return;

    const currentPlayer = room.game.getCurrentPlayer();
    const turnInfo = room.game.getTurnInfo
      ? room.game.getTurnInfo()
      : { currentPlayerId: currentPlayer.getId(), currentPlayerName: currentPlayer.getName() };

    room.players.forEach(player => {
      const playerData = room.game!.getPlayer(player.getId());
      
      player.getSocket()?.emit('sendHand', playerData?.getHand() || []);
      player.getSocket()?.emit('sendCardsOnPlay', room.game!.getCardsOnPlay());
      player.getSocket()?.emit('sendCurrentPlayer', currentPlayer.getName());
      player.getSocket()?.emit('sendCurrentTurn', currentPlayer.getId() === player.getId());
      player.getSocket()?.emit('sendGameState', {
        round: room.game!.getEvents().filter(e => e.type === 'roundFinished').length,
        consecutivePasses: room.game!.getConsecutivePasses(),
        revolutionActive: room.game!.isRevolutionActive(),
        tableCleared: room.game!.isTableCleared()
      });
    });

    this.sendPlayerList(roomId);
  }

  public playTurn(roomId: string, playerId: string, actionTurn: string, cardsPlayed: any[]): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.game) return;

    const player = room.players.find((p) => p.getId() === playerId);
    if (!player) return;

    if (actionTurn !== 'play' && actionTurn !== 'pass') return;

    let cardIndices: number[] = [];
    
    if (actionTurn === 'play' && cardsPlayed && cardsPlayed.length > 0) {
      const hand = player.getHand();
      cardsPlayed.forEach((cardPlayed: { rank: number; suit: string }) => {
        const index = hand.findIndex(
          card => card.getRank() === cardPlayed.rank && card.getSuit() === cardPlayed.suit
        );
        if (index !== -1) {
          cardIndices.push(index);
        }
      });
    }

    const { event, turnInfo } = room.game.playTurn(
      player, 
      actionTurn as 'play' | 'pass', 
      cardIndices
    );

    if (event) {
      this.sendHistoryMessage(roomId, event.message);
      
      if (event.type === "tableCleared") {
        room.players.forEach(p => p.getSocket()?.emit("tableCleared", { message: event.message }));
      }
      
      if (event.type === "gameFinished") {
        const ranking = room.game.getRankingPlayers().map(pl => ({
          position: room.game!.getRankingPlayers().indexOf(pl) + 1,
          name: pl.getName()
        }));
        room.players.forEach(p => {
          p.getSocket()?.emit("gameFinished", { message: event.message, ranking });
        });
      }
      
      if (event.type === "revolutionStarted") {
        room.players.forEach(p => p.getSocket()?.emit("revolutionStarted", { message: event.message }));
      }
    }

    this.sendGameState(roomId);
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public createPLayer(name: string, id: string, socket: Socket): void {
    console.log('CREATE PLAYER');
  }
}

export default RoomController;
