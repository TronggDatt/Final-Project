package com.btec.quanlykhohang_api.controllers;

import com.btec.quanlykhohang_api.dtos.JwtResponse;
import com.btec.quanlykhohang_api.dtos.LoginRequest;
import com.btec.quanlykhohang_api.dtos.RegisterRequest;
import com.btec.quanlykhohang_api.entities.User;
import com.btec.quanlykhohang_api.repositories.UserRepository;
import com.btec.quanlykhohang_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        // 1️⃣ Kiểm tra xem email đã tồn tại chưa
        Optional<User> existingUser = userRepository.findByEmail(registerRequest.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // 2️⃣ Kiểm tra password và confirmPassword
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        // 3️⃣ Mã hóa password
        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());

        // 4️⃣ Tạo User mới
        User newUser = new User();
        newUser.setFullname(registerRequest.getFullName());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(encodedPassword);
        newUser.setRole("USER"); // Mặc định role là USER, bạn có thể chỉnh sửa

        // 5️⃣ Lưu vào database
        userRepository.save(newUser);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> existingUserOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())) {
                String token = jwtUtil.generateToken(existingUser.getEmail());
                return ResponseEntity.ok(new JwtResponse(token, existingUser.getRole()));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect email or password");
    }
}
