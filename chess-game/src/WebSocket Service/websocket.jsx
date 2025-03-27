import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socketUrl = "http://localhost:8080/ws"; // Chính xác backend WebSocket URL

let stompClient = null;

export const connectWebSocket = (roomId, onMoveReceived) => {
  const token = localStorage.getItem("jwtToken");
  const socket = new SockJS(socketUrl); // Tạo SockJS kết nối với backend

  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {}, // Truyền token nếu có
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log("✅ Connected to WebSocket");

      stompClient.subscribe(`/topic/${roomId}`, (message) => {
        const body = JSON.parse(message.body);
        console.log("📩 Received move:", body);
        onMoveReceived(body);
      });
    },
    onDisconnect: () => {
      console.log("❌ Disconnected from WebSocket");
    },
    onStompError: (frame) => {
      console.error("⚠️ WebSocket error:", frame);
    },
  });

  stompClient.activate();
};

// Hàm gửi nước đi (move) lên server
export const sendMove = (roomId, move) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/move/${roomId}`, // Phải khớp với backend @MessageMapping("/move/{roomId}")
      body: JSON.stringify(move),
    });
    console.log("📤 Move sent:", move);
  } else {
    console.error("❌ Cannot send move, WebSocket not connected");
  }
};

// Hàm ngắt kết nối WebSocket
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    console.log("🔌 WebSocket disconnected");
  }
};
