package com.btec.chinesechess_api.dto;

public class LoginResponse {
    private String token;

    public LoginResponse(String token) {
        this.token = token;
    }

    // Thêm Getter
    public String getToken() {
        return token;
    }
}
