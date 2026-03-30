import WebSocket from "ws";
import { Player } from "../domain/Player";
import {Socket} from "socket.io";
import {Game} from "../domain/Game";
import {InitGame} from "../use-case/InitGame";

interface Room {
  id: string;
  players: Player[];
  game: Game|null;
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
    console.log(`Sala ${roomId} creada.`);
  }

  public joinRoom(roomId: string, playerId: string, playerName: string, socket: Socket): void { // Usa Socket de socket.io
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`La sala ${roomId} no existe.`);
    }



    if (room.players.find((p) => p.getId() === playerId)) {
      socket.emit('message', `El jugador ${playerName} ya está en la sala ${roomId}.`);
      throw new Error(`El jugador ${playerId} ya está en la sala ${roomId}.`);
    }

    const newPlayer = new Player(playerName,playerId, socket); // Usa Socket de socket.io

    room.players.push(newPlayer);
    this.sendHistoryMessage(roomId, `Jugador ${playerName} se unió a la sala ${roomId}.`);


    // Enviar mensaje de bienvenida al jugador
    socket.emit('message', `Bienvenido a la sala ${roomId}`); // Usa emit de socket.io

    // Notificar a otros jugadores sobre la nueva conexión (opcional)

    this.sendPlayerList(roomId)
    // Manejar desconexiones
    socket.on('disconnect', () => { // Usa disconnect de socket.io
      this.leaveRoom(roomId, playerId);
    });

    // Manejar mensajes del jugador
    socket.on('message', (message: any) => { // Usa message de socket.io
      const data = message;
      if (data.action) {
        switch (data.action) {
          case 'sendMessage':
            console.log(`Mensaje de ${playerName} en la sala ${roomId}: ${JSON.stringify(data.message)}`);
            // Lógica para retransmitir mensajes a otros jugadores en la sala
            room.players.forEach((player) => {
              if (player.getId() !== playerId) {
                player.getSocket()?.emit('message', `${playerName}: ${data.message}`); // Usa emit de socket.io
              }
            });
            break;
        }
      }

    });
  }

  public leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    room.players = room.players.filter((p) => p.getId() !== playerId);
    console.log(`Jugador ${playerId} abandonó la sala ${roomId}.`);

    // Notificar a otros jugadores sobre la desconexión (opcional)
    room.players.forEach((player) => {
      player.getSocket()?.emit('message', `${playerId} ha abandonado la sala.`); // Usa emit de socket.io
    });

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      console.log(`Sala ${roomId} eliminada.`);
    }
  }

  public sendPlayerList(roomId: string): void {
    let players: string[] = [];
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`sendPlayerList: La sala ${roomId} no existe.`);
    }
    console.log('SEND PLAYER LIST')
    room.players.forEach((player) => {
      players.push(player.getName());
    });

    room.players.forEach((player) => {
        player.getSocket()?.emit('sendPlayerList', players); // Usa emit de socket.io
    });
  }

  public sendHistoryMessage(roomId: string, message:string): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`sendHistoryMessage: La sala ${roomId} no existe.`);
    }
    room.players.forEach((player) => {
      player.getSocket()?.emit('sendHistoryMessages', message); // Usa emit de socket.io
    });
  }

  public createPLayer(name: string, id:string, socket: Socket) : void {
    let newPlayer = new Player(name, id, socket)
    console.log('CREATE PLAYER')
    const playerData = {
      name: newPlayer.getName(),
      id: newPlayer.getId(),
    };
    socket.emit('recieveCreatePLayer', playerData);
    // newPlayer.getSocket()?.send(newPlayer); // Usa emit de socket.io
  }

  public initGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`sendPlayerList: La sala ${roomId} no existe.`);
    }

    room.game = new InitGame().execute(room.players, room.id)
    if(!room.game) {
      throw new Error(`game no iniciado`);
    }

      room.players.forEach((player) => {
        if(room.game) {
          let actualPlayer = room.game.getPlayer(player.getId())
          if (actualPlayer) {
            player.getSocket()?.emit('sendHand', actualPlayer.getHand()); // Usa emit de socket.io
          }
        }
      });

      room.game.initRound()
      room.players.forEach((player) => {

        let actualPlayer = room.game?.getCurrentPlayer()
        if (actualPlayer?.getId() == player.getId()) {
          console.log('sendCurrentTurn')
          player.getSocket()?.emit('sendCurrentTurn', true); // Usa emit de socket.io
        }
        console.log(`sendCurrentPlayer ${room.game?.getCurrentPlayer().getName()}`)

        player.getSocket()?.emit('sendCurrentPlayer', room.game?.getCurrentPlayer().getName()); // Usa emit de socket.io

      })
  }

  public playTurn(roomId: string, playerId: string, actionTurn:any, cardsPlayed:any) : void {

    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`sendPlayerList: La sala ${roomId} no existe.`);
    }

    const player = room.players.find((p) => p.getId() === playerId);

    if (player && room.game) {
      const arrayIndexCards: number[] = [];
      
      cardsPlayed.forEach((cardPlayed: { rank: number; suit: string }) => {
        player.getHand().forEach((cardHand, index) => {
          if (cardPlayed.rank === cardHand.getRank() && cardPlayed.suit === cardHand.getSuit()) {
            console.log(cardHand, index);
            arrayIndexCards.push(index);
          }
        });
      });

      const event = room.game.playTurn(player, actionTurn, arrayIndexCards);

      if (event) {
        this.sendHistoryMessage(roomId, event.message);
        
        if (event.type === "tableCleared") {
          room.players.forEach(p => {
            p.getSocket()?.emit("tableCleared", { message: event.message });
          });
        }
        
        if (event.type === "gameFinished" && room.game) {
          const game = room.game;
          const ranking = game.getRankingPlayers().map(pl => pl.getName());
          room.players.forEach(p => {
            p.getSocket()?.emit("gameFinished", { 
              message: event.message,
              ranking
            });
          });
        }
      } else {
        this.sendHistoryMessage(roomId, `${player.getName()} ha realizado la siguiente acción: ${actionTurn === "pass" ? "Pasó" : "Jugó carta"}`);
      }

      room.players.forEach((p) => {
        const actualPlayer = room.game?.getCurrentPlayer();
        if (actualPlayer?.getId() === p.getId()) {
          console.log("sendCurrentTurn");
          p.getSocket()?.emit("sendCurrentTurn", true);
        } else {
          p.getSocket()?.emit("sendCurrentTurn", false);
        }
        console.log(`sendCurrentPlayer ${room.game?.getCurrentPlayer().getName()}`);
        p.getSocket()?.emit("sendCurrentPlayer", room.game?.getCurrentPlayer().getName());
        console.log(`sendCardsOnPlay`);
        console.log(room.game?.getCardsOnPlay());
        console.log(p.getName());
        p.getSocket()?.emit("sendCardsOnPlay", room.game?.getCardsOnPlay());
        p.getSocket()?.emit("sendHand", room.game?.getPlayer(p.getId())?.getHand());
      });
    }
  }
}

export default RoomController;
