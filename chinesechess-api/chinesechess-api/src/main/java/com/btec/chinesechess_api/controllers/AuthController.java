package com.btec.chinesechess_api.controllers;

import com.btec.chinesechess_api.dto.LoginRequest;
import com.btec.chinesechess_api.dto.LoginResponse;
import com.btec.chinesechess_api.entity.User;
import com.btec.chinesechess_api.security.JwtUtil;
import com.btec.chinesechess_api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.btec.chinesechess_api.dto.RegisterRequest;
import com.btec.chinesechess_api.services.UserService;
import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    // Login API
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Tìm user theo email
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty() || !optionalUser.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        User user = optionalUser.get();
        // Tạo JWT token
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token));
    }

    // Register API
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        boolean userExists = userService.checkUserExists(request.getEmail());
        if (userExists) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        userService.createUser(request.getName(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok().body("User registered successfully");
    }
}
