import { useEffect, useState, useContext, useRef } from "react";
import { socket } from '../socket';
import { Link } from "react-router";
import UserContext from "../context/UserContext.tsx";
import '../css/Room.css';

import espadasIcon from '../assets/espadas.png';
import bastosIcon from '../assets/bastos.png';
import copasIcon from '../assets/copas.png';
import orosIcon from '../assets/oros.png';

const RANK_DISPLAY: Record<number, string> = {
    1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
    10: "10", 11: "11", 12: "12"
};

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
    "Espadas": { symbol: espadasIcon, color: "black" },
    "Bastos": { symbol: bastosIcon, color: "black" },
    "Oros": { symbol: orosIcon, color: "black" },
    "Copas": { symbol: copasIcon, color: "black" }
};

interface PlayerInfo {
    id: string;
    name: string;
    handLength: number;
}

interface CardData {
    rank: number;
    suit: string;
}

interface GameState {
    round: number;
    consecutivePasses: number;
    revolutionActive: boolean;
    tableCleared: boolean;
}

const SUIT_ORDER: Record<string, number> = {
    "Oros": 0,
    "Copas": 1,
    "Espadas": 2,
    "Bastos": 3,
};

function DraggableCard({ 
    card, 
    onClick, 
    selected, 
    disabled,
    onDragStart,
    index,
    draggingIndex
}: { 
    card: CardData; 
    onClick?: () => void; 
    selected?: boolean;
    disabled?: boolean;
    onDragStart?: (index: number) => void;
    index?: number;
    draggingIndex?: number | null;
}) {
    const suitInfo = SUIT_SYMBOLS[card.suit] || { symbol: '', color: "black" };
    const rankDisplay = RANK_DISPLAY[card.rank] || card.rank;
    const isDragging = draggingIndex === index;
    
    return (
        <div 
            className={`card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
            onClick={disabled ? undefined : onClick}
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index?.toString() || '0');
                onDragStart?.(index || 0);
            }}
            draggable={!disabled}
        >
            <div className="card-corner top-left">
                <span className="card-rank">{rankDisplay}</span>
            </div>
            <div className="card-center">
                <img src={suitInfo.symbol} alt={card.suit} className="card-suit-large" />
            </div>
            <div className="card-corner bottom-right">
                <span className="card-rank">{rankDisplay}</span>
            </div>
        </div>
    );
}

function Card({ card }: { card: CardData }) {
    const suitInfo = SUIT_SYMBOLS[card.suit] || { symbol: '', color: "black" };
    const rankDisplay = RANK_DISPLAY[card.rank] || card.rank;
    
    return (
        <div className="card">
            <div className="card-corner top-left">
                <span className="card-rank">{rankDisplay}</span>
            </div>
            <div className="card-center">
                <img src={suitInfo.symbol} alt={card.suit} className="card-suit-large" />
            </div>
            <div className="card-corner bottom-right">
                <span className="card-rank">{rankDisplay}</span>
            </div>
        </div>
    );
}

// Game rank order: 2 (highest), 1, 12, 11, 10, 7, 6, 5, 4, 3 (lowest)
const RANK_GAME_ORDER: Record<number, number> = {
    2: 10,   // highest
    1: 9,    // second highest
    12: 8,
    11: 7,
    10: 6,
    7: 5,
    6: 4,
    5: 3,
    4: 2,
    3: 1    // lowest
};

function sortHandByRank(cards: CardData[]): CardData[] {
    return [...cards].sort((a, b) => {
        // First sort by game rank (2 highest, 3 lowest)
        const rankDiff = (RANK_GAME_ORDER[a.rank] || 0) - (RANK_GAME_ORDER[b.rank] || 0);
        if (rankDiff !== 0) return rankDiff;
        // Then by suit order if same rank
        return (SUIT_ORDER[a.suit] || 0) - (SUIT_ORDER[b.suit] || 0);
    });
}

function Room() {
    const { user, cambiarUser } = useContext(UserContext);
    const { idRoom } = useParams<{ idRoom: string }>();
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [hand, setHand] = useState<CardData[]>([]);
    const [currentPlayerName, setCurrentPlayerName] = useState('');
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [cardsOnPlay, setCardsOnPlay] = useState<CardData[]>([]);
    const [lastPlayType, setLastPlayType] = useState<'play' | 'pass' | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [selectedCards, setSelectedCards] = useState<CardData[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameFinished, setGameFinished] = useState(false);
    const [ranking, setRanking] = useState<{ position: number; name: string }[]>([]);
    const historyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userStorage = localStorage.getItem("user");
        const parsedUser = userStorage ? JSON.parse(userStorage) as { id: string; name: string } : null;
        if (parsedUser && !user) {
            cambiarUser(parsedUser);
        }
        
        if (user && idRoom) {
            socket.emit('message', {
                action: "joinRoom",
                roomId: idRoom.toUpperCase(),
                playerId: user.id,
                playerName: user.name,
            });
        }

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onSendPlayerList(value: PlayerInfo[]) {
            setPlayers(value);
        }

        function onSendHand(value: CardData[]) {
            if (!value || value.length === 0) {
                setHand([]);
                setSelectedCards([]);
                return;
            }
            
            // Always sort incoming hand to maintain order
            // This preserves sorted order after playing cards
            const sortedHand = sortHandByRank(value);
            setHand(sortedHand);
            setSelectedCards([]);
        }

        function onSendCurrentTurn(value: boolean) {
            setIsMyTurn(value);
        }

        function onSendCurrentPlayer(value: string) {
            setCurrentPlayerName(value);
        }

        function onSendCardsOnPlay(value: any[]) {
            if (value && value.length > 0) {
                const lastPlay = value[value.length - 1];
                setCardsOnPlay(lastPlay.cardPlay || []);
                setLastPlayType(lastPlay.playType === 'play' ? 'play' : 'pass');
            } else {
                setCardsOnPlay([]);
                setLastPlayType(null);
            }
        }

        function onSendHistoryMessages(value: string) {
            setHistory(prev => [...prev.slice(-50), value]);
        }

        function onSendGameState(value: GameState) {
            setGameState(value);
            setGameStarted(true);
        }

        function onTableCleared() {
            setCardsOnPlay([]);
            setLastPlayType(null);
        }

        function onGameFinished(data: { message: string; ranking: { position: number; name: string }[] }) {
            setGameFinished(true);
            setRanking(data.ranking);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('sendPlayerList', onSendPlayerList);
        socket.on('sendHand', onSendHand);
        socket.on('sendCurrentTurn', onSendCurrentTurn);
        socket.on('sendCurrentPlayer', onSendCurrentPlayer);
        socket.on('sendCardsOnPlay', onSendCardsOnPlay);
        socket.on('sendHistoryMessages', onSendHistoryMessages);
        socket.on('sendGameState', onSendGameState);
        socket.on('tableCleared', onTableCleared);
        socket.on('gameFinished', onGameFinished);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('sendPlayerList', onSendPlayerList);
            socket.off('sendHand', onSendHand);
            socket.off('sendCurrentTurn', onSendCurrentTurn);
            socket.off('sendCurrentPlayer', onSendCurrentPlayer);
            socket.off('sendCardsOnPlay', onSendCardsOnPlay);
            socket.off('sendHistoryMessages', onSendHistoryMessages);
            socket.off('sendGameState', onSendGameState);
            socket.off('tableCleared', onTableCleared);
            socket.off('gameFinished', onGameFinished);
        };
    }, [user, idRoom]);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [history]);

    const handleCardClick = (card: CardData) => {
        if (!isMyTurn) return;
        
        if (selectedCards.find(c => c.rank === card.rank && c.suit === card.suit)) {
            setSelectedCards(selectedCards.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
        } else {
            const sameRankSelected = selectedCards.filter(c => c.rank === card.rank);
            if (sameRankSelected.length === 0 || sameRankSelected.length < 4) {
                if (sameRankSelected.length < 4) {
                    setSelectedCards([...selectedCards, card]);
                }
            }
        }
    };

    const handleDragStart = (index: number) => {
        setDraggingIndex(index);
    };

    const handleSortHand = () => {
        setHand(sortHandByRank(hand));
    };

    const playTurn = (action: 'play' | 'pass') => {
        if (!user || !idRoom) return;
        
        if (action === 'play' && selectedCards.length === 0) {
            return;
        }

        socket.emit('message', {
            action: "playTurn",
            roomId: idRoom.toUpperCase(),
            playerId: user.id,
            actionTurn: action,
            cardsPlayed: selectedCards,
        });

        setSelectedCards([]);
    };

    const initGame = () => {
        if (!idRoom) return;
        
        socket.emit('message', {
            action: "initGame",
            roomId: idRoom.toUpperCase(),
        });
    };

    return (
        <div className="room-container">
            <header className="room-header">
                <Link to="/" className="back-btn">← Salir</Link>
                <div className="room-info">
                    <h1>Sala {idRoom}</h1>
                    <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? '●' : '○'}
                    </span>
                </div>
                <div className="user-badge">
                    {user?.name}
                </div>
            </header>

            {gameFinished ? (
                <div className="game-finished">
                    <h2>🏆 ¡Partida Terminada!</h2>
                    <div className="ranking">
                        {ranking.map((entry) => (
                            <div key={entry.position} className={`ranking-item rank-${entry.position}`}>
                                <span className="position">#{entry.position}</span>
                                <span className="name">{entry.name}</span>
                                <span className="role">
                                    {entry.position === 1 && '🥇 Presidente'}
                                    {entry.position === 2 && '🥈 Vicepresidente'}
                                    {entry.position === ranking.length && '💩 Escoria'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => window.location.reload()} className="restart-btn">
                        Nueva Partida
                    </button>
                </div>
            ) : (
                <main className="room-main">
                    <div className="players-bar">
                        {players.map((player) => (
                            <div 
                                key={player.id} 
                                className={`player-chip ${player.name === currentPlayerName ? 'active-turn' : ''}`}
                            >
                                <span className="player-name">{player.name}</span>
                                <span className="card-count">{player.handLength}</span>
                            </div>
                        ))}
                    </div>

                    <div className="game-table">
                        <div className="turn-indicator">
                            {isMyTurn ? (
                                <span className="your-turn">¡Es tu turno!</span>
                            ) : (
                                <span className="waiting">Turno de {currentPlayerName}</span>
                            )}
                            {gameState?.revolutionActive && (
                                <span className="revolution-badge">¡REVOLUCIÓN!</span>
                            )}
                            {gameState?.round && (
                                <span className="round-badge">Ronda {gameState.round}</span>
                            )}
                        </div>

                        <div className="table-center">
                            <div className="cards-on-table">
                                {cardsOnPlay.length > 0 ? (
                                    cardsOnPlay.map((card, index) => (
                                        <Card key={index} card={card} />
                                    ))
                                ) : (
                                    <div className="empty-table">
                                        <span>Mesa vacía</span>
                                    </div>
                                )}
                            </div>
                            {lastPlayType === 'pass' && cardsOnPlay.length === 0 && (
                                <div className="pass-indicator">PASÓ</div>
                            )}
                        </div>

                        <div className="history-container" ref={historyRef}>
                            {history.slice(-10).map((msg, index) => (
                                <div key={index} className="history-message">{msg}</div>
                            ))}
                        </div>
                    </div>

                    <div className="player-hand">
                        <div className="player-hand-header">
                            <h3>Tu mano ({hand.length} cartas)</h3>
                            <button className="sort-btn" onClick={handleSortHand}>
                                Ordenar
                            </button>
                        </div>
                        <div className="hand-cards">
                            {hand.map((card, index) => (
                                <DraggableCard
                                    key={index}
                                    card={card}
                                    onClick={() => handleCardClick(card)}
                                    selected={selectedCards.some(c => c.rank === card.rank && c.suit === card.suit)}
                                    disabled={!isMyTurn}
                                    onDragStart={handleDragStart}
                                    index={index}
                                    draggingIndex={draggingIndex}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="action-bar">
                        {selectedCards.length > 0 && (
                            <span className="selection-info">
                                {selectedCards.length} carta{selectedCards.length > 1 ? 's' : ''} seleccionada{selectedCards.length > 1 ? 's' : ''}
                            </span>
                        )}
                        
                        {isMyTurn && gameStarted ? (
                            <>
                                <button 
                                    className="action-btn play-btn"
                                    onClick={() => playTurn('play')}
                                    disabled={selectedCards.length === 0}
                                >
                                    Jugar
                                </button>
                                <button 
                                    className="action-btn pass-btn"
                                    onClick={() => playTurn('pass')}
                                >
                                    Pasar
                                </button>
                            </>
                        ) : !gameStarted ? (
                            <button 
                                className="action-btn start-btn"
                                onClick={initGame}
                                disabled={players.length < 2}
                            >
                                Iniciar Partida {players.length < 2 && `(${players.length}/2 jugadores)`}
                            </button>
                        ) : (
                            <span className="waiting-action">Esperando a {currentPlayerName}...</span>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
}

import { useParams } from "react-router";

export default Room;
