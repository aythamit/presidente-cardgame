import WebSocket from "ws";
import RoomController from "./src/infrastructure/RoomController";

const http = require('http');
import {Server} from "socket.io";

const server = http.createServer(() => {
  // ... (tu lógica para otras rutas si las tienes)
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  // ... (tu lógica de sockets)

  socket.on('message', (message) => {
    console.log('entra mensaje', message);
    try {
      const data = message;

      if (data.action) {
        switch (data.action) {
          case 'createRoom':
            roomController.createRoom(data.roomId);
            break;
          case 'joinRoom':
            console.log('llama controlador');
            roomController.joinRoom(data.roomId, data.playerId, data.playerName, socket);
            break;
            case 'createPLayer':
            console.log('llama controlador');
            roomController.createPLayer(data.playerId, data.playerName, socket);
            break;

            case 'initGame':
            console.log('llama controlador initGame');
            roomController.initGame(data.roomId);
            break;
            case 'playTurn':
            console.log('llama controlador playTurn');
            roomController.playTurn(data.roomId, data.playerId, data.actionTurn, data.cardsPlayed);
            break;
          default:
            console.log('Acción desconocida:', data.action);
        }
      } else {
        console.log('Mensaje sin acción:', message);
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
    }
  });
});

server.listen(8081, () => {
  console.log('listening on *:8081');
});


const wss = new WebSocket.Server({
  port: 8080,

  verifyClient: (info, cb) => {
    const origin = info.origin; // Origen de la solicitud

    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:5173'
    ];

    if (allowedOrigins.includes(origin)) {
      cb(true); // Permite la conexión si el origen está permitido
    } else {
      cb(false, 403, 'Forbidden'); // Rechaza la conexión si el origen no está permitido
    }
  }

});

const roomController = new RoomController();


console.log("Servidor WebSocket iniciado en el puerto 8080");


// let initGame = new InitGame();
// let player1 = new Player("Aythami");
// let player2 = new Player("Molo");
// let player3 = new Player("Jose");
// let players = [player1, player2, player3];
// let game = initGame.execute(players, 1);

// game.initRound();

// Pasamos una ronda y saca player3
// game.playTurn(player1, "play", [0 , 9]);
// game.playTurn(player2, "play", [0 , 9]);
// game.playTurn(player3, "play", [0 , 9]);
//
// game.playTurn(player1, "pass", []);
// game.playTurn(player2, "pass", []);

// Player1 termina primero
// game.playTurn(player1, "play", [0]);
// game.playTurn(player2, "pass", []);
// game.playTurn(player3, "pass", []);
// game.playTurn(player1, "play", [0]);
// game.playTurn(player2, "pass", []);
// game.playTurn(player3, "pass", []);
// game.playTurn(player1, "play", [0]);
// game.playTurn(player2, "pass", []);
// game.playTurn(player3, "pass", []);
// game.playTurn(player1, "play", [0]);
// game.playTurn(player2, "pass", []);
// game.playTurn(player3, "pass", []);
//
// game.playTurn(player2, "play", [0]);
// game.playTurn(player3, "pass", []);
// game.playTurn(player2, "play", [0]);
// game.playTurn(player3, "pass", []);
// game.playTurn(player2, "play", [0]);
// game.playTurn(player3, "pass", []);

// game.printRankingPlayers()
// game.playTurn(player2, "play", [0]);
// game.playTurn(player3, "play", [0]);
// game.playTurn(player1, "pass", []);
// game.playTurn(player2, "pass", []);
//
// game.playTurn(player3, "play", [0, 8]);
// game.playTurn(player1, "play", [0, 8]);
// game.playTurn(player2, "play", [0, 8]);
// game.playTurn(player1, "pass", []);
// game.playTurn(player2, "pass", []);
//
// game.playTurn(player1, "play", [0, 6]);
// game.playTurn(player2, "play", [0, 7]);
// game.playTurn(player3, "play", [0, 7]);
// game.playTurn(player1, "pass", []);
// game.playTurn(player2, "pass", []);

//while(noAcabeLaPartida)
//InitRonda
//while(noAcabelaRonda)
//TurnoJugadorX

// Importa tu RoomController
