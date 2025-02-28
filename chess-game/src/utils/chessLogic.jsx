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

// Chuyển gameState thành bảng 2D
export const convertGameStateToBoard = (gameState) => {
  let board = Array.from({ length: 10 }, () => Array(9).fill(null));
  for (const key in gameState) {
    const col = parseInt(key[0], 10);
    const row = parseInt(key[1], 10);
    board[row][col] = gameState[key];
  }
  return board;
};

export const getValidMoves = (board, from, piece) => {
  const validMoves = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      if (isValidMove(board, from, { row, col }, piece)) {
        validMoves.push({ row, col });
      }
    }
  }
  return validMoves;
};

// Kiểm tra nước đi hợp lệ của Xe
const isValidRookMove = (board, from, to) => {
  if (from.row !== to.row && from.col !== to.col) return false;

  if (from.row === to.row) {
    for (
      let col = Math.min(from.col, to.col) + 1;
      col < Math.max(from.col, to.col);
      col++
    ) {
      if (board[from.row][col]) return false;
    }
  } else {
    for (
      let row = Math.min(from.row, to.row) + 1;
      row < Math.max(from.row, to.row);
      row++
    ) {
      if (board[row][from.col]) return false;
    }
  }
  return true;
};

// Kiểm tra nước đi hợp lệ của Mã
const isValidKnightMove = (from, to) => {
  const dx = Math.abs(from.col - to.col);
  const dy = Math.abs(from.row - to.row);
  return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
};

// Kiểm tra nước đi hợp lệ của Tốt
const isValidPawnMove = (piece, from, to) => {
  const color = piece.slice(-1); // 'r' hoặc 'b'
  const isRed = color === "r";
  const forwardDirection = isRed ? 1 : -1; // Đỏ tiến xuống, Đen tiến lên
  const riverBoundary = isRed ? 4 : 5; // Hàng sông

  // Tốt đi thẳng một bước
  if (to.row === from.row + forwardDirection && to.col === from.col) {
    return true;
  }

  // Sau khi qua sông, Tốt có thể đi ngang một bước nhưng không được đi lùi
  if (
    (isRed && from.row > riverBoundary) ||
    (!isRed && from.row < riverBoundary)
  ) {
    if (Math.abs(to.col - from.col) === 1 && to.row === from.row) {
      return true;
    }
  }

  return false;
};

// Kiểm tra nước đi hợp lệ của Pháo
const isValidCannonMove = (board, from, to) => {
  if (from.row !== to.row && from.col !== to.col) return false;

  let count = 0;
  if (from.row === to.row) {
    for (
      let col = Math.min(from.col, to.col) + 1;
      col < Math.max(from.col, to.col);
      col++
    ) {
      if (board[from.row][col]) count++;
    }
  } else {
    for (
      let row = Math.min(from.row, to.row) + 1;
      row < Math.max(from.row, to.row);
      row++
    ) {
      if (board[row][from.col]) count++;
    }
  }
  return board[to.row][to.col] ? count === 1 : count === 0;
};

// Kiểm tra nước đi hợp lệ của Tượng
const isValidElephantMove = (board, from, to, piece) => {
  const color = piece.slice(-1);
  const isRed = color === "r";
  const riverBoundary = isRed ? 4 : 5;

  // Kiểm tra đi chéo đúng 2 ô
  if (Math.abs(from.row - to.row) !== 2 || Math.abs(from.col - to.col) !== 2) {
    return false;
  }

  // Kiểm tra không qua sông
  if ((isRed && to.row > riverBoundary) || (!isRed && to.row < riverBoundary)) {
    return false;
  }

  // Kiểm tra có bị cản giữa đường không
  const midRow = (from.row + to.row) / 2;
  const midCol = (from.col + to.col) / 2;
  if (board[midRow][midCol]) {
    return false;
  }

  return true;
};

// Kiểm tra nước đi hợp lệ của Sĩ
const isValidAdvisorMove = (from, to, piece) => {
  const color = piece.slice(-1);
  const isRed = color === "r";
  const palaceRows = isRed ? [0, 1, 2] : [7, 8, 9];
  const palaceCols = [3, 4, 5];

  return (
    Math.abs(from.row - to.row) === 1 &&
    Math.abs(from.col - to.col) === 1 &&
    palaceRows.includes(to.row) &&
    palaceCols.includes(to.col)
  );
};

// Kiểm tra nước đi hợp lệ của Tướng
const isValidKingMove = (board, from, to, piece) => {
  const color = piece.slice(-1);
  const palaceBounds =
    color === "r" ? { rowMin: 0, rowMax: 2 } : { rowMin: 7, rowMax: 9 };
  if (
    to.row < palaceBounds.rowMin ||
    to.row > palaceBounds.rowMax ||
    to.col < 3 ||
    to.col > 5
  ) {
    return false;
  }
  if (Math.abs(from.row - to.row) + Math.abs(from.col - to.col) !== 1) {
    return false;
  }

  // Kiểm tra luật đối mặt
  return !isKingFacing(board, from, to, color);
};

// Kiểm tra nếu hai Tướng đối mặt nhau
const isKingFacing = (board, from, to, color) => {
  const enemyColor = color === "r" ? "b" : "r";
  const enemyKingPos = findKing(board, enemyColor);
  if (enemyKingPos.col !== to.col) return false;

  for (
    let row = Math.min(enemyKingPos.row, to.row) + 1;
    row < Math.max(enemyKingPos.row, to.row);
    row++
  ) {
    if (board[row][to.col]) return false;
  }
  return true;
};

// Kiểm tra nước đi hợp lệ chung
export const isValidMove = (board, from, to, piece) => {
  if (!piece || (from.row === to.row && from.col === to.col)) return false;

  const type = piece.slice(0, -2);
  const color = piece.slice(-1);
  const targetPiece = board[to.row][to.col];
  if (targetPiece && targetPiece.slice(-1) === color) return false;

  switch (type) {
    case "xe":
      return isValidRookMove(board, from, to);
    case "ma":
      return isValidKnightMove(from, to);
    case "phao":
      return isValidCannonMove(board, from, to);
    case "tot":
      return isValidPawnMove(piece, from, to);
    case "tinh":
      return isValidElephantMove(board, from, to, piece);
    case "sy":
      return isValidAdvisorMove(from, to, piece);
    case "tuong":
      return isValidKingMove(board, from, to, piece);
    default:
      return false;
  }
};

// Tìm vị trí của Tướng
const findKing = (board, color) => {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === `tuong_${color}`) return { row, col };
    }
  }
  return null;
};

// Kiểm tra chiếu tướng
export const isCheck = (board, color) => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  return board.some((row, rowIndex) =>
    row.some(
      (piece, colIndex) =>
        piece &&
        piece.slice(-1) !== color &&
        isValidMove(board, { row: rowIndex, col: colIndex }, kingPos, piece)
    )
  );
};
