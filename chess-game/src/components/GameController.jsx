import React from "react";
import Board from "./Board";

const INITIAL_GAME_STATE = {
  "00": "xe_r",
  10: "ma_r",
  20: "tinh_r",
  30: "sy_r",
  40: "tuong_r",
  50: "sy_r",
  60: "tinh_r",
  70: "ma_r",
  80: "xe_r",
  12: "phao_r",
  72: "phao_r",
  "03": "tot_r",
  23: "tot_r",
  43: "tot_r",
  63: "tot_r",
  83: "tot_r",
  "06": "tot_b",
  26: "tot_b",
  46: "tot_b",
  66: "tot_b",
  86: "tot_b",
  17: "phao_b",
  77: "phao_b",
  "09": "xe_b",
  19: "ma_b",
  29: "tinh_b",
  39: "sy_b",
  49: "tuong_b",
  59: "sy_b",
  69: "tinh_b",
  79: "ma_b",
  89: "xe_b",
};

class GameController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: { ...INITIAL_GAME_STATE }, // Lưu trạng thái bàn cờ
      selectedPiece: null, // Lưu quân cờ đang được chọn
    };
  }

  handlePieceClick = (position) => {
    const { selectedPiece, gameState } = this.state;
    const key = `${position.col}${position.row}`;

    if (selectedPiece) {
      // Nếu đã chọn quân cờ trước đó, thử di chuyển
      this.movePiece(selectedPiece, position);
    } else if (gameState[key]) {
      // Nếu ô có quân cờ, chọn nó
      this.setState({ selectedPiece: position });
    }
  };

  movePiece = (from, to) => {
    const { gameState } = this.state;
    const fromKey = `${from.col}${from.row}`;
    const toKey = `${to.col}${to.row}`;

    if (!gameState[fromKey]) return;

    // Kiểm tra nước đi hợp lệ
    const validMoves = this.getValidMoves(from);
    const isValidMove = validMoves.some(
      (move) => move.row === to.row && move.col === to.col
    );
    if (!isValidMove) return; // Nếu không hợp lệ thì thoát luôn

    const newGameState = { ...gameState };
    newGameState[toKey] = newGameState[fromKey];
    delete newGameState[fromKey];

    this.setState({ gameState: newGameState, selectedPiece: null });
  };

  getValidMoves = (position) => {
    const { gameState } = this.state;
    const { row, col } = position;
    const key = `${col}${row}`;
    const piece = gameState[key];

    if (!piece) return []; // Nếu không có quân cờ, không có nước đi

    const moves = [];

    // Ví dụ: nếu là tốt (tot_r hoặc tot_b)
    if (piece.includes("tot")) {
      const direction = piece.includes("_r") ? 1 : -1; // Tốt đỏ đi xuống, tốt đen đi lên
      const newRow = row + direction;
      const newKey = `${col}${newRow}`;
      if (!gameState[newKey]) {
        moves.push({ row: newRow, col }); // Có thể đi thẳng nếu ô trống
      }
    }

    return moves; // Trả về danh sách nước đi hợp lệ
  };

  render() {
    return (
      <div className="flex flex-col items-center mt-10">
        <Board
          gameState={this.state.gameState}
          setGameState={(newGameState) =>
            this.setState({ gameState: newGameState })
          }
          getValidMoves={this.getValidMoves} // ✅ Truyền hàm xuống Board.jsx
        />
      </div>
    );
  }
}

export default GameController;
