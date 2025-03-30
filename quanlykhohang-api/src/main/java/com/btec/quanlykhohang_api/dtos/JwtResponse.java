package com.btec.quanlykhohang_api.dtos;

public class JwtResponse {
    private String token;
    private String role;

    private String fullname;

    public JwtResponse() {}

    public JwtResponse(String token, String role, String fullname) {
        this.token = token;
        this.role = role;
        this.fullname = fullname;
    }

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

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }
}
