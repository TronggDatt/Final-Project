package com.btec.quanlykhohang_api.websocket;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ChessMove {
    private String roomId;
    private String fromPosition;
    private String toPosition;

    @JsonCreator
    public ChessMove(
            @JsonProperty("roomId") String roomId,
            @JsonProperty("fromPosition") String fromPosition,
            @JsonProperty("toPosition") String toPosition
    ) {
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

