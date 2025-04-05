package com.btec.quanlykhohang_api.dtos;

import com.btec.quanlykhohang_api.entities.Player;

import java.util.List;

public class PlayerJoinResponse {
    private List<Player> players;

    public PlayerJoinResponse(List<Player> players) {
        this.players = players;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public void setPlayers(List<Player> players) {
        this.players = players;
    }
}
