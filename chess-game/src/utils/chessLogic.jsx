// utils/chessLogic.js

export const PIECES = {
  xe: "Rook",
  ma: "Knight",
  tinh: "Elephant",
  sy: "Advisor",
  tuong: "King",
  phao: "Cannon",
  tot: "Pawn",
};

export const COLORS = {
  r: "red",
  b: "black",
};

// Kiểm tra xem nước đi có hợp lệ không
export const isValidMove = (board, from, to, piece) => {
  const { row: fromRow, col: fromCol } = from;
  const { row: toRow, col: toCol } = to;
  const type = piece.slice(0, -2);
  const color = piece.slice(-1);

  switch (type) {
    case "xe": // Xe (Rook) đi ngang hoặc dọc không bị cản
      return fromRow === toRow || fromCol === toCol;
    case "ma": // Mã (Knight) đi hình chữ L, không bị cản
      return (
        (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
        (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2)
      );
    case "tinh": // Tượng (Elephant) chỉ đi chéo 2 ô
      return (
        Math.abs(fromRow - toRow) === 2 &&
        Math.abs(fromCol - toCol) === 2 &&
        ((color === "r" && toRow <= 4) || (color === "b" && toRow >= 5))
      );
    case "sy": // Sĩ (Advisor) đi chéo 1 ô, trong cung
      return (
        Math.abs(fromRow - toRow) === 1 &&
        Math.abs(fromCol - toCol) === 1 &&
        ((color === "r" && toRow >= 7 && toCol >= 3 && toCol <= 5) ||
          (color === "b" && toRow <= 2 && toCol >= 3 && toCol <= 5))
      );
    case "tuong": // Tướng (King) đi 1 ô trong cung
      return (
        Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1 &&
        ((color === "r" && toRow >= 7 && toCol >= 3 && toCol <= 5) ||
          (color === "b" && toRow <= 2 && toCol >= 3 && toCol <= 5))
      );
    case "phao": // Pháo (Cannon) đi như Xe nhưng phải nhảy nếu ăn
      return fromRow === toRow || fromCol === toCol; // (Chưa kiểm tra nhảy)
    case "tot": // Tốt (Pawn) tiến 1 ô, nếu qua sông có thể đi ngang
      if (color === "r")
        return toRow - fromRow === 1 || (fromRow > 4 && fromCol !== toCol);
      return fromRow - toRow === 1 || (fromRow < 5 && fromCol !== toCol);
    default:
      return false;
  }
};

// Kiểm tra chiếu tướng
export const isCheck = (board, color) => {
  const kingPosition = findKing(board, color);
  return board.some((row, rowIndex) =>
    row.some(
      (piece, colIndex) =>
        piece &&
        piece.slice(-1) !== color &&
        isValidMove(
          board,
          { row: rowIndex, col: colIndex },
          kingPosition,
          piece
        )
    )
  );
};

// Tìm vị trí của tướng trên bàn cờ
const findKing = (board, color) => {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === `tuong_${color}`) return { row, col };
    }
  }
  return null;
};
