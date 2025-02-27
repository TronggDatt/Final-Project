import React from "react";
import Board from "./Board";
import { convertGameStateToBoard, getValidMoves } from "../utils/chessLogic";

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
      gameState: { ...INITIAL_GAME_STATE },
      selectedPiece: null,
      validMoves: [],
    };
  }

  handleSquareClick = (row, col) => {
    const { selectedPiece, gameState } = this.state;
    const key = `${col}${row}`;

    if (selectedPiece) {
      this.movePiece(selectedPiece, { row, col });
    } else if (gameState[key]) {
      // Lấy danh sách nước đi hợp lệ từ chessLogic.jsx
      const board = convertGameStateToBoard(gameState);
      const piece = gameState[key];
      const validMoves = getValidMoves(board, { row, col }, piece);

      this.setState({ selectedPiece: { row, col }, validMoves });
    }
  };

  movePiece = (from, to) => {
    const { gameState, validMoves } = this.state;
    console.log("Valid Moves:", validMoves);
    const fromKey = `${from.col}${from.row}`;
    const toKey = `${to.col}${to.row}`;

    // if (
    //   !Array.isArray(validMoves) ||
    //   !validMoves.some(([r, c]) => r === to.row && c === to.col)
    // ) {
    //   console.log("Invalid move!");
    //   return;
    // }

    // if (!validMoves.some(([r, c]) => r === to.row && c === to.col)) {
    //   console.log("Invalid move!", to);
    //   return;
    // }

    if (!gameState[fromKey]) return;

    const movingPiece = gameState[fromKey];
    const targetPiece = gameState[toKey];

    // Kiểm tra nếu quân cờ đích là quân đối phương
    if (
      targetPiece &&
      movingPiece.split("_")[1] === targetPiece.split("_")[1]
    ) {
      return;
    }
    const newGameState = { ...gameState };
    delete newGameState[fromKey]; // Xóa quân cờ khỏi vị trí cũ
    newGameState[toKey] = movingPiece; // Đặt quân vào vị trí mới

    this.setState({
      gameState: newGameState,
      selectedPiece: null,
      validMoves: [],
    });
  };

  render() {
    return (
      <div className="flex flex-col items-center mt-10">
        <Board
          gameState={this.state.gameState}
          onSquareClick={this.handleSquareClick}
          validMoves={this.state.validMoves}
        />
      </div>
    );
  }
}

export default GameController;
