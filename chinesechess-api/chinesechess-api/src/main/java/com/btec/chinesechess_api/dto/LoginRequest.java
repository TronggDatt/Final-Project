package com.btec.chinesechess_api.dto;

public class LoginRequest {
    private String email;
    private String password;

    // Thêm Getter
    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    // Optional: Constructor, Setter nếu cần
}

