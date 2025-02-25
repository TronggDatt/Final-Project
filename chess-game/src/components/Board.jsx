import React, { useState } from "react";
import Piece from "./Piece";
// import boardImage from "../public/assets/tables/table.png";

const Board = ({ gameState, setGameState, getValidMoves, onPieceClick }) => {
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  const handlePieceClick = (row, col) => {
    const key = `${col}${row}`;
    const piece = gameState[key];

    if (piece) {
      // Nếu có quân cờ -> chọn nó & lấy nước đi hợp lệ
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves({ row, col })); // Gọi hàm tính nước đi hợp lệ
    } else if (selectedPiece) {
      const moveAllowed = validMoves.some(
        (move) => move.row === row && move.col === col
      );

      if (moveAllowed) {
        const newGameState = { ...gameState };
        const prevKey = `${selectedPiece.col}${selectedPiece.row}`;
        delete newGameState[prevKey]; // Xóa quân cũ
        newGameState[`${col}${row}`] = gameState[prevKey]; // Cập nhật quân cờ

        setGameState(newGameState);
        setSelectedPiece(null);
        setValidMoves([]);
      }
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
        className={`w-15 h-14 flex justify-center items-center ${
          isValidMove ? "bg-yellow-300" : ""
        }`}
        onClick={() => handlePieceClick(row, col)} // Cập nhật gọi đúng
      >
        {piece && (
          <Piece
            type={piece}
            position={{ row, col }}
            onClick={handlePieceClick}
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
