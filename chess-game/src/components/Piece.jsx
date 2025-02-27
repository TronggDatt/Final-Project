// src/components/Piece.jsx
import React from "react";

const Piece = ({ type }) => {
  return (
    <img
      src={`/assets/pieces/${type}.png`} // Sử dụng đường dẫn tuyệt đối
      alt={type}
      className="w-full h-full object-contain"
    />
  );
};

export default Piece;
