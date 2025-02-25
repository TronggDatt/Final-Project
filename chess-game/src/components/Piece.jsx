// src/components/Piece.jsx
import React from "react";

const Piece = ({ type, position, onClick }) => {
  return (
    <div
      className="w-14 h-14 flex justify-center items-center cursor-pointer"
      onClick={() => onClick(position)} // Gửi vị trí quân cờ khi click
    >
      <img
        src={`../assets/pieces/${type}.png`}
        alt={type}
        className="w-full h-full object-contain"
        onClick={() => onClick(position.row, position.col)} // ✅ Truyền đúng row, col
      />
    </div>
  );
};

export default Piece;
