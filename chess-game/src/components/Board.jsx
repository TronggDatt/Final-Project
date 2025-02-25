import React, { useState } from "react";
import Piece from "./Piece";
// import boardImage from "../public/assets/tables/table.png";

const Board = ({ gameState, setGameState, getValidMoves }) => {
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  const handlePieceClick = (row, col) => {
    const key = `${col}${row}`;
    const piece = gameState[key];

    if (selectedPiece) {
      const moveAllowed = validMoves.some(
        (move) => move.row === row && move.col === col
      );

      if (moveAllowed) {
        const prevKey = `${selectedPiece.col}${selectedPiece.row}`;
        const newKey = `${col}${row}`;
        const movingPiece = gameState[prevKey];

        if (!movingPiece) return;

        const newGameState = { ...gameState };

        if (newGameState[newKey]) {
          const capturedPiece = newGameState[newKey];

          // 🔥 Kiểm tra nếu quân bị ăn là quân đối phương
          if (capturedPiece.color !== movingPiece.color) {
            delete newGameState[newKey]; // Xóa quân đối phương
          } else {
            console.log("Cannot capture same color piece!");
            return;
          }
        }

        // 🔥 Cập nhật đúng cách để React re-render
        const updatedGameState = { ...newGameState };
        updatedGameState[newKey] = movingPiece;
        delete updatedGameState[prevKey];

        setGameState(updatedGameState); // 🚀 Cập nhật state mới

        setSelectedPiece(null);
        setValidMoves([]);
      }
    } else if (piece) {
      const valid = getValidMoves({ row, col });

      if (!Array.isArray(valid)) {
        return;
      }
      setSelectedPiece({ row, col, piece });
      setValidMoves(valid);
    }
  };

  function renderSquare(row, col) {
    const key = `${col}${row}`;
    const piece = gameState[key];
    const isValidMove = validMoves.some(
      (move) => move.row === row && move.col === col
    );

    return (
      <div
        key={key}
        className={`w-16 h-16 flex justify-center items-center ${
          isValidMove ? "bg-yellow-300" : ""
        }`}
        onClick={() => handlePieceClick(row, col)} // Cập nhật gọi đúng
      >
        {piece && (
          <Piece
            type={piece}
            position={{ row, col }}
            onClick={() => handlePieceClick(row, col)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-9 gap-1 p-2 w-fullbg-cover bg-cente"
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
