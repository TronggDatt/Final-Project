package com.btec.quanlykhohang_api.services;

import com.btec.quanlykhohang_api.websocket.ChessMove;

public interface MoveService {
    boolean isValidMove(ChessMove move);
    void saveMove(ChessMove move);
}