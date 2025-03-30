package com.btec.quanlykhohang_api.entities;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "move")
public class Move {
    private Position from;
    private Position to;
    private String piece;
    private String roomId;
    private String playerId;

    public Move() {}

    public Move(Position from, Position to, String piece, String roomId, String playerId) {
        this.from = from;
        this.to = to;
        this.piece = piece;
        this.roomId = roomId;
        this.playerId = playerId;
    }

    public Position getFrom() { return from; }
    public void setFrom(Position from) { this.from = from; }

    public Position getTo() { return to; }
    public void setTo(Position to) { this.to = to; }

    public String getPiece() { return piece; }
    public void setPiece(String piece) { this.piece = piece; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public static class Position {
        private int row;
        private int col;

        public Position() {}

        public Position(int row, int col) {
            this.row = row;
            this.col = col;
        }

        public int getRow() { return row; }
        public void setRow(int row) { this.row = row; }

        public int getCol() { return col; }
        public void setCol(int col) { this.col = col; }
    }
}