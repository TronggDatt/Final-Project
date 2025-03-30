package com.btec.quanlykhohang_api.entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "game")
public class Game {
    @Id
    private String id;
    private String player1;
    private String player2;
    private String status; // ONGOING, FINISHED

    @Transient
    private List<Move> moves;

    public Game() {
        this.moves = new ArrayList<>();
    }

    public Game(String id, String player1, String player2, String status, List<Move> moves) {
        this.id = id;
        this.player1 = player1;
        this.player2 = player2;
        this.status = status;
        this.moves = moves;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPlayer1() {
        return player1;
    }

    public void setPlayer1(String player1) {
        this.player1 = player1;
    }

    public String getPlayer2() {
        return player2;
    }

    public void setPlayer2(String player2) {
        this.player2 = player2;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Move> getMoves() {
        return moves;
    }

    public void setMoves(List<Move> moves) {
        this.moves = moves;
    }
}
