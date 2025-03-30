package com.btec.quanlykhohang_api.repositories;

import com.btec.quanlykhohang_api.entities.Move;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MoveRepository extends MongoRepository<Move, String> {
    List<Move> findByRoomId(String roomId); // Lấy tất cả bước đi theo phòng (gameId)
}