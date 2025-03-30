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
  sendReadyState,
  sendChatMessage,
  disconnectWebSocket,
} from "../WebSocket Service/websocket";

const API_URL = "http://localhost:8081/games";
const MOVE_API_URL = "http://localhost:8081/moves";

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
      gameId: props.gameId || null,
      error: null,
      isReady: false, // Trạng thái sẵn sàng của người chơi
      gameStarted: false, // Trạng thái bắt đầu trò chơi
      readyPlayers: [],
      status: "WAITING",
      countdown: 10,
    };

    this.moveAudio = new Audio(moveSound);
    this.captureAudio = new Audio(captureSound);
  }

  componentDidMount() {
    this.startCountdown();
    const { gameId } = this.props;
    const email = localStorage.getItem("email");
    if (!gameId || !email) {
      console.error("❌ Không có gameId hoặc email.");
      return;
    }

    connectWebSocket(
      gameId,
      this.handleMoveFromServer,
      this.handleReadyStatus,
      this.handleReceiveChat
    );
    // console.log("🟢 Đang connect WebSocket với roomId:", gameId);
  }

  handleMoveFromServer = (message) => {
    const myEmail = localStorage.getItem("email");

    // Phân biệt message dạng move vs chat
    if (message.from && message.to && message.playerId) {
      // Đây là message MOVE
      if (message.playerId !== myEmail) {
        this.processMoveFromServer(message);
      }
    } else if (message.senderId && message.content) {
      // Đây là CHAT message
      const newMessage = {
        senderId: message.senderId,
        content: message.content,
      };
      this.setState((prevState) => ({
        chatMessages: [...prevState.chatMessages, newMessage],
      }));
    }
  };

  handleReadyStatus = (readyState) => {
    const { status, readyPlayers } = readyState;
    this.setState({
      readyPlayers,
      status,
      gameStarted: status === "START",
    });
  };

  handleReady = () => {
    const playerId = localStorage.getItem("email") || "unknown";
    const isReady = !this.state.isReady;
    this.setState({ isReady }, () => {
      if (isReady) this.startCountdown(); // Chỉ start nếu vừa bấm READY
    });

    sendReadyState(this.state.gameId, playerId);
    // console.log("Gửi trạng thái READY:", this.state.gameId, playerId);
  };

  handleReceiveChat = (chatMessage) => {
    // console.log("📩 Chat nhận được:", chatMessage);
    this.setState((prevState) => ({
      chatMessages: [
        ...prevState.chatMessages,
        {
          senderId: chatMessage.senderId,
          content: chatMessage.content,
        },
      ],
    }));
  };

  componentWillUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    disconnectWebSocket();
  }
  startCountdown = () => {
    this.countdownInterval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.countdown <= 1) {
          clearInterval(this.countdownInterval);
          return { countdown: 0 };
        }
        return { countdown: prevState.countdown - 1 };
      });
    }, 1000);
  };

  processMoveFromServer = (move) => {
    const { gameState, currentPlayer } = this.state;
    const fromKey = `${move.from.col}${move.from.row}`;
    const toKey = `${move.to.col}${move.to.row}`;
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
    const move = {
      from: { row: from.row, col: from.col },
      to: { row: to.row, col: to.col },
      piece: this.state.gameState[`${from.col}${from.row}`],
      playerId: localStorage.getItem("email") || "unknown",
    };
    // console.log("Sending move:", move);
    sendMove(gameId, move);
  };

  sendChatMessage = (message) => {
    const { gameId } = this.state;
    const playerId = localStorage.getItem("email") || "unknown";

    const chatPayload = {
      gameId: gameId,
      senderId: playerId,
      content: message,
    };

    sendChatMessage(gameId, playerId, chatPayload);
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
      isReady,
      gameStarted,
      readyPlayers,
      status,
    } = this.state;

    return (
      <div className="flex flex-col lg:flex-row justify-center items-start gap-6 p-4 w-full">
        {/* Game + Info Section */}
        <div className="flex flex-col items-center w-full lg:w-2/3">
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

          {!gameStarted && (
            <div className="mb-4 text-center">
              <button
                onClick={this.handleReady}
                className={`relative px-6 py-2 rounded-full font-bold transition text-white text-sm uppercase tracking-wider shadow-md ${
                  isReady
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                disabled={isReady}
              >
                {isReady ? `READY (${this.state.countdown})` : "READY"}
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Trạng thái phòng: {status} | Người sẵn sàng:{" "}
                {readyPlayers.length}/2
              </p>
            </div>
          )}

          <div className="w-full max-w-[500px] aspect-[9/10]">
            <Board
              gameState={gameState}
              onSquareClick={this.handleSquareClick}
              validMoves={validMoves}
            />
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-1/3 h-[400px]">
          <ChatBox
            moves={moveHistory}
            messages={chatMessages}
            onSendChat={this.sendChatMessage}
          />
        </div>
      </div>
    );
  }
}

export default GameController;
