package com.btec.quanlykhohang_api.services;

import com.btec.quanlykhohang_api.entities.Move;
import com.btec.quanlykhohang_api.repositories.MoveRepository;
import com.btec.quanlykhohang_api.websocket.ChessMove;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MoveServiceImpl implements MoveService {

    @Autowired
    private MoveRepository moveRepository;

    @Override
    public boolean isValidMove(ChessMove move) {
        // TODO: Thêm logic kiểm tra tính hợp lệ của nước đi theo luật cờ tướng
        return move.getFrom() != null && move.getTo() != null;
    }

    @Override
    public void saveMove(ChessMove move) {
        Move moveEntity = new Move();
        moveEntity.setGameId(move.getGameId()); // Sửa từ setRoomId thành setGameId
        moveEntity.setPlayerId(move.getPlayerId());
        moveEntity.setFromPosition(move.getFrom());
        moveEntity.setToPosition(move.getTo());

        moveRepository.save(moveEntity);
    }
}