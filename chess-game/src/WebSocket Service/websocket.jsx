import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socketUrl = "http://localhost:8080/ws";

let stompClient = null;

export const connectWebSocket = (roomId, onMoveReceived) => {
  const token = localStorage.getItem("jwtToken");
  const socket = new SockJS(socketUrl);

  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      console.log("✅ Connected to WebSocket", frame);
      stompClient.subscribe(`/topic/${roomId}`, (message) => {
        console.log("📩 Raw message:", message);
        const body = JSON.parse(message.body);
        console.log("📩 Received move:", body);
        onMoveReceived(body);
      });
    },
    onDisconnect: () => {
      console.log("❌ Disconnected from WebSocket");
    },
    onStompError: (frame) => {
      console.error("⚠️ STOMP error:", frame);
    },
    onWebSocketError: (error) => {
      console.error("⚠️ WebSocket error:", error);
    },
  });

  stompClient.activate();
};

export const sendMove = (roomId, move) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/move/${roomId}`,
      body: JSON.stringify(move),
    });
    console.log("📤 Move sent:", move);
  } else {
    console.error("❌ Cannot send move, WebSocket not connected");
  }
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    console.log("🔌 WebSocket disconnected");
  }
};
