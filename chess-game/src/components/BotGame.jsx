import { useState, useEffect } from "react";
import Board from "./Board";
import ChatBox from "./ChatBox";
import { initBotGame, getBotMoveAPI } from "../apis/api_bot";
import {
  convertGameStateToBoard,
  getValidMoves,
  isCheckmate as isCheckmateFunc,
  isKingInCheck,
} from "../utils/chessLogic";
import Swal from "sweetalert2";
import moveSound from "../Sound/move.mp3";
import captureSound from "../Sound/capture.mp3";
import { useNavigate } from "react-router-dom";

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

const BotGame = () => {
  const [gameState, setGameState] = useState({ ...INITIAL_GAME_STATE });
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("r"); // Red starts
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState("medium");
  const [playerColor] = useState("r"); // Player is red by default
  const [botThinking, setBotThinking] = useState(false);

  const navigate = useNavigate();

  const moveAudio = new Audio(moveSound);
  const captureAudio = new Audio(captureSound);

  useEffect(() => {
    // Get difficulty from localStorage
    const savedDifficulty = localStorage.getItem("botDifficulty");
    if (savedDifficulty) {
      setBotDifficulty(savedDifficulty);
    }

    // Initialize game
    initGame();

    // Add welcome message
    setChatMessages([
      {
        senderId: "Bot",
        content: `Xin chào! Tôi là Bot Cờ Tướng với độ khó ${
          savedDifficulty || "medium"
        }. Chúc bạn chơi vui vẻ!`,
      },
    ]);
  }, []);

  useEffect(() => {
    if (currentPlayer !== playerColor && !isCheckmate) {
      getBotMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, playerColor, isCheckmate]);

  const initGame = async () => {
    try {
      const data = await initBotGame();

      setGameId(data.game_id);
    } catch (error) {
      console.error("Error initializing game:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối",
        text: "Không thể kết nối với máy chủ AI. Vui lòng thử lại sau.",
      });
    }
  };

  // Remove the standalone "use client" directive from line 114
  const getBotMove = async () => {
    setBotThinking(true);
    setLoading(true);

    try {
      // Add a small delay to simulate thinking
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await getBotMoveAPI({
        gameState,
        difficulty: botDifficulty,
        player: currentPlayer,
        game_id: gameId,
      });

      // console.log("Full API response:", response);

      // Check for error in the response
      if (response.error) {
        throw new Error(`Server error: ${response.error}`);
      }

      // Handle the data property
      const moveData = response.data || response;

      // Validate that we have the necessary move information
      if (!moveData.from || !moveData.to || !moveData.piece) {
        console.error("Invalid move data:", moveData);
        throw new Error("Invalid move data received from server");
      }

      const { from, to, piece } = moveData;

      // Additional validation to ensure piece is not null
      if (!piece) {
        console.error("Received null piece in move:", moveData);
        throw new Error("Bot attempted to move a null piece");
      }

      // Process the move
      const fromKey = `${from.col}${from.row}`;
      const toKey = `${to.col}${to.row}`;

      // Make the move
      const newGameState = { ...gameState };
      delete newGameState[fromKey];
      const capturedPiece = newGameState[toKey];
      newGameState[toKey] = piece;

      // Update game state
      setGameState(newGameState);
      setSelectedPiece(null);
      setValidMoves([]);

      // Switch player
      setCurrentPlayer(playerColor);

      // Check for check and checkmate
      const board = convertGameStateToBoard(newGameState);
      const check = isKingInCheck(board, playerColor);
      const checkmate = isCheckmateFunc(board, playerColor);

      setIsCheck(check);
      setIsCheckmate(checkmate);

      // Update move history
      const newMove = {
        redMove:
          currentPlayer === "r" ? `${piece} (${fromKey} -> ${toKey})` : "",
        blackMove:
          currentPlayer === "b" ? `${piece} (${fromKey} -> ${toKey})` : "",
      };
      setMoveHistory([...moveHistory, newMove]);

      // Play sound
      if (capturedPiece) {
        captureAudio.play();
      } else {
        moveAudio.play();
      }

      // Add bot message to chat
      setChatMessages([
        ...chatMessages,
        {
          senderId: "Bot",
          content: `Tôi đã di chuyển ${piece} từ ${fromKey} đến ${toKey}${
            capturedPiece ? ` và bắt quân ${capturedPiece}` : ""
          }`,
        },
      ]);

      // Check for check and checkmate notifications
      if (check) {
        Swal.fire({
          icon: "warning",
          title: "Cảnh báo!",
          text: "Tướng của bạn đang bị chiếu!",
        });
      }

      if (checkmate) {
        Swal.fire({
          icon: "info",
          title: "Chiếu bí!",
          text: "Bot đã thắng ván cờ!",
        });
      }
    } catch (error) {
      console.error("Error getting bot move:", error);

      // More detailed error message
      let errorMessage = "Không thể lấy nước đi từ Bot.";
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += ` Server trả về lỗi: ${error.response.status}`;
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += " Không nhận được phản hồi từ server.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += ` Lỗi: ${error.message}`;
      }

      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: errorMessage,
      });

      // Reset the game to a valid state if there was an error
      initGame();
    } finally {
      setBotThinking(false);
      setLoading(false);
    }
  };

  const handleSquareClick = (row, col) => {
    // Prevent clicks during bot's turn or when game is over
    if (currentPlayer !== playerColor || isCheckmate || loading) {
      return;
    }

    const key = `${col}${row}`;
    const clickedPiece = gameState[key];

    if (selectedPiece) {
      // If clicking on another piece of the same color, select that piece instead
      if (clickedPiece && clickedPiece.endsWith(`_${currentPlayer}`)) {
        const board = convertGameStateToBoard(gameState);
        const validMoves = getValidMoves(board, { row, col }, clickedPiece);
        setSelectedPiece({ row, col });
        setValidMoves(validMoves);
        return;
      }

      // Try to move the selected piece
      movePiece(selectedPiece, { row, col });
    } else if (clickedPiece && clickedPiece.endsWith(`_${currentPlayer}`)) {
      // Select a piece
      const board = convertGameStateToBoard(gameState);
      const validMoves = getValidMoves(board, { row, col }, clickedPiece);
      setSelectedPiece({ row, col });
      setValidMoves(validMoves);
    }
  };

  const movePiece = (from, to) => {
    const fromKey = `${from.col}${from.row}`;
    const toKey = `${to.col}${to.row}`;

    // Check if the move is valid
    if (
      !validMoves.some((move) => move.row === to.row && move.col === to.col)
    ) {
      Swal.fire({
        icon: "error",
        title: "Nước đi không hợp lệ!",
        text: "Bạn không thể di chuyển quân đến vị trí này!",
      });
      return;
    }

    const movingPiece = gameState[fromKey];
    const newGameState = { ...gameState };
    delete newGameState[fromKey];
    const capturedPiece = newGameState[toKey];
    newGameState[toKey] = movingPiece;

    // Check if the move would put own king in check
    const board = convertGameStateToBoard(newGameState);
    if (isKingInCheck(board, currentPlayer)) {
      Swal.fire({
        icon: "error",
        title: "Nước đi không hợp lệ!",
        text: "Nước đi này khiến tướng của bạn bị chiếu!",
      });
      return;
    }

    // Update game state
    setGameState(newGameState);
    setSelectedPiece(null);
    setValidMoves([]);

    // Switch player
    setCurrentPlayer(currentPlayer === "r" ? "b" : "r");

    // Check for check and checkmate
    const check = isKingInCheck(board, currentPlayer === "r" ? "b" : "r");
    // console.log(isCheckmate);
    const checkmate = isCheckmateFunc(board, currentPlayer === "r" ? "b" : "r");

    setIsCheck(check);
    setIsCheckmate(checkmate);

    // Update move history
    const newMove = {
      redMove:
        currentPlayer === "r" ? `${movingPiece} (${fromKey} -> ${toKey})` : "",
      blackMove:
        currentPlayer === "b" ? `${movingPiece} (${fromKey} -> ${toKey})` : "",
    };
    setMoveHistory([...moveHistory, newMove]);

    // Play sound
    if (capturedPiece) {
      captureAudio.play();
    } else {
      moveAudio.play();
    }

    // Check for check and checkmate notifications
    if (check) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo!",
        text: `Tướng của Bot đang bị chiếu!`,
      });
    }

    if (checkmate) {
      Swal.fire({
        icon: "success",
        title: "Chiếu bí!",
        text: "Bạn đã thắng ván cờ!",
      });
    }
  };

  const handleSendChat = (message) => {
    // Add player message
    setChatMessages([
      ...chatMessages,
      {
        senderId: "Player",
        content: message,
      },
    ]);

    // Add bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "Nước đi hay đấy!",
        "Tôi đang suy nghĩ...",
        "Thú vị!",
        "Bạn chơi rất giỏi!",
        "Tôi sẽ cố gắng hơn.",
        "Đây là một ván cờ hay.",
      ];
      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      setChatMessages((prev) => [
        ...prev,
        {
          senderId: "Bot",
          content: randomResponse,
        },
      ]);
    }, 1000);
  };

  const changeDifficulty = (difficulty) => {
    setBotDifficulty(difficulty);
    localStorage.setItem("botDifficulty", difficulty);

    // Reset game
    setGameState({ ...INITIAL_GAME_STATE });
    setSelectedPiece(null);
    setValidMoves([]);
    setCurrentPlayer("r");
    setIsCheck(false);
    setIsCheckmate(false);
    setMoveHistory([]);

    // Add notification
    setChatMessages([
      ...chatMessages,
      {
        senderId: "System",
        content: `Độ khó đã được thay đổi thành ${difficulty}. Ván cờ mới đã bắt đầu.`,
      },
    ]);

    // Initialize new game
    initGame();
  };

  const handleExitGame = () => {
    // Confirm before exiting
    Swal.fire({
      title: "Bạn có chắc chắn muốn thoát?",
      text: "Tiến trình ván đấu sẽ không được lưu!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Thoát",
      cancelButtonText: "Ở lại",
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate back to home page
        navigate("/");
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-start gap-6 p-4 w-full">
      {/* Game + Info Section */}
      <div className="flex flex-col items-center w-full lg:w-2/3">
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-2xl font-bold mb-2">Chơi với Bot AI</h2>

          <div className="flex items-center space-x-2 mb-4">
            <span className="font-semibold">Độ khó:</span>
            <select
              value={botDifficulty}
              onChange={(e) => changeDifficulty(e.target.value)}
              className="border rounded px-2 py-1"
              disabled={loading}
            >
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>

            <button
              onClick={handleExitGame}
              className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
              disabled={loading}
            >
              Thoát phòng
            </button>
          </div>

          <p className="text-lg font-bold">
            Lượt chơi hiện tại:{" "}
            <span
              className={
                currentPlayer === "r" ? "text-red-600" : "text-gray-800"
              }
            >
              {currentPlayer === "r" ? "Đỏ" : "Đen"}
            </span>
            {currentPlayer !== playerColor && botThinking && (
              <span className="ml-2 text-blue-500">
                (Bot đang suy nghĩ
                <span className="animate-pulse">...</span>)
              </span>
            )}
          </p>

          <p className="text-md mt-1">
            Bạn chơi quân: <span className="text-red-600 font-bold">Đỏ</span>
          </p>

          {isCheck && (
            <p className="text-red-500 font-bold mt-2">
              Cảnh báo: Tướng đang bị chiếu!
            </p>
          )}

          {isCheckmate && (
            <p className="text-red-600 font-bold mt-2">
              Chiếu bí! {currentPlayer === "r" ? "Đen" : "Đỏ"} thắng!
            </p>
          )}
        </div>

        <div className="w-full max-w-[500px] aspect-[9/10]">
          <Board
            gameState={gameState}
            onSquareClick={handleSquareClick}
            validMoves={validMoves}
            selectedPiece={selectedPiece}
            playerColor={playerColor}
          />
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full lg:w-1/3 h-[400px]">
        <ChatBox
          moves={moveHistory}
          messages={chatMessages}
          onSendChat={handleSendChat}
        />
      </div>
    </div>
  );
};

export default BotGame;
