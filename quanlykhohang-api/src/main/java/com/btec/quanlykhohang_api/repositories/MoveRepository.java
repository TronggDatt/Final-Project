package com.btec.quanlykhohang_api.repositories;

import com.btec.quanlykhohang_api.entities.Move;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MoveRepository extends MongoRepository<Move, String> { }

