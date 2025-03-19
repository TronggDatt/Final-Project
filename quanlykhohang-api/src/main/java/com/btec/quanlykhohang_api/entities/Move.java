package com.btec.quanlykhohang_api.entities;

import jakarta.persistence.Entity;
import org.springframework.data.annotation.Id;

@Entity
public class Move {

    @Id
    private String id;

    private String gameId; // Add this

    // Other fields...

    // Getter and Setter
    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }
}
