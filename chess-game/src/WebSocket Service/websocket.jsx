import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let roomId = null;
let messageCallback = null;
let readyCallback = null;
let chatCallback = null;
let playerJoinCallback = null;

export function connectWebSocket(
  gameRoomId,
  onMessage,
  onReadyStatus,
  onReceiveChat,
  onPlayerJoin
) {
  roomId = gameRoomId;
  messageCallback = onMessage;
  readyCallback = onReadyStatus;
  chatCallback = onReceiveChat;
  playerJoinCallback = onPlayerJoin;

  const socket = new SockJS("http://localhost:8080/ws"); // nhớ sửa lại port nếu cần
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      console.log("✅ WebSocket connected to room:", roomId);

      // Nhận nước đi mới
      stompClient.subscribe(`/topic/${roomId}`, (message) => {
        try {
          const move = JSON.parse(message.body);
          console.log("📩 Move nhận được:", move);
          messageCallback(move);
        } catch (e) {
          console.error("Lỗi khi xử lý thông điệp nước đi:", e);
        }
      });

      stompClient.subscribe(`/topic/ready/${roomId}`, (message) => {
        const readyStatus = JSON.parse(message.body);
        // console.log("📩 Ready status:", readyStatus);
        readyCallback(readyStatus);
      });

      // Nhận tin nhắn chat
      stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
        const chat = JSON.parse(message.body);
        // console.log("📨 Nhận chat từ WebSocket:", chat);
        //
        chatCallback && chatCallback(chat);
      });

      // Nhận thông báo người chơi tham gia
      stompClient.subscribe(`/topic/players/${roomId}`, (message) => {
        const playerData = JSON.parse(message.body);
        console.log("📨 Nhận thông tin người chơi:", playerData);
        playerJoinCallback && playerJoinCallback(playerData);
      });

      // Lưu socket vào window để có thể truy cập từ bất kỳ đâu
      if (typeof window !== "undefined") {
        window.socket = stompClient;
      }

      // if (connectionTimeout) {
      //   clearTimeout(connectionTimeout);
      // }

      // QUAN TRỌNG: Gửi yêu cầu tham gia phòng ngay sau khi kết nối thành công
      setTimeout(() => {
        const playerId = localStorage.getItem("email") || "unknown";
        console.log("🚀 Gửi yêu cầu tham gia phòng:", roomId, playerId);
        sendJoinRoom(roomId, playerId);
      }, 500);
    },
    onStompError: (frame) => {
      // console.error("❌ STOMP error", frame);
    },
  });

  stompClient.activate();
}

// Gửi nước đi
export function sendMove(gameId, moveData) {
  if (stompClient && stompClient.connected) {
    // console.log("Sending move:", moveData);
    stompClient.publish({
      destination: `/app/move/${gameId}`,
      body: JSON.stringify(moveData),
    });
  }
}

// Gửi trạng thái "Ready" của người chơi
export function sendReadyState(gameId, playerId) {
  if (stompClient && stompClient.connected && gameId) {
    stompClient.publish({
      destination: `/app/ready/${gameId}/${playerId}`,
      body: "",
    });
  }
}

export const sendChatMessage = (roomId, playerId, message) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(message),
    });
  }
};

// Gửi thông báo tham gia phòng
export const sendJoinRoom = (gameId, playerId) => {
  if (stompClient && stompClient.connected) {
    console.log("Sending join room request:", gameId, playerId);
    stompClient.publish({
      destination: `/app/join/${gameId}`,
      body: JSON.stringify({
        type: "JOIN_ROOM",
        gameId: gameId,
        playerId: playerId,
      }),
    });
  } else {
    console.error("WebSocket is not connected yet. Will retry in 1 second.");
    // setTimeout(() => sendJoinRoom(gameId, playerId), 1000);
  }
};

// Ngắt kết nối WebSocket
export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    console.log("🛑 Disconnected from WebSocket");
    if (typeof window !== "undefined") {
      window.socket = null;
    }
  }
}
