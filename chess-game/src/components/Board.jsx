import React from "react";
import Piece from "./Piece";

const boardImage = "/assets/tables/table.png";

const Board = ({ onPieceClick, gameState }) => {
  const renderSquare = (row, col) => {
    const key = `${col}${row}`;
    const piece = gameState[key];

    return (
      <div
        key={key}
        className="w-15 h-14 flex justify-center items-center"
        onClick={() => onPieceClick({ row, col })}
      >
        {piece && (
          <Piece type={piece} position={{ row, col }} onClick={onPieceClick} />
        )}
      </div>
    );
  };

  return (
    <div
      className="grid grid-cols-9 gap-1 p-2 w-fullbg-cover bg-cente"
      style={{
        backgroundImage: `url(${boardImage})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        // aspectRatio: "9 / 10",
        // height: "auto",
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
