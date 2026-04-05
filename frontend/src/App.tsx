import { useState, useEffect, useContext } from 'react';
import { socket } from './socket';
import { ConnectionState } from './components/ConnectionState';
import { ConnectionManager } from './components/ConnectionManager';
import { Events } from "./components/Events";
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate } from "react-router";
import UserContext from "./context/UserContext.tsx";
import './App.css';

function App() {
  const [fooEvents, setFooEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [room, setRoom] = useState<string | null>(null);
  const [joinRoomId, setJoinRoomId] = useState('');
  const { user, cambiarUser } = useContext(UserContext);
  const navigate = useNavigate();

  function generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  function createRoom() {
    if (user != null) {
      const roomId = generateRandomString(5);
      setRoom(roomId);
      socket.emit('message', {
        action: "createRoom",
        roomId: roomId,
        socketID: socket.id,
      });
      navigate(`/room/${roomId}`);
    }
  }

  function joinRoom(roomId: string) {
    if (user != null && roomId) {
      const normalizedRoomId = roomId.toUpperCase();
      navigate(`/room/${normalizedRoomId}`);
    }
  }

  function setQuickUser(name: string) {
    const newUser = { name, id: uuidv4() };
    cambiarUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  }

  function recieveCreatePLayer(userData: any) {
    cambiarUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  useEffect(() => {
    const userStorage = JSON.parse(localStorage.getItem("user") || "null");
    if (userStorage) {
      cambiarUser(userStorage);
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', (value: any) => {
      setFooEvents((previous: any[]) => [...previous, value]);
      console.log(value);
    });
    socket.on('recieveCreatePLayer', recieveCreatePLayer);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', () => {});
      socket.off('recieveCreatePLayer', recieveCreatePLayer);
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🂡 El Presidente</h1>
        <ConnectionState isConnected={isConnected} />
      </header>

      {!user ? (
        <div className="user-setup">
          <h2>Introduce tu nombre</h2>
          <input
            type="text"
            placeholder="Tu nombre"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                setQuickUser(target.value);
              }
            }}
          />
          <button onClick={() => {
            const input = document.querySelector('input') as HTMLInputElement;
            if (input.value) setQuickUser(input.value);
          }}>
            Confirmar
          </button>
        </div>
      ) : (
        <main className="menu-container">
          <div className="user-info">
            <span>Jugador: <strong>{user.name}</strong></span>
            <button onClick={() => {
              cambiarUser(null);
              localStorage.removeItem("user");
            }}>Cambiar</button>
          </div>

          <h2>¿Qué quieres hacer?</h2>

          <div className="menu-buttons">
            <button className="menu-btn primary" onClick={createRoom}>
              <span className="btn-icon">🎮</span>
              <span className="btn-text">Crear Sala</span>
              <span className="btn-desc">Crea una sala privada para jugar con amigos</span>
            </button>

            <div className="join-section">
              <input
                type="text"
                placeholder="Código de sala"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                maxLength={5}
              />
              <button 
                className="menu-btn secondary" 
                onClick={() => joinRoom(joinRoomId)}
                disabled={!joinRoomId}
              >
                Unirse
              </button>
            </div>

            <button className="menu-btn" onClick={() => alert('IAcoming soon!')}>
              <span className="btn-icon">🤖</span>
              <span className="btn-text">Jugar vs IA</span>
              <span className="btn-desc">Juega contra la computadora</span>
            </button>

            <Link to="/rules" className="menu-btn">
              <span className="btn-icon">📖</span>
              <span className="btn-text">Reglas</span>
              <span className="btn-desc">Aprende a jugar al Presidente</span>
            </Link>

            <Link to="/settings" className="menu-btn">
              <span className="btn-icon">⚙️</span>
              <span className="btn-text">Ajustes</span>
              <span className="btn-desc">Configura las opciones del juego</span>
            </Link>
          </div>
        </main>
      )}

      <ConnectionManager />
      <Events events={fooEvents} />
    </div>
  );
}

export default App;
