package com.btec.quanlykhohang_api.dtos;

public class ChatMessage {
    private String gameId;
    private String senderId;
    private String content;

    public ChatMessage() {}

    public ChatMessage(String gameId, String senderId, String content) {
        this.gameId = gameId;
        this.senderId = senderId;
        this.content = content;
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}