import {useState, useEffect, useContext} from 'react'
import { socket } from './socket';


import { ConnectionState } from './components/ConnectionState';
import { ConnectionManager } from './components/ConnectionManager';
import { Events } from "./components/Events";
import { v4 as uuidv4 } from 'uuid';
import './App.css'
import {Link, useNavigate} from "react-router";
import UserContext from "./context/UserContext.tsx";

function App() {
  const [fooEvents, setFooEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  // const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const { user, cambiarUser } = useContext(UserContext);


    function createRoom() {
        // @ts-ignore
        if (user!=null){
            console.log("Create Room")
            console.log(socket)
            const roomId = generateRandomString(5)


            // @ts-ignore
            setRoom(roomId)
            socket.emit('message', {
                    action:"createRoom",
                    // roomId: `${socket.id}${Math.random()}`,
                    roomId: roomId,
                    socketID: socket.id,
                }
            );

            const navigate = useNavigate();
            const goToLoginPage = () => navigate(`/room/${roomId}`);
        }


    }

    function joinRoom(roomId: string) {
        // @ts-ignore
        if (user!=null){
            console.log("join Room")

        }

    }

    function generateRandomString(length:number) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    function callSetUser(user){
        console.log('LLAMADA CALL SET USER')
        let x = socket.emit('message', {
                action:"createPLayer",
                // roomId: `${socket.id}${Math.random()}`,
                playerId: user.name,
                playerName: user.id,
                socketID: socket.id,
            }
        );
        console.log(x);
    }

    function recieveCreatePLayer(user:any) {
        // @ts-ignore
        cambiarUser(user)
        localStorage.setItem("user", JSON.stringify(user))
    }

    useEffect(() => {

        let userStorage = JSON.parse(localStorage.getItem("user"));
        if(userStorage){
            cambiarUser(userStorage)
        }

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onFooEvent(value:any) {
            // @ts-ignore
            setFooEvents(previous => [...previous, value]);
        }
        function onMessage(value:any) {
            // @ts-ignore
            setFooEvents(previous => [...previous, value]);
            console.log(value)
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('message', onMessage);
        socket.on('foo', onFooEvent);
        socket.on('recieveCreatePLayer', recieveCreatePLayer);


        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('message', onMessage);
            socket.off('foo', onFooEvent);
            socket.off('recieveCreatePLayer', recieveCreatePLayer);

        };
    }, []);

  return (
    <>

        <h1>Actualmente eres {user != null ? user.name : 'Nadie'}</h1>
        <h2>{room != null ? `Estas en la sala ${room}` : 'Aun no estas en ninguna sala'}</h2>

        <ConnectionState isConnected={ isConnected } />
        <Events events={ fooEvents } />
        <ConnectionManager />



        <div>

            <button  onClick={() => callSetUser({name:'Aythami', id:uuidv4()})}>
                Ser aythami
            </button>
            <button  onClick={() => callSetUser({name:'Molo', id:uuidv4()})}>
                Ser molo
            </button>
        </div>

    <button  onClick={() => createRoom()}>
        create room
    </button>

        <div>
            <label htmlFor="location">
                Introduce el id de la sala:
                <input
                    type="text"
                    id="location"
                    value={room}
                    placeholder="Location"
                    onChange={(e)=>setRoom(e.target.value)}
                />

            </label>

            <Link to={{pathname: `/room/${room}` }}>Join room</Link>
        </div>




    </>
  )
}

export default App
