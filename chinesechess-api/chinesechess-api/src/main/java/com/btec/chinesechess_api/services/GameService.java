package com.btec.chinesechess_api.services;

import com.btec.chinesechess_api.model.Game;
import com.btec.chinesechess_api.repositories.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameService {
    @Autowired
    private GameRepository repository;

    public List<Game> getAllGames() { return repository.findAll(); }
    public Game getGameById(Long id) { return repository.findById(id).orElse(null); }
    public Game saveGame(Game game) { return repository.save(game); }
}
