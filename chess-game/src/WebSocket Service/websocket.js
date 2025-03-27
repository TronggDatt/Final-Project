import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socketUrl = "http://localhost:8080/ws"; // Adjust backend URL & port if necessary

let stompClient = null;

export const connectWebSocket = (roomId, onMoveReceived) => {
  // Connect to SockJS endpoint
  const socket = new SockJS(socketUrl);

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000, // Reconnect every 5s if disconnected
    onConnect: () => {
      console.log("Connected to WebSocket");
      // Subscribe to the room's topic
      stompClient.subscribe(`/topic/${roomId}`, (message) => {
        const body = JSON.parse(message.body);
        console.log("Received move:", body);
        onMoveReceived(body); // Callback to handle incoming moves
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from WebSocket");
    },
    onStompError: (frame) => {
      console.error("WebSocket error:", frame);
    },
  });

  stompClient.activate();
};

export const sendMove = (roomId, move) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/move/${roomId}`, // Matches Spring Controller @MessageMapping
      body: JSON.stringify(move),
    });
  }
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
  }
};
