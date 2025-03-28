package com.btec.quanlykhohang_api.websocket;

public class ChessMove {
    private String gameId;
    private String playerId;
    private String from;
    private String to;

    public ChessMove() {}

    public ChessMove(String gameId, String playerId, String from, String to) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.from = from;
        this.to = to;
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }
}