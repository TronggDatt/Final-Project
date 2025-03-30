import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let roomId = null;
let messageCallback = null;
let readyCallback = null;

export function connectWebSocket(
  gameRoomId,
  onMessage,
  onReadyStatus,
  onReceiveChat
) {
  roomId = gameRoomId;
  messageCallback = onMessage;
  readyCallback = onReadyStatus;

  const socket = new SockJS("http://localhost:8081/ws"); // nhớ sửa lại port nếu cần
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      // console.log("✅ WebSocket connected to room:", roomId);

      // Nhận nước đi mới
      stompClient.subscribe(`/topic/${roomId}`, (message) => {
        const move = JSON.parse(message.body);
        // console.log("📩 Move nhận được:", move);
        messageCallback(move);
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
        onReceiveChat && onReceiveChat(chat);
      });
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

// Ngắt kết nối WebSocket
export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    // console.log("🛑 Disconnected from WebSocket");
  }
}
