import React, { useState, useEffect } from "react";
import {
  connectWebSocket,
  sendMove,
  disconnectWebSocket,
} from "../WebSocket Service/websocket.jsx";

const GameRoom = ({ roomId }) => {
  const [moves, setMoves] = useState([]);
  const [playerMove, setPlayerMove] = useState("");

  useEffect(() => {
    connectWebSocket(roomId, (newMove) => {
      setMoves((prevMoves) => [...prevMoves, newMove]);
    });

    return () => disconnectWebSocket();
  }, [roomId]);

  const handleSendMove = () => {
    if (playerMove.trim()) {
      sendMove(roomId, { player: "Player", move: playerMove });
      setPlayerMove("");
    }
  };

  return (
    <div>
      <h2>Game Room: {roomId}</h2>
      <input
        type="text"
        value={playerMove}
        onChange={(e) => setPlayerMove(e.target.value)}
        placeholder="Enter move..."
      />
      <button onClick={handleSendMove}>Send Move</button>

      <h3>Moves:</h3>
      <ul>
        {moves.map((m, index) => (
          <li key={index}>
            {m.player}: {m.move}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameRoom;
