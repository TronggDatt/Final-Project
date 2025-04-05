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
  sendJoinRoom,
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
  "00": "xe_b",
  10: "ma_b",
  20: "tinh_b",
  30: "sy_b",
  40: "tuong_b",
  50: "sy_b",
  60: "tinh_b",
  70: "ma_b",
  80: "xe_b",
  12: "phao_b",
  72: "phao_b",
  "03": "tot_b",
  23: "tot_b",
  43: "tot_b",
  63: "tot_b",
  83: "tot_b",
  "06": "tot_r",
  26: "tot_r",
  46: "tot_r",
  66: "tot_r",
  86: "tot_r",
  17: "phao_r",
  77: "phao_r",
  "09": "xe_r",
  19: "ma_r",
  29: "tinh_r",
  39: "sy_r",
  49: "tuong_r",
  59: "sy_r",
  69: "tinh_r",
  79: "ma_r",
  89: "xe_r",
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
      players: [], // Danh sách người chơi trong phòng
      playerColor: null,
      joinAttempts: 0, // Số lần thử tham gia phòng
      lastMoveBy: null,
      readyButtonPulse: false, // Thêm trạng thái để tạo hiệu ứng nhấp nháy
    };

    this.moveAudio = new Audio(moveSound);
    this.captureAudio = new Audio(captureSound);
    this.maxJoinAttempts = 5;
    this.pulseInterval = null; // Biến để lưu interval của hiệu ứng nhấp nháy
  }

  componentDidMount() {
    this.startCountdown();
    this.startReadyButtonPulse();
    const { gameId } = this.props;
    const email = localStorage.getItem("email");
    if (!gameId || !email) {
      console.error("❌ Không có gameId hoặc email.");
      return;
    }

    // Kiểm tra xem game có tồn tại không
    this.checkGameExists(gameId);

    connectWebSocket(
      gameId,
      this.handleMoveFromServer,
      this.handleReadyStatus,
      this.handleReceiveChat,
      this.handlePlayerJoin
    );
    // console.log("🟢 Đang connect WebSocket với roomId:", gameId);
    setTimeout(() => {
      this.sendJoinRoomRequest();
    }, 1000);
  }

  // Bắt đầu hiệu ứng nhấp nháy cho nút Ready
  startReadyButtonPulse = () => {
    // Xóa interval cũ nếu có
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
    }

    // Tạo interval mới để thay đổi trạng thái nhấp nháy
    this.pulseInterval = setInterval(() => {
      if (!this.state.isReady) {
        // Chỉ nhấp nháy khi chưa ready
        this.setState((prevState) => ({
          readyButtonPulse: !prevState.readyButtonPulse,
        }));
      }
    }, 1000); // Thay đổi mỗi 1 giây
  };

  // Kiểm tra xem game có tồn tại không
  checkGameExists = async (gameId) => {
    try {
      const game = await getGameById(gameId);
      if (!game) {
        console.log(
          "Game không tồn tại, sẽ được tạo tự động khi tham gia phòng"
        );
      } else {
        console.log("Game đã tồn tại:", game);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra game:", error);
    }
  };

  // Gửi thông báo tham gia phòng
  // sendJoinRoomRequest = () => {
  //   const { gameId } = this.props;
  //   const playerId = localStorage.getItem("email") || "unknown";
  //   console.log("🔄 Gửi lại yêu cầu tham gia phòng:", gameId, playerId);
  //   sendJoinRoom(gameId, playerId);
  // };

  // Gửi thông báo tham gia phòng
  sendJoinRoomRequest = () => {
    const { gameId } = this.props;
    const playerId = localStorage.getItem("email") || "unknown";
    const { joinAttempts } = this.state;

    if (joinAttempts >= this.maxJoinAttempts) {
      console.log("⚠️ Đã thử tham gia phòng quá nhiều lần, dừng lại");
      this.setState({
        error:
          "Không thể tham gia phòng sau nhiều lần thử. Vui lòng tải lại trang.",
      });
      return;
    }

    console.log(
      `🔄 Gửi yêu cầu tham gia phòng (lần ${joinAttempts + 1}):`,
      gameId,
      playerId
    );
    sendJoinRoom(gameId, playerId);

    this.setState({ joinAttempts: joinAttempts + 1 });
  };

  // Xử lý sự kiện người chơi tham gia
  handlePlayerJoin = (playerData) => {
    console.log("🎮 Xử lý thông tin người chơi:", playerData);
    const { players } = playerData;
    const myEmail = localStorage.getItem("email") || "unknown";

    if (!players || players.length === 0) {
      console.log("❌ Danh sách người chơi trống, gửi lại yêu cầu tham gia");
      // setTimeout(() => this.sendJoinRoomRequest(), 1000);
      return;
    }

    // Cập nhật danh sách người chơi
    this.setState({ players });

    // Xác định màu quân của người chơi hiện tại
    const myPlayerInfo = players.find((player) => player.id === myEmail);
    if (myPlayerInfo && !this.state.playerColor) {
      console.log("🎯 Tìm thấy thông tin người chơi:", myPlayerInfo);
      this.setState({
        playerColor: myPlayerInfo.color,
      });

      // Hiển thị thông báo về màu quân được gán
      const colorName = myPlayerInfo.color === "r" ? "Đỏ" : "Đen";
      Swal.fire({
        icon: "info",
        title: `Bạn chơi quân ${colorName}`,
        text: `Trong ván cờ này, bạn sẽ điều khiển quân ${colorName}.`,
      });
    } else {
      console.log(
        "❌ Không tìm thấy thông tin người chơi hoặc không có màu quân"
      );
    }
  };

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

    sendReadyState(this.props.gameId, playerId);
    console.log("Gửi trạng thái READY:", this.props.gameId, playerId);
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
    const { gameState, currentPlayer, lastMoveBy } = this.state;
    const fromKey = `${move.from.col}${move.from.row}`;
    const toKey = `${move.to.col}${move.to.row}`;

    console.log("Nhận nước đi từ server:", fromKey, "->", toKey);

    // Lấy thông tin người chơi từ move
    const playerColor = move.playerId.endsWith("_r") ? "r" : "b";

    // Kiểm tra xem có phải lượt của người chơi này không
    if (playerColor !== currentPlayer) {
      console.error(
        "Không phải lượt của người chơi này:",
        playerColor,
        "vs",
        currentPlayer
      );
      return;
    }

    // Kiểm tra xem người chơi này có phải là người vừa đi không
    if (playerColor === lastMoveBy) {
      console.error("Người chơi này vừa đi rồi:", playerColor);
      return;
    }

    const movingPiece = gameState[fromKey];
    if (!movingPiece) {
      console.error("Không tìm thấy quân cờ tại vị trí:", fromKey);
      return;
    }

    // const movingPiece = gameState[fromKey];
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
      lastMoveBy: currentPlayer,
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

  // sendMoveToServer = (from, to) => {
  //   const { gameId } = this.state;
  //   const move = {
  //     from: { row: from.row, col: from.col },
  //     to: { row: to.row, col: to.col },
  //     piece: this.state.gameState[`${from.col}${from.row}`],
  //     playerId: localStorage.getItem("email") || "unknown",
  //   };
  //   // console.log("Sending move:", move);
  //   sendMove(gameId, move);
  // };

  sendMoveToServer = (from, to) => {
    const { gameId } = this.props;
    const { playerColor } = this.state;
    const move = {
      from: { row: from.row, col: from.col },
      to: { row: to.row, col: to.col },
      piece: this.state.gameState[`${from.col}${from.row}`],
      playerId: `${localStorage.getItem("email") || "unknown"}_${playerColor}`,
    };
    sendMove(gameId, move);
  };

  sendChatMessage = (message) => {
    // const { gameId } = this.state;
    const { gameId } = this.props;
    const playerId = localStorage.getItem("email") || "unknown";

    const chatPayload = {
      gameId: gameId,
      senderId: playerId,
      content: message,
    };

    sendChatMessage(gameId, playerId, chatPayload);
  };

  handleSquareClick = (row, col) => {
    const {
      selectedPiece,
      gameState,
      currentPlayer,
      isCheckmate,
      playerColor,
      gameStarted,
    } = this.state;

    // Kiểm tra xem trò chơi đã bắt đầu chưa
    if (!gameStarted) {
      Swal.fire({
        icon: "info",
        title: "Trò chơi chưa bắt đầu!",
        text: "Vui lòng đợi đủ người chơi và nhấn READY.",
      });
      return;
    }

    // Kiểm tra xem có phải lượt của người chơi hiện tại không
    if (currentPlayer !== playerColor) {
      Swal.fire({
        icon: "warning",
        title: "Không phải lượt của bạn!",
        text: `Hiện tại là lượt của quân ${
          currentPlayer === "r" ? "Đỏ" : "Đen"
        }.`,
      });
      return;
    }

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

    //   if (selectedPiece) {
    //     if (clickedPiece && clickedPiece.endsWith(`_${currentPlayer}`)) {
    //       const board = convertGameStateToBoard(gameState);
    //       const validMoves = getValidMoves(board, { row, col }, clickedPiece);
    //       if (validMoves.length === 0) {
    //         Swal.fire({
    //           icon: "info",
    //           title: "Không có nước đi hợp lệ!",
    //           text: "Hãy chọn quân khác.",
    //         });
    //         return;
    //       }
    //       this.setState({ selectedPiece: { row, col }, validMoves });
    //       return;
    //     }

    //     if (this.movePiece(selectedPiece, { row, col })) {
    //       this.sendMoveToServer(selectedPiece, { row, col });
    //     }
    //   } else if (clickedPiece && clickedPiece.endsWith(`_${currentPlayer}`)) {
    //     const board = convertGameStateToBoard(gameState);
    //     const validMoves = getValidMoves(board, { row, col }, clickedPiece);
    //     this.setState({ selectedPiece: { row, col }, validMoves });
    //   }
    // };

    if (selectedPiece) {
      const board = convertGameStateToBoard(gameState);
      const selected = board[selectedPiece.row][selectedPiece.col];

      // Không cho phép di chuyển quân không thuộc phe hiện tại
      if (!selected.endsWith(`_${currentPlayer}`)) {
        Swal.fire({
          icon: "warning",
          title: "Không thể điều khiển quân đối thủ!",
          text: "Hãy chọn quân của bạn.",
        });
        return;
      }

      // Nếu click vào quân cùng phe => đổi quân đang chọn

      if (clickedPiece && clickedPiece.endsWith(`_${currentPlayer}`)) {
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

      // Di chuyển quân đã chọn
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
    const { gameState, validMoves, currentPlayer, lastMoveBy } = this.state;
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
      lastMoveBy: currentPlayer,
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
      playerColor,
      players,
      readyButtonPulse,
    } = this.state;

    // Xác định xem người chơi hiện tại có thể di chuyển quân không
    const canMove = gameStarted && currentPlayer === playerColor;

    // Xác định tên màu quân để hiển thị
    const colorName =
      playerColor === "r"
        ? "Đỏ"
        : playerColor === "b"
        ? "Đen"
        : "Chưa xác định";
    const currentPlayerName = currentPlayer === "r" ? "Đỏ" : "Đen";

    return (
      <div className="flex flex-col lg:flex-row justify-center items-start gap-6 p-4 w-full">
        {/* Game + Info Section */}
        <div className="flex flex-col items-center w-full lg:w-2/3">
          {error && <p className="text-red-500 font-bold mb-2">{error}</p>}

          {/* <p className="text-lg font-bold mb-2">
            Player: {currentPlayer === "r" ? "Red" : "Black"}
          </p> */}

          <div className="flex flex-col items-center mb-4">
            <p className="text-lg font-bold">
              Lượt chơi hiện tại:{" "}
              <span
                className={
                  currentPlayer === "r" ? "text-red-600" : "text-gray-800"
                }
              >
                {currentPlayerName}
              </span>
            </p>

            <p className="text-md mt-1">
              Bạn chơi quân:{" "}
              <span
                className={
                  playerColor === "r"
                    ? "text-red-600 font-bold"
                    : playerColor === "b"
                    ? "text-gray-800 font-bold"
                    : "text-gray-500"
                }
              >
                {colorName}
              </span>
            </p>

            {canMove && (
              <p className="text-green-600 font-bold mt-1">
                Đến lượt bạn di chuyển!
              </p>
            )}

            {players.length > 0 && (
              <div className="mt-2 text-sm">
                <p>Người chơi trong phòng ({players.length}/2):</p>
                <ul className="list-disc pl-5">
                  {players.map((player, index) => (
                    <li
                      key={index}
                      className={
                        player.color === "r" ? "text-red-600" : "text-gray-800"
                      }
                    >
                      {player.id} {player.color === "r" ? "(Đỏ)" : "(Đen)"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
                className={`relative px-8 py-3 rounded-full font-bold text-white text-base uppercase tracking-wider shadow-lg ${
                  isReady
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                }transition-all duration-300 transform ${
                  readyButtonPulse && !isReady ? "scale-110" : "scale-100"
                }`}
                disabled={isReady}
              >
                {isReady ? (
                  <>
                    <span className="mr-2">READY</span>
                    <span className="inline-flex items-center justify-center bg-white text-gray-800 rounded-full h-6 w-6 text-xs">
                      {this.state.countdown}
                    </span>
                  </>
                ) : (
                  <>
                    READY
                    {/* Hiệu ứng hào quang */}
                    <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></span>
                    {/* Hiệu ứng thông báo */}
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-xs text-white items-center justify-center">
                        !
                      </span>
                    </span>
                  </>
                )}
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
              playerColor={playerColor}
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
