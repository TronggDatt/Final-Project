package com.btec.chinesechess_api.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;

    // Thêm Getter
    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    // Optional: Constructor, Setter nếu cần
}