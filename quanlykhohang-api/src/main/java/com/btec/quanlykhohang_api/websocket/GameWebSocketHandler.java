package com.btec.quanlykhohang_api.websocket;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GameWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> players = new ConcurrentHashMap<>();
    private final Map<String, String> rooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("Người chơi kết nối: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("Nhận tin nhắn: " + payload);

        if (payload.startsWith("CREATE_ROOM")) {
            String roomId = session.getId();
            rooms.put(roomId, session.getId());
            players.put(session.getId(), session);
//            session.sendMessage(new TextMessage("ROOM_CREATED " + roomId));
        }
        else if (payload.startsWith("JOIN_ROOM")) {
            String[] parts = payload.split(" ");
            if (parts.length < 2) return;
            String roomId = parts[1];

            if (rooms.containsKey(roomId)) {
                players.put(session.getId(), session);
//                session.sendMessage(new TextMessage("JOINED " + roomId));
            } else {
                session.sendMessage(new TextMessage("ROOM_NOT_FOUND"));
            }
        }
        else if (payload.startsWith("MOVE")) {
            broadcastMove(payload);
        }
        else if (payload.startsWith("CHAT")) {
            broadcastChat(payload);
        }
    }

    private void broadcastMove(String move) {
        players.values().forEach(session -> {
            try {
                session.sendMessage(new TextMessage("MOVE " + move));
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private void broadcastChat(String chatMessage) {
        players.values().forEach(session -> {
            try {
                session.sendMessage(new TextMessage("CHAT " + chatMessage));
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}