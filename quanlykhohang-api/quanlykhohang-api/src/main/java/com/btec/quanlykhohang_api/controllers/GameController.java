package com.btec.quanlykhohang_api.controllers;

import com.btec.quanlykhohang_api.model.Game;
import com.btec.quanlykhohang_api.services.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {
    @Autowired
    private GameService service;

    @GetMapping
    public List<Game> getAllGames() { return service.getAllGames(); }

    @GetMapping("/{id}")
    public Game getGame(@PathVariable Long id) { return service.getGameById(id); }

    @PostMapping
    public Game createGame(@RequestBody Game game) { return service.saveGame(game); }
}

