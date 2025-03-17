package com.btec.chinesechess_api.repositories;

import com.btec.chinesechess_api.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
