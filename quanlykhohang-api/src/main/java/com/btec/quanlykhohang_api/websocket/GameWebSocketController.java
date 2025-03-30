package com.btec.quanlykhohang_api.websocket;

import com.btec.quanlykhohang_api.dtos.ChatMessage;
import com.btec.quanlykhohang_api.entities.Move;
import com.btec.quanlykhohang_api.repositories.MoveRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.*;

@Controller
public class GameWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final MoveRepository moveRepository;

    // Map<roomId, Set<playerId>>
    private final Map<String, Set<String>> roomReadyMap = new HashMap<>();

    public GameWebSocketController(SimpMessagingTemplate messagingTemplate, MoveRepository moveRepository) {
        this.messagingTemplate = messagingTemplate;
        this.moveRepository = moveRepository;
    }

    // Gửi nước đi tới tất cả người chơi trong phòng
    @MessageMapping("/move/{roomId}")
    public void handleMove(@DestinationVariable String roomId, Move move) {
        move.setRoomId(roomId); // đảm bảo roomId có trong move
        moveRepository.save(move); // 👉 Lưu vào MongoDB

        messagingTemplate.convertAndSend("/topic/" + roomId, move);
    }

    // Người chơi gửi trạng thái Ready
    @MessageMapping("/ready/{roomId}/{playerId}")
    public void handleReadyState(
            @DestinationVariable String roomId,
            @DestinationVariable String playerId
    ) {
        roomReadyMap.putIfAbsent(roomId, new HashSet<>());
        Set<String> readyPlayers = roomReadyMap.get(roomId);

        if (readyPlayers.contains(playerId)) {
            readyPlayers.remove(playerId); // toggle off
        } else {
            readyPlayers.add(playerId); // toggle on
        }

        boolean allReady = readyPlayers.size() >= 2;

        // 🔁 Gửi trạng thái mới cho tất cả người trong phòng
        messagingTemplate.convertAndSend("/topic/ready/" + roomId,
                new GameStatus(roomId, allReady ? "START" : "WAITING", new ArrayList<>(readyPlayers)));
    }

    @MessageMapping("/chat/{roomId}")
    public void handleChat(@DestinationVariable String roomId, ChatMessage message) {
        message.setGameId(roomId);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    // Gửi object trạng thái game
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GameStatus {
        private String roomId;
        private String status; // "WAITING" or "START"
        private List<String> readyPlayers; // danh sách người đã ready
    }
}
