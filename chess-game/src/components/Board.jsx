import React from "react";
import Piece from "./Piece";

const Board = ({ gameState, onSquareClick, validMoves = [] }) => {
  function renderSquare(row, col) {
    const key = `${col}${row}`;
    const piece = gameState[key];

    const isValidMove =
      Array.isArray(validMoves) &&
      validMoves.some((move) => move.row === row && move.col === col);

    return (
      <div
        key={key}
        className={`w-16 h-16 flex justify-center items-center relative ${
          isValidMove ? "bg-green-400 bg-opacity-50 rounded-lg shadow-md" : ""
        }`}
        onClick={() => onSquareClick(row, col)}
      >
        {piece && <Piece type={piece} />}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-9 gap-1 p-2 w-fullbg-cover bg-center"
      style={{
        backgroundImage: `url("/assets/tables/table.png")`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {Array.from({ length: 10 }, (_, rowIndex) =>
        Array.from({ length: 9 }, (_, colIndex) =>
          renderSquare(rowIndex, colIndex)
        )
      )}
    </div>
  );
};

export default Board;
