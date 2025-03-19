package com.btec.quanlykhohang_api.dtos;

public class JwtResponse {
    private String token;
    private String role;

    // Constructors
    public JwtResponse() {
    }

    public JwtResponse(String token, String role) {
        this.token = token;
        this.role = role;
    }

    // Getters & Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

