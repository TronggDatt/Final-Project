package com.btec.chinesechess_api.services;

import com.btec.chinesechess_api.entity.User;
import com.btec.chinesechess_api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Kiểm tra user tồn tại
    public boolean checkUserExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // Tạo user mới
    public void createUser(String name, String email, String password) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        userRepository.save(user);
    }
}
