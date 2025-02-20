// utils/chessLogic.js

export const isValidMove = (gameState, from, to) => {
  const fromKey = `${from.col}${from.row}`;
  const toKey = `${to.col}${to.row}`;

  if (!gameState[fromKey]) return false; // Không có quân cờ để di chuyển

  const movingPiece = gameState[fromKey]; // Quân cờ đang di chuyển
  const targetPiece = gameState[toKey]; // Quân cờ tại ô đích

  // Không cho phép ăn quân cùng màu
  if (targetPiece && movingPiece.slice(-1) === targetPiece.slice(-1)) {
    return false;
  }

  // Xác định loại quân cờ và kiểm tra nước đi hợp lệ
  const pieceType = movingPiece.split("_")[0];

  switch (pieceType) {
    case "xe":
      return isValidRookMove(gameState, from, to);
    case "ma":
      return isValidKnightMove(gameState, from, to);
    case "tinh":
      return isValidBishopMove(from, to, movingPiece);
    case "sy":
      return isValidAdvisorMove(from, to, movingPiece);
    case "tuong":
      return isValidKingMove(from, to, movingPiece);
    case "phao":
      return isValidCannonMove(gameState, from, to);
    case "tot":
      return isValidPawnMove(from, to, movingPiece);
    default:
      return false;
  }
};

// 🚀 Viết từng quy tắc nước đi cho các quân cờ
//xe
const isValidRookMove = (gameState, from, to) => {
  return (
    (from.col === to.col || from.row === to.row) &&
    !isBlocked(gameState, from, to)
  );
};

const isValidKnightMove = (gameState, from, to) => {
  const dx = Math.abs(from.col - to.col);
  const dy = Math.abs(from.row - to.row);

  if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {
    const blockCol = dx === 2 ? (from.col + to.col) / 2 : from.col;
    const blockRow = dy === 2 ? (from.row + to.row) / 2 : from.row;
    return !gameState[`${blockCol}${blockRow}`]; // Mã không thể bị cản chân
  }

  return false;
};

const isValidBishopMove = (gameState, from, to, piece) => {
  const dx = Math.abs(from.col - to.col);
  const dy = Math.abs(from.row - to.row);

  // Tượng đi chéo 2 ô
  if (dx === 2 && dy === 2) {
    const middleX = (from.col + to.col) / 2;
    const middleY = (from.row + to.row) / 2;
    return (
      !gameState[`${middleX}${middleY}`] && // Không bị cản đường
      ((piece.endsWith("r") && to.row >= 5) ||
        (piece.endsWith("b") && to.row <= 4))
    ); // Không ra khỏi nửa bàn cờ
  }

  return false;
};

const isValidAdvisorMove = (from, to, piece) => {
  const validCols = [3, 4, 5]; // Giới hạn cột trong cung
  const validRows = piece.endsWith("r") ? [7, 8, 9] : [0, 1, 2]; // Giới hạn hàng trong cung

  return (
    Math.abs(from.col - to.col) === 1 &&
    Math.abs(from.row - to.row) === 1 &&
    validCols.includes(to.col) &&
    validRows.includes(to.row)
  );
};

const isValidKingMove = (from, to, piece) => {
  const validCols = [3, 4, 5];
  const validRows = piece.endsWith("r") ? [7, 8, 9] : [0, 1, 2];

  return (
    Math.abs(from.col - to.col) + Math.abs(from.row - to.row) === 1 &&
    validCols.includes(to.col) &&
    validRows.includes(to.row)
  );
};

const isValidCannonMove = (gameState, from, to) => {
  const obstacles = countObstacles(gameState, from, to);
  return (
    obstacles === 0 || (gameState[`${to.col}${to.row}`] && obstacles === 1)
  );
};

const isValidPawnMove = (from, to, piece) => {
  const isRed = piece.endsWith("r");
  const forward = isRed ? -1 : 1;

  if (to.row === from.row + forward && from.col === to.col) return true; // Đi thẳng trước khi qua sông
  if ((isRed && from.row < 5) || (!isRed && from.row > 4)) {
    return Math.abs(from.col - to.col) === 1 && from.row === to.row; // Qua sông có thể đi ngang
  }

  return false;
};

// Kiểm tra có quân cản đường không
const isBlocked = (gameState, from, to) => {
  const path = getPath(from, to);
  return path.some((pos) => gameState[`${pos.col}${pos.row}`]);
};

// Đếm số quân cản đường (dùng cho pháo)
const countObstacles = (gameState, from, to) => {
  const path = getPath(from, to);
  return path.filter((pos) => gameState[`${pos.col}${pos.row}`]).length;
};

// Lấy danh sách ô trên đường đi
const getPath = (from, to) => {
  const path = [];
  const dx = Math.sign(to.col - from.col);
  const dy = Math.sign(to.row - from.row);
  let col = from.col + dx,
    row = from.row + dy;

  while (col !== to.col || row !== to.row) {
    path.push({ col, row });
    col += dx;
    row += dy;
  }

  return path;
};
