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
import moveSound from "../Sound/move.mp3";
import captureSound from "../Sound/capture.mp3";
import {
  connectWebSocket,
  sendMove,
  disconnectWebSocket,
} from "../WebSocket Service/websocket";

const API_URL = "http://localhost:8080/games";
const MOVE_API_URL = "http://localhost:8080/moves";

// Lấy danh sách tất cả các ván cờ
export const getAllGames = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

// Lấy game theo ID
export const getGameById = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching game with ID ${id}:`, error);
    return null;
  }
};

// Tạo ván cờ mới
export const createGame = async (game) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(API_URL, game, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating game:", error);
    return null;
  }
};

// Lấy lịch sử nước đi
export const getMovesByGameId = async (gameId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${MOVE_API_URL}/game/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching moves for game ${gameId}:`, error);
    throw error;
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
      currentPlayer: "r",
      isCheck: false,
      isCheckmate: false,
      moveHistory: [],
      chatMessages: [],
      gameId: null,
      error: null,
    };

    this.moveAudio = new Audio(moveSound);
    this.captureAudio = new Audio(captureSound);
  }

  componentDidMount() {
    const { gameId } = this.props;
    if (gameId) {
      this.setState({ gameId }, () => {
        connectWebSocket(gameId, this.handleMessageFromServer);
        this.fetchMoves();
      });
    }
  }

  componentWillUnmount() {
    disconnectWebSocket();
  }

  handleMessageFromServer = (message) => {
    if (message.type === "chat") {
      this.setState((prevState) => ({
        chatMessages: [
          ...prevState.chatMessages,
          `Chat from ${message.senderId}: ${message.content}`,
        ],
      }));
    } else if (message.from && message.to) {
      this.handleMoveFromServer(message);
    }
  };

  handleMoveFromServer = (move) => {
    const { gameState, currentPlayer } = this.state;
    const fromKey = `${move.from[1]}${move.from[0]}`;
    const toKey = `${move.to[1]}${move.to[0]}`;
    const movingPiece = gameState[fromKey];
    const newGameState = { ...gameState };
    delete newGameState[fromKey];
    const capturedPiece = newGameState[toKey];
    newGameState[toKey] = movingPiece;

    const board = convertGameStateToBoard(newGameState);
    const nextPlayer = currentPlayer === "r" ? "b" : "r";
    const check = isKingInCheck(board, nextPlayer);
    const checkmate = isCheckmate(board, nextPlayer);

    if (check) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo!",
        text: `Tướng của ${nextPlayer === "r" ? "Đỏ" : "Đen"} đang bị chiếu!`,
      });
    }

    if (checkmate) {
      Swal.fire({
        icon: "success",
        title: "Chiếu bí!",
        text: `${nextPlayer === "r" ? "Đen" : "Đỏ"} đã thắng ván cờ!`,
      }).then(() => {
        this.setState({ isCheckmate: true });
      });
    }

    const newMove = {
      redMove:
        nextPlayer === "b" ? `${movingPiece} (${fromKey} -> ${toKey})` : "",
      blackMove:
        nextPlayer === "r" ? `${movingPiece} (${fromKey} -> ${toKey})` : "",
    };

    this.setState({
      gameState: newGameState,
      selectedPiece: null,
      validMoves: [],
      currentPlayer: nextPlayer,
      isCheck: check,
      isCheckmate: checkmate,
      moveHistory: [...this.state.moveHistory, newMove],
    });

    if (capturedPiece) {
      this.captureAudio.play();
    } else {
      this.moveAudio.play();
    }
  };

  fetchMoves = async () => {
    const { gameId } = this.state;
    try {
      const moves = await getMovesByGameId(gameId);
      const formattedMoves = moves.map((move) => ({
        redMove: move.playerId.endsWith("_r")
          ? `${move.fromPosition} -> ${move.toPosition}`
          : "",
        blackMove: move.playerId.endsWith("_b")
          ? `${move.fromPosition} -> ${move.toPosition}`
          : "",
      }));
      this.setState({ moveHistory: formattedMoves, error: null });
    } catch (error) {
      this.setState({
        error:
          "Không thể lấy lịch sử nước đi. Vui lòng kiểm tra đăng nhập hoặc backend.",
      });
    }
  };

  sendMoveToServer = (from, to) => {
    const { gameId } = this.state;
    const fromPos = `${String.fromCharCode(101 + parseInt(from.col))}${
      from.row
    }`;
    const toPos = `${String.fromCharCode(101 + parseInt(to.col))}${to.row}`;
    const move = {
      from: fromPos,
      to: toPos,
      playerId: localStorage.getItem("email") || "unknown",
    };
    sendMove(gameId, move);
  };

  sendChatMessage = (message) => {
    const { gameId } = this.state;
    const chatMessage = {
      type: "chat",
      senderId: localStorage.getItem("email") || "unknown",
      content: message,
    };
    sendMove(gameId, chatMessage);
  };

  handleSquareClick = (row, col) => {
    const { selectedPiece, gameState, currentPlayer, isCheckmate } = this.state;
    const key = `${col}${row}`;
    const clickedPiece = gameState[key];

    if (isCheckmate) {
      Swal.fire({
        icon: "info",
        title: "Ván cờ đã kết thúc!",
        text: "Hãy bắt đầu ván cYOU mới.",
      });
      return;
    }

    if (selectedPiece) {
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

      if (this.movePiece(selectedPiece, { row, col })) {
        this.sendMoveToServer(selectedPiece, { row, col });
      }
    } else if (clickedPiece && clickedPiece.endsWith(`_${currentPlayer}`)) {
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
    const capturedPiece = newGameState[toKey];
    newGameState[toKey] = movingPiece;

    if (isKingInCheck(convertGameStateToBoard(newGameState), currentPlayer)) {
      Swal.fire({
        icon: "error",
        title: "Nước đi không hợp lệ!",
        text: "Nước đi này khiến tướng của bạn bị chiếu!",
      });
      return false;
    }

    const board = convertGameStateToBoard(newGameState);
    const nextPlayer = currentPlayer === "r" ? "b" : "r";
    const check = isKingInCheck(board, nextPlayer);
    const checkmate = isCheckmate(board, nextPlayer);

    if (
      willMoveCheckKing(board, from, { row: to.row, col: to.col }, nextPlayer)
    ) {
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
        text: `Tướng của ${nextPlayer === "r" ? "Đỏ" : "Đen"} đang bị chiếu!`,
      });
    }

    if (checkmate) {
      Swal.fire({
        icon: "success",
        title: "Chiếu bí!",
        text: `${nextPlayer === "r" ? "Đen" : "Đỏ"} đã thắng ván cờ!`,
      }).then(() => {
        this.setState({ isCheckmate: true });
      });
    }

    const newMove = {
      redMove:
        currentPlayer === "r" ? `${movingPiece} (${fromKey} -> ${toKey})` : "",
      blackMove:
        currentPlayer === "b" ? `${movingPiece} (${fromKey} -> ${toKey})` : "",
    };

    this.setState({
      gameState: newGameState,
      selectedPiece: null,
      validMoves: [],
      currentPlayer: nextPlayer,
      isCheck: check,
      isCheckmate: checkmate,
      moveHistory: [...this.state.moveHistory, newMove],
    });

    if (capturedPiece) {
      this.captureAudio.play();
    } else {
      this.moveAudio.play();
    }

    return true;
  };

  render() {
    const {
      gameState,
      validMoves,
      currentPlayer,
      isCheck,
      isCheckmate,
      moveHistory,
      chatMessages,
      error,
    } = this.state;

    return (
      <div className="flex justify-center mt-10">
        <div className="flex flex-col items-center">
          {error && <p className="text-red-500 font-bold mb-2">{error}</p>}
          <p className="text-lg font-bold mb-2">
            Player: {currentPlayer === "r" ? "Red" : "Black"}
          </p>
          {isCheck && (
            <p className="text-red-500 font-bold">
              Cảnh báo: Tướng đang bị chiếu!
            </p>
          )}
          {isCheckmate && (
            <p className="text-red-600 font-bold">
              Checkmate! {currentPlayer === "r" ? "Red" : "Black"} win!
            </p>
          )}
          <Board
            gameState={gameState}
            onSquareClick={this.handleSquareClick}
            validMoves={validMoves}
          />
        </div>
        <div className="w-96 h-80 ml-6">
          <ChatBox
            moves={moveHistory}
            chatMessages={chatMessages}
            onSendChat={this.sendChatMessage}
          />
        </div>
      </div>
    );
  }
}

export default GameController;
