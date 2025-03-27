package com.btec.quanlykhohang_api.websocket;

public class ChessMove {
    private String roomId;
    private String fromPosition;
    private String toPosition;

    public ChessMove() {}

    public ChessMove(String roomId, String fromPosition, String toPosition) {
        this.roomId = roomId;
        this.fromPosition = fromPosition;
        this.toPosition = toPosition;
    }

    public String getRoomId() { return roomId; }
    public String getFromPosition() { return fromPosition; }
    public String getToPosition() { return toPosition; }

    @Override
    public String toString() {
        return "Move from " + fromPosition + " to " + toPosition + " in room " + roomId;
    }
}

