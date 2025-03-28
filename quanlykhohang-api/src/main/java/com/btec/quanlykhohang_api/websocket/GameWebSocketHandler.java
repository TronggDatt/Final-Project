package com.btec.quanlykhohang_api.websocket;

import com.btec.quanlykhohang_api.dtos.ChatMessage;
import com.btec.quanlykhohang_api.services.MoveService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, List<WebSocketSession>> rooms = new HashMap<>();

    @Autowired
    private MoveService moveService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomId = extractRoomId(session);
        String playerId = (String) session.getAttributes().get("playerId");

        rooms.computeIfAbsent(roomId, k -> new CopyOnWriteArrayList<>()).add(session);
        broadcastToRoom(roomId, "Player " + playerId + " has joined the room", session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String roomId = extractRoomId(session);
        String playerId = (String) session.getAttributes().get("playerId");
        String payload = message.getPayload();

        Map<String, String> messageData = objectMapper.readValue(payload, Map.class);
        String type = messageData.get("type");

        if ("chat".equals(type)) {
            ChatMessage chatMessage = new ChatMessage(roomId, playerId, messageData.get("content"));
            String chatPayload = objectMapper.writeValueAsString(chatMessage);
            broadcastToRoom(roomId, chatPayload, session);
        } else if ("move".equals(type)) {
            ChessMove chessMove = new ChessMove(
                    roomId, // Vẫn dùng roomId từ WebSocket, nhưng ánh xạ sang gameId trong ChessMove
                    playerId,
                    messageData.get("from"),
                    messageData.get("to")
            );

            if (moveService.isValidMove(chessMove)) {
                moveService.saveMove(chessMove);
                String movePayload = objectMapper.writeValueAsString(chessMove);
                broadcastToRoom(roomId, movePayload, session);
            } else {
                session.sendMessage(new TextMessage("Invalid move"));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String roomId = extractRoomId(session);
        String playerId = (String) session.getAttributes().get("playerId");

        List<WebSocketSession> roomSessions = rooms.get(roomId);
        if (roomSessions != null) {
            roomSessions.remove(session);
            if (roomSessions.isEmpty()) {
                rooms.remove(roomId);
            }
        }

        broadcastToRoom(roomId, "Player " + playerId + " has left the room", session);
    }

    private void broadcastToRoom(String roomId, String message, WebSocketSession sender) throws Exception {
        List<WebSocketSession> roomSessions = rooms.get(roomId);
        if (roomSessions != null) {
            for (WebSocketSession session : roomSessions) {
                if (session.isOpen() && !session.equals(sender)) {
                    session.sendMessage(new TextMessage(message));
                }
            }
        }
    }

    private String extractRoomId(WebSocketSession session) {
        String path = session.getUri().getPath();
        return path.substring(path.lastIndexOf("/") + 1);
    }
}