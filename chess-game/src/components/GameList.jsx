import React, { useEffect, useState } from "react";
import { getAllGames } from "./GameController";

const GameList = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      const data = await getAllGames();
      setGames(data);
    };
    fetchGames();
  }, []);

  return (
    <div>
      <h2>Danh sách các ván cờ</h2>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            ID: {game.id} - Trạng thái bàn cờ: {game.boardState}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameList;
