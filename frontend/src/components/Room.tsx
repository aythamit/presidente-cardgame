import {useContext, useEffect, useState} from "react";
import { socket } from '../socket';
import { ConnectionState } from './ConnectionState';
import { ConnectionManager } from './ConnectionManager';
import { Events } from "./Events";
import '../css/Room.css'
import { useParams } from "react-router";
import UserContext from "../context/UserContext.tsx";

const RANK_DISPLAY: Record<number, string> = {
    3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
    8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 14: "A"
};

const SUIT_SYMBOLS: Record<string, string> = {
    "Treboles": "♣", "Diamantes": "♦", "Corazones": "♥", "Picas": "♠"
};

function Card(props: { cartasSeleccionadas: any[], card: any, onClick: () => void }) {
    const rankDisplay = RANK_DISPLAY[props.card.rank] || props.card.rank;
    const suitSymbol = SUIT_SYMBOLS[props.card.suit] || props.card.suit;
    
    return <div
        className={`carta ${props.cartasSeleccionadas.includes(props.card) ? "seleccionada" : ""}`}
        onClick={props.onClick}
    >
        <span className="valor">{rankDisplay}</span>
        <span className="palo">{suitSymbol}</span>
    </div>;
}

function CardList(props: { cardList: any[], selectedCards: any[], handleCartaClick?: (carta:object) => void }) {
    return <div className="baraja-container">
        {props.cardList.map((carta, index) => (
            <Card key={index} cartasSeleccionadas={props.selectedCards} card={carta}
                  onClick={(props.handleCartaClick) ? () => props.handleCartaClick(carta) : ()=>{} }/>
        ))}
    </div>;
}

function Room() {
    const [fooEvents, setFooEvents] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const { user, cambiarUser } = useContext(UserContext);

    const [playerList, setPlayerList] = useState([]);
    const [handList, setHandList] = useState([]);


    const [currentPlayer, setCurrentPlayer] = useState('');
    const [currentCardsOnPlay, setCurrentCardsOnPlay] = useState([]);
    const [history, setHistory] = useState([]);
    const [isMyTurn, setIsMyTurn] = useState(false);


    let { idRoom } = useParams();

    const [cartasSeleccionadas, setCartasSeleccionadas] = useState([]);

    const handleCartaClick = (carta) => {
        if (cartasSeleccionadas.includes(carta)) {
            setCartasSeleccionadas(cartasSeleccionadas.filter((c) => c !== carta));
        } else {
            setCartasSeleccionadas([...cartasSeleccionadas, carta]);
        }
    };

    function playTurn(action: string) {


        socket.emit('message', {
                action:"playTurn",
                // roomId: `${socket.id}${Math.random()}`,
                roomId: `${idRoom}`,
                playerId: `${user.id}`,
                actionTurn: action,
                cardsPlayed: cartasSeleccionadas,
                socketID: socket.id,
            }
        );
    }

    function joinRoom(roomId: string) {
        if (user!=null){
            console.log("join Room")
            console.log(socket)
            socket.emit('message', {
                    action:"joinRoom",
                    // roomId: `${socket.id}${Math.random()}`,
                    roomId: `${roomId}`,
                    playerId: user.id,
                    playerName: user.name,
                    socketID: socket.id,
                }
            );
        }
    }

    function initGame() {
        if (user!=null){
            console.log("join Room")
            console.log(socket)
            socket.emit('message', {
                    action:"initGame",
                    // roomId: `${socket.id}${Math.random()}`,
                    roomId: `${idRoom}`,
                    socketID: socket.id,
                }
            );
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

    useEffect(() => {

        let userStorage = JSON.parse(localStorage.getItem("user"));
        if(userStorage){
            cambiarUser(userStorage)
        }
        joinRoom(idRoom)
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
        function onSendPlayerList(value:any) {
            // @ts-ignore
            console.log(`Sending playerlist`);
            setPlayerList(value)
            console.log(value)
        }
        function onSendHand(value:any) {
            // @ts-ignore
            console.log(value)
            setHandList(value)
        }
        function onSendCurrentTurn(value:any) {
            // @ts-ignore
            console.log(`'onSendCurrentTurn`)
            console.log(value)
            setIsMyTurn(value)

        }
        function onSendCurrentPlayer(value:any) {
            // @ts-ignore
            console.log(`'onSendCurrentPlayer`)
            console.log(value)
            setCurrentPlayer(value)
        }
        function onSendCardsOnPlay(value:any) {
            // @ts-ignore
            console.log(`onSendCardsOnPlay`)
            console.log(value)
            setCurrentCardsOnPlay(value)
        }
        function onSendHistoryMessages(value:any) {
                    // @ts-ignore
            console.log(`onSendHistoryMessages`)
            console.log(value)
            // setHistory([...history, value]);
            history.push(value)
            console.log(history)
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('message', onMessage);
        socket.on('sendPlayerList', onSendPlayerList);
        socket.on('sendHand', onSendHand);
        socket.on('sendCurrentTurn', onSendCurrentTurn);
        socket.on('sendCurrentPlayer', onSendCurrentPlayer);
        socket.on('sendCardsOnPlay', onSendCardsOnPlay);
        socket.on('sendHistoryMessages', onSendHistoryMessages);
        socket.on('foo', onFooEvent);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('sendPlayerList', onSendPlayerList);
            socket.off('sendHand', onSendHand);
            socket.off('sendCurrentTurn', onSendCurrentTurn);
            socket.off('sendCurrentPlayer', onSendCurrentPlayer);
            socket.off('sendCardsOnPlay', onSendCardsOnPlay);
            socket.off('sendHistoryMessages', onSendHistoryMessages);

            socket.off('message', onMessage);
            socket.off('foo', onFooEvent);
        };
    }, []);

    return (
        <>
            <h1>Estoy en ROOM {idRoom}</h1>
            <h1>Actualmente eres {user != null ? user.name : 'Nadie'}</h1>
            <div style={{display: 'flex'}}>
                <div style={{margin: 10}}>
                    <h5>Usuarios conectados</h5>
                    <ul>
                        {
                            playerList.map((player, index) =>
                                <li key={ index }>{ player }</li>
                            )
                        }
                    </ul>
                </div>
                <div  style={{margin: 10}} >
                    <h5>Historial</h5>
                    {history.length > 0 ? (
                        history.map((message, index) =>
                            <p style={{fontSize: 8}} key={ index }>{ message }</p>
                        )
                    )  : (
                        <p></p>
                    )}

                </div>

            </div>
            <div>
                {isMyTurn ?
                    <p><b>Es tu turno</b></p> :
                    <p>Es turno de {currentPlayer}</p>}
            </div>

            <div>
                <h3>
                    Cartas en mesa
                </h3>
                <div>

                    {currentCardsOnPlay.length > 0 ? (
                            <CardList cardList={currentCardsOnPlay[currentCardsOnPlay.length-1].cardPlay} selectedCards={cartasSeleccionadas}/>
                    ) : (
                        <p>No hay cartas en juego.</p>
                    )}

                </div>
            </div>

            <h3>
                Mano
            </h3>

            <div>


                <CardList cardList={handList} handleCartaClick={handleCartaClick} selectedCards={cartasSeleccionadas}/>

                {/*<div className="baraja-container">*/}
                {/*    {handList.map((carta, index) => (*/}
                {/*        <Card key={index} cartasSeleccionadas={cartasSeleccionadas} searchElement={carta}*/}
                {/*              onClick={() => handleCartaClick(carta)}/>*/}
                {/*    ))}*/}
                {/*</div>*/}
            </div>
            <div>
                <button  onClick={() => initGame()}>
                    Init game
                </button>
            </div>

            {isMyTurn ?
                <div>
                    <button  onClick={() => playTurn('play')}>
                        Jugar
                    </button>

                    <button  onClick={() => playTurn('pass')}>
                        Pasar
                    </button>
                </div>
                : <></>
            }
        </>
    )
}

export default Room
