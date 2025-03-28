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
        className={`w-[10vw] h-[10vw] max-w-16 max-h-16 flex justify-center items-center relative ${
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
      className="w-full max-w-[90vw] aspect-[9/10] mx-auto bg-cover bg-center"
      style={{
        backgroundImage: `url("/assets/tables/table.png")`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="grid grid-cols-9 grid-rows-10 w-full h-full gap-1">
        {Array.from({ length: 10 }, (_, rowIndex) =>
          Array.from({ length: 9 }, (_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="relative w-full h-full"
            >
              {renderSquare(rowIndex, colIndex)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
