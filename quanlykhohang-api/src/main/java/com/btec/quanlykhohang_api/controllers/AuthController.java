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
    public String register(@RequestBody RegisterRequest registerRequest) {
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            return "Password and Confirm Password do not match";
        }

        Optional<User> existingUserOptional = userRepository.findByEmail(registerRequest.getEmail());
        if (existingUserOptional.isPresent()) {
            return "Email already registered";
        }

        User newUser = new User();
        newUser.setFullname(registerRequest.getFullName());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setActive(true);

        userRepository.save(newUser);

        return "User registered successfully";
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
