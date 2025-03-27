package com.btec.quanlykhohang_api.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class GameWebSocketController {
    @MessageMapping("/move/{roomId}")
    @SendTo("/topic/{roomId}")
    public ChessMove handleMove(@DestinationVariable String roomId, ChessMove move) {
        System.out.println("Move in Room " + roomId + ": " + move);
        return move;
    }
}
