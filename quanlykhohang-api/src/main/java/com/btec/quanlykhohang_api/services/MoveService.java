package com.btec.quanlykhohang_api.services;

import com.btec.quanlykhohang_api.entities.Move;

public interface MoveService {
    boolean isValidMove(Move move);
    void saveMove(Move move);
}