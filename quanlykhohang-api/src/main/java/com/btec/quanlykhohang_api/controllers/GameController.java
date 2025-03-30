package com.btec.quanlykhohang_api.controllers;

import com.btec.quanlykhohang_api.entities.Game;
import com.btec.quanlykhohang_api.repositories.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "*")
public class GameController {

    @Autowired
    private GameRepository gameRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createGame(@RequestBody Game game) {
        try {
            game.setStatus("ONGOING");
            game.setMoves(new ArrayList<>()); // Đảm bảo không null
            Game savedGame = gameRepository.save(game);
            return ResponseEntity.ok(savedGame);
        } catch (Exception e) {
            e.printStackTrace(); // In ra lỗi trong console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create game: " + e.getMessage());
        }
    }


    @GetMapping("/{id}")
    public Game getGame(@PathVariable String id) {
        return gameRepository.findById(id).orElse(null);
    }

    @GetMapping
    public List<Game> allGames() {
        return gameRepository.findAll();
    }

    // ✅ API để người chơi tham gia phòng
    @GetMapping("/{gameId}/join")
    public ResponseEntity<String> joinGame(@PathVariable String gameId, @RequestParam String email) {
        try {
            System.out.println("🔔 Join request: gameId = " + gameId + ", email = " + email);

            Optional<Game> optionalGame = gameRepository.findById(gameId);
            if (optionalGame.isEmpty()) {
                System.out.println("❌ Game not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Game not found");
            }

            Game game = optionalGame.get();
            System.out.println("✅ Game found: " + game);

            if (game.getPlayer1() == null) {
                game.setPlayer1(email);
                game.setStatus("WAITING");
                gameRepository.save(game);
                return ResponseEntity.ok("r");
            }

            if (game.getPlayer2() == null && !game.getPlayer1().equals(email)) {
                game.setPlayer2(email);
                game.setStatus("READY");
                gameRepository.save(game);
                return ResponseEntity.ok("b");
            }

            if (email.equals(game.getPlayer1())) {
                return ResponseEntity.ok("r");
            } else if (email.equals(game.getPlayer2())) {
                return ResponseEntity.ok("b");
            }

            System.out.println("🚫 Room full");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Room full");
        } catch (Exception e) {
            e.printStackTrace(); // ✅ Quan trọng để xem stacktrace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Server error: " + e.getMessage());
        }
    }
}
