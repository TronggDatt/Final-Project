package com.btec.quanlykhohang_api.repositories;

import com.btec.quanlykhohang_api.entities.Game;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends MongoRepository<Game, String> {
}
