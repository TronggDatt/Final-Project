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

// Kiểm tra nước đi hợp lệ của Mã (bao gồm luật cản Mã)
const isValidKnightMove = (board, from, to) => {
  if (!from || !to) {
    console.error("from hoặc to bị undefined:", { from, to });
    return false;
  }
  const dx = to.col - from.col;
  const dy = to.row - from.row;

  if (
    !(
      (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
      (Math.abs(dx) === 1 && Math.abs(dy) === 2)
    )
  ) {
    return false;
  }

  // Kiểm tra cản Mã
  const blockRow = from.row + dy / 2;
  const blockCol = from.col + dx / 2;

  if (
    (Math.abs(dx) === 2 && board[from.row][blockCol]) ||
    (Math.abs(dy) === 2 && board[blockRow][from.col])
  ) {
    return false;
  }

  return true;
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
      return isValidKnightMove(board, from, to);
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

// Kiểm tra xem nước đi có tạo ra tình huống chiếu tướng không
export function willMoveCheckKing(board, from, to, nextPlayer) {
  // Tạo bản sao game state và thực hiện di chuyển quân
  const tempBoard = [...board]; // Make sure you're correctly copying the board
  tempBoard[to.row][to.col] = tempBoard[from.row][from.col];
  tempBoard[from.row][from.col] = null;

  // Kiểm tra xem tướng của nextPlayer có bị chiếu không
  return isKingInCheck(tempBoard, nextPlayer); // Check if the king is in check after the move
}

// Kiểm tra chiếu tướng
export const isCheck = (board, color) => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  return board.some((row, rIdx) =>
    row.some((piece, cIdx) => {
      if (piece && piece.slice(-1) !== color) {
        const validMoves = getValidMoves(
          board,
          { row: rIdx, col: cIdx },
          piece
        );
        return validMoves.some(
          (move) => move.row === kingPos.row && move.col === kingPos.col
        );
      }
      return false;
    })
  );
};

// Kiểm tra chiếu hết
export const isCheckmate = (board, color) => {
  if (!isCheck(board, color)) return false;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.slice(-1) === color) {
        const validMoves = getValidMoves(board, { row, col }, piece);
        for (const move of validMoves) {
          const newBoard = board.map((r) => [...r]);
          newBoard[move.row][move.col] = piece;
          newBoard[row][col] = null;

          if (!isCheck(newBoard, color)) {
            return false;
          }
        }
      }
    }
  }
  return true;
};

export const isGeneralFacing = (board) => {
  let redKing = null,
    blackKing = null;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === "Kr") redKing = { row, col };
      if (board[row][col] === "Kb") blackKing = { row, col };
    }
  }
  if (!redKing || !blackKing || redKing.col !== blackKing.col) return false;

  for (let i = redKing.row + 1; i < blackKing.row; i++) {
    if (board[i][redKing.col]) return false;
  }
  return true;
};
export function isKingInCheck(board, currentPlayer) {
  // Xác định vị trí của tướng
  let kingPosition = null;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === `tuong_${currentPlayer}`) {
        kingPosition = { row, col };
        break;
      }
    }
  }

  if (!kingPosition) return false; // Không tìm thấy tướng, có thể là lỗi dữ liệu

  // Kiểm tra xem quân đối phương có thể di chuyển đến vị trí tướng không
  const opponent = currentPlayer === "r" ? "b" : "r";
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.endsWith(`_${opponent}`)) {
        const validMoves = getValidMoves(board, { row, col }, piece);
        if (
          validMoves.some(
            (move) =>
              move.row === kingPosition.row && move.col === kingPosition.col
          )
        ) {
          return true; // Tướng đang bị chiếu
        }
      }
    }
  }

  return false; // Tướng không bị chiếu
}
