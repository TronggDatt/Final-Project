package com.btec.quanlykhohang_api.services;

import com.btec.quanlykhohang_api.entities.Move;
import com.btec.quanlykhohang_api.repositories.MoveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MoveServiceImpl implements MoveService {

    @Autowired
    private MoveRepository moveRepository;

    @Override
    public boolean isValidMove(Move move) {
        // TODO: Thêm logic kiểm tra tính hợp lệ của nước đi theo luật cờ tướng
        return move.getFrom() != null && move.getTo() != null;
    }

    @Override
    public void saveMove(Move move) {
        Move moveEntity = new Move();
        moveEntity.setRoomId(move.getRoomId());
        moveEntity.setPiece(move.getPiece());
        moveEntity.setFrom(move.getFrom());
        moveEntity.setTo(move.getTo());
        moveEntity.setPlayerId(move.getPlayerId());

        moveRepository.save(moveEntity);
    }
}