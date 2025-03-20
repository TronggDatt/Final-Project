import { BASE_URL } from "./api";

const API_BASE_URL = `${BASE_URL}/api/auth`;

export const register = async (fullName, email, password, confirmPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fullName, email, password, confirmPassword }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        
        return await response.text(); // Success message
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        
        return await response.json(); // JWT response
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};


export const validateByToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/validate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      return await response.json();
    } catch (error) {
      console.error("Token validation failed:", error);
      throw error;
    }
  };