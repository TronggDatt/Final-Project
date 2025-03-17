package com.btec.chinesechess_api.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends MongoRepository<com.btec.chinesechess_api.model.Game, Long> {}
