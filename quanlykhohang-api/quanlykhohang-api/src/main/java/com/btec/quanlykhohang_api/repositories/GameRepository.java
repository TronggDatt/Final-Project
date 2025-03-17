package com.btec.quanlykhohang_api.repositories;

import com.btec.quanlykhohang_api.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends MongoRepository<Game, Long> {}
