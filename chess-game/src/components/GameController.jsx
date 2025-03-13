import React from "react";
import Board from "./Board";
import ChatBox from "./ChatBox";
import {
  convertGameStateToBoard,
  getValidMoves,
  isCheckmate,
  isKingInCheck,
  willMoveCheckKing,
} from "../utils/chessLogic";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = "http://localhost:8080/games";
// Lấy danh sách tất cả các ván cờ
export const getAllGames = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

// Lấy game theo ID
export const getGameById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching game with ID ${id}:`, error);
    return null;
  }
};

// Tạo ván cờ mới
export const createGame = async (game) => {
  try {
    const response = await axios.post(API_URL, game);
    return response.data;
  } catch (error) {
    console.error("Error creating game:", error);
    return null;
  }
};

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
      currentPlayer: "r", // Người chơi bắt đầu là đỏ
      isCheck: false,
      isCheckmate: false,
      moveHistory: [],
    };
  }

  handleSquareClick = (row, col) => {
    const { selectedPiece, gameState, currentPlayer } = this.state;
    const key = `${col}${row}`;
    const clickedPiece = gameState[key];

    if (selectedPiece) {
      // Nếu chọn quân khác của mình, đổi sang quân đó
      if (clickedPiece && clickedPiece.endsWith(`_${currentPlayer}`)) {
        const board = convertGameStateToBoard(gameState);
        const validMoves = getValidMoves(board, { row, col }, clickedPiece);
        if (validMoves.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Không có nước đi hợp lệ!",
            text: "Hãy chọn quân khác.",
          });
          return;
        }
        this.setState({ selectedPiece: { row, col }, validMoves });
        return;
      }

      // Nếu nhấp vào ô trống hoặc quân đối thủ, thử di chuyển
      if (this.movePiece(selectedPiece, { row, col })) {
        const newGameState = { ...this.state.gameState };
        const board = convertGameStateToBoard(newGameState);
        const nextPlayer = currentPlayer === "r" ? "b" : "r";
        const check = isKingInCheck(board, nextPlayer);
        const checkmate = isCheckmate(board, nextPlayer);

        // Kiểm tra xem quân di chuyển có tạo ra tình huống chiếu tướng hay không
        if (willMoveCheckKing(board, selectedPiece, { row, col }, nextPlayer)) {
          Swal.fire({
            icon: "warning",
            title: "Cảnh báo!",
            text: "Tướng của bạn đang bị chiếu tướng! Hãy bảo vệ tướng của mình!",
          });
        }

        if (check) {
          Swal.fire({
            icon: "warning",
            title: "Cảnh báo!",
            text: `Tướng của ${
              nextPlayer === "r" ? "Đỏ" : "Đen"
            } đang bị chiếu!`,
          });
        }

        if (checkmate) {
          Swal.fire({
            icon: "success",
            title: "Chiếu bí!",
            text: `${nextPlayer === "r" ? "Đen" : "Đỏ"} đã thắng ván cờ!`,
          }).then(() => {
            // Nếu chiếu bí, không cho phép tiếp tục chơi
            this.setState({ isCheckmate: true });
          });
        }

        this.setState({
          currentPlayer: nextPlayer,
          isCheck: check,
          isCheckmate: checkmate,
        });
      }
    } else if (clickedPiece && clickedPiece.endsWith(`_${currentPlayer}`)) {
      // Chỉ chọn quân của người chơi hiện tại
      const board = convertGameStateToBoard(gameState);
      const validMoves = getValidMoves(board, { row, col }, clickedPiece);
      this.setState({ selectedPiece: { row, col }, validMoves });
    }
  };

  movePiece = (from, to) => {
    const { gameState, validMoves, currentPlayer } = this.state;
    const fromKey = `${from.col}${from.row}`;
    const toKey = `${to.col}${to.row}`;

    if (
      !validMoves.some((move) => move.row === to.row && move.col === to.col)
    ) {
      Swal.fire({
        icon: "error",
        title: "Nước đi không hợp lệ!",
        text: "Bạn không thể di chuyển quân đến vị trí này!",
      });
      return false;
    }

    const movingPiece = gameState[fromKey];
    const newGameState = { ...gameState };
    delete newGameState[fromKey];
    newGameState[toKey] = movingPiece;

    // Kiểm tra xem nước đi có làm tướng bị chiếu không
    if (isKingInCheck(convertGameStateToBoard(newGameState), currentPlayer)) {
      Swal.fire({
        icon: "error",
        title: "Nước đi không hợp lệ!",
        text: "Nước đi này khiến tướng của bạn bị chiếu!",
      });
      return false;
    }

    const newMove = {
      redMove:
        currentPlayer === "r" ? `${movingPiece} (${fromKey} -> ${toKey})` : "",
      blackMove:
        currentPlayer === "b" ? `${movingPiece} (${fromKey} -> ${toKey})` : "",
    };

    this.setState((prevState) => ({
      gameState: newGameState,
      selectedPiece: null,
      validMoves: [],
      moveHistory: [...prevState.moveHistory, newMove],
      currentPlayer: currentPlayer === "r" ? "b" : "r",
    }));
    return true;
  };

  // Kiểm tra xem quân di chuyển có tạo ra chiếu tướng hay không
  willMoveCheckKing = (board, from, to, nextPlayer) => {
    // Tạo bản sao game state và thực hiện di chuyển quân
    const tempBoard = [...board];
    tempBoard[to.row][to.col] = tempBoard[from.row][from.col];
    tempBoard[from.row][from.col] = null;

    // Kiểm tra xem tướng của nextPlayer có bị chiếu không
    return isKingInCheck(tempBoard, nextPlayer);
  };

  render() {
    return (
      <div className="flex justify-center mt-10">
        {/* Bàn cờ nằm bên trái */}
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold mb-2">
            Lượt chơi: {this.state.currentPlayer === "r" ? "Đỏ" : "Đen"}
          </p>
          {this.state.isCheck && (
            <p className="text-red-500 font-bold">
              Cảnh báo: Tướng đang bị chiếu!
            </p>
          )}
          {this.state.isCheckmate && (
            <p className="text-red-600 font-bold">
              Chiếu bí! {this.state.currentPlayer === "r" ? "Đen" : "Đỏ"} thắng!
            </p>
          )}
          <Board
            gameState={this.state.gameState}
            onSquareClick={this.handleSquareClick}
            validMoves={this.state.validMoves}
          />
        </div>

        {/* ChatBox bên phải */}
        <div className="w-96 h-80 ml-6">
          <ChatBox moves={this.state.moveHistory} />
        </div>
      </div>
    );
  }
}

export default GameController;
