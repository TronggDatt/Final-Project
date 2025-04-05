package com.btec.quanlykhohang_api.websocket;

import com.btec.quanlykhohang_api.dtos.ChatMessage;
import com.btec.quanlykhohang_api.dtos.JoinRequest;
import com.btec.quanlykhohang_api.dtos.PlayerJoinResponse;
import com.btec.quanlykhohang_api.entities.Game;
import com.btec.quanlykhohang_api.entities.Move;
import com.btec.quanlykhohang_api.entities.Player;
import com.btec.quanlykhohang_api.repositories.GameRepository;
import com.btec.quanlykhohang_api.repositories.MoveRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class GameWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final MoveRepository moveRepository;

    @Autowired
    private GameRepository gameRepository;

    // Map<roomId, Set<playerId>>
    private final Map<String, Set<String>> roomReadyMap = new HashMap<>();
    private final Map<String, List<Player>> playersByRoom = new ConcurrentHashMap<>();

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

    @MessageMapping("/join/{gameId}")
    @SendTo("/topic/players/{gameId}")
    public PlayerJoinResponse handlePlayerJoin(@DestinationVariable String gameId, JoinRequest request) {
        String playerId = request.getPlayerId();
        System.out.println("WebSocket JOIN_ROOM: gameId=" + gameId + ", playerId=" + playerId);

        // Lấy thông tin game từ database
        Optional<Game> optionalGame = gameRepository.findById(gameId);
        if (optionalGame.isEmpty()) {
            System.out.println("Game not found: " + gameId);

            // Nếu game không tồn tại, tạo game mới
            try {
                Game newGame = new Game();
                newGame.setId(gameId);
                newGame.setPlayer1(playerId);
                newGame.setStatus("WAITING");
                newGame = gameRepository.save(newGame);
                System.out.println("Created new game: " + newGame.getId());

                // Tạo danh sách người chơi mới
                List<Player> players = new ArrayList<>();
                Player newPlayer = new Player(playerId, "r"); // Người chơi đầu tiên là quân đỏ
                players.add(newPlayer);
                playersByRoom.put(gameId, players);

                return new PlayerJoinResponse(players);
            } catch (Exception e) {
                System.err.println("Error creating game: " + e.getMessage());
                return new PlayerJoinResponse(new ArrayList<>());
            }
        }
        Game game = optionalGame.get();
        System.out.println("Game found: " + game.getId() + ", player1=" + game.getPlayer1() + ", player2=" + game.getPlayer2());

        // Lấy danh sách người chơi trong phòng
        List<Player> players = playersByRoom.computeIfAbsent(gameId, k -> new ArrayList<>());

        // Kiểm tra xem người chơi đã tồn tại trong phòng chưa
        Optional<Player> existingPlayer = players.stream()
                .filter(p -> p.getId().equals(playerId))
                .findFirst();

        if (existingPlayer.isPresent()) {
            // Người chơi đã tồn tại, trả về thông tin hiện tại
            System.out.println("Player already exists in room: " + playerId);
            return new PlayerJoinResponse(players);
        }

        // Xác định màu quân dựa trên thông tin từ database
        String color = null;

        if (playerId.equals(game.getPlayer1())) {
            color = "r"; // Người chơi 1 là quân đỏ
            System.out.println("Assigning RED to player: " + playerId);
        } else if (playerId.equals(game.getPlayer2())) {
            color = "b"; // Người chơi 2 là quân đen
            System.out.println("Assigning BLACK to player: " + playerId);
        } else {
            // Nếu chưa có trong database, thêm vào
            if (game.getPlayer1() == null) {
                game.setPlayer1(playerId);
                game.setStatus("WAITING");
                color = "r";
                gameRepository.save(game);
                System.out.println("Added as player1 (RED): " + playerId);
            } else if (game.getPlayer2() == null && !game.getPlayer1().equals(playerId)) {
                game.setPlayer2(playerId);
                game.setStatus("READY");
                color = "b";
                gameRepository.save(game);
                System.out.println("Added as player2 (BLACK): " + playerId);
            } else {
                // Phòng đã đầy hoặc lỗi
                System.out.println("Room full or error");
                return new PlayerJoinResponse(players);
            }
        }

        // Thêm người chơi mới vào danh sách
        Player newPlayer = new Player(playerId, color);

        // Xóa người chơi cũ nếu có (để tránh trùng lặp)
        players.removeIf(p -> p.getId().equals(playerId));

        // Thêm người chơi mới
        players.add(newPlayer);

        System.out.println("Updated players list: " + players.size() + " players");
//        for (Player p : players) {
//            System.out.println("- " + p.getId() + ": " + p.getColor());
//        }

        // Lưu lại vào map toàn cục
        playersByRoom.put(gameId, players);

        return new PlayerJoinResponse(players);
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
