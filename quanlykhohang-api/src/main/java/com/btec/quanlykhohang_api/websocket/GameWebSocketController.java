package com.btec.quanlykhohang_api.websocket;

import com.btec.quanlykhohang_api.dtos.ChatMessage;
import com.btec.quanlykhohang_api.entities.Move;
import com.btec.quanlykhohang_api.repositories.MoveRepository;
import com.btec.quanlykhohang_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class GameWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MoveRepository moveRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Quản lý trạng thái "Sẵn sàng" của từng phòng
    private final Map<String, Map<String, Boolean>> gameReadyStatus = new ConcurrentHashMap<>();

    @MessageMapping("/move/{gameId}")
    public void handleMove(@DestinationVariable String gameId, @Payload ChessMove move) {
        // Lưu nước đi vào database
        Move moveEntity = new Move();
        moveEntity.setGameId(gameId);
        moveEntity.setPlayerId(move.getPlayerId());
        moveEntity.setFromPosition(move.getFrom());
        moveEntity.setToPosition(move.getTo());
        moveRepository.save(moveEntity);

        // Broadcast nước đi đến tất cả client trong phòng
        System.out.println("📤 Broadcasting move to /topic/" + gameId);
        messagingTemplate.convertAndSend("/topic/" + gameId, move);
    }

    @MessageMapping("/chat/{gameId}")
    public void handleChat(@DestinationVariable String gameId, @Payload ChatMessage chatMessage) {
        // Broadcast tin nhắn chat đến tất cả client trong phòng
        messagingTemplate.convertAndSend("/topic/" + gameId, chatMessage);
    }

    @MessageMapping("/ready/{gameId}/{playerId}")
    public void handleReady(@DestinationVariable String gameId, @DestinationVariable String playerId, @Payload boolean isReady) {
        gameReadyStatus.putIfAbsent(gameId, new ConcurrentHashMap<>());
        Map<String, Boolean> playersReady = gameReadyStatus.get(gameId);

        playersReady.put(playerId, isReady);

        // Kiểm tra nếu cả hai người chơi đã sẵn sàng
        if (playersReady.size() == 2 && playersReady.values().stream().allMatch(ready -> ready)) {
            messagingTemplate.convertAndSend("/topic/" + gameId, "{\"type\": \"startGame\", \"gameId\": \"" + gameId + "\"}");
            System.out.println("🎮 Game started in room: " + gameId);
        } else {
            messagingTemplate.convertAndSend("/topic/" + gameId, "{\"type\": \"waiting\", \"gameId\": \"" + gameId + "\"}");
        }
    }
}