package com.btec.quanlykhohang_api.controllers;

import com.btec.quanlykhohang_api.entities.Move;
import com.btec.quanlykhohang_api.repositories.MoveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/moves")
public class MoveController {

    @Autowired
    private MoveRepository moveRepository;

    @PostMapping("/add")
    public Move addMove(@RequestBody Move move) {
        return moveRepository.save(move);
    }

    @GetMapping("/game/{gameId}")
    public List<Move> getMoves(@PathVariable String gameId) {
        return moveRepository.findAll().stream()
                .filter(m -> m.getRoomId().equals(gameId))
                .toList();
    }
}