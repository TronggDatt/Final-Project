package com.btec.quanlykhohang_api.controllers;

import com.btec.quanlykhohang_api.entities.Game;
import com.btec.quanlykhohang_api.repositories.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private GameRepository gameRepository;

    @PostMapping("/create")
    public Game createGame(@RequestBody Game game) {
        game.setStatus("ONGOING");
        return gameRepository.save(game);
    }

    @GetMapping("/{id}")
    public Game getGame(@PathVariable String id) {
        return gameRepository.findById(id).orElse(null);
    }

    @GetMapping
    public List<Game> allGames() {
        return gameRepository.findAll();
    }
}
