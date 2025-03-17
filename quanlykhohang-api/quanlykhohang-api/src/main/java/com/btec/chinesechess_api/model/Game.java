package com.btec.quanlykhohang_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "games") // Specify MongoDB collection
public class Game {
    @Id
    private String id;
    private String boardState;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBoardState() { return boardState; }
    public void setBoardState(String boardState) { this.boardState = boardState; }
}