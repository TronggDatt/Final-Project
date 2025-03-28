package com.btec.quanlykhohang_api.websocket;

import com.btec.quanlykhohang_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                                   @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) throws Exception {
        // Lấy token từ query parameter (ví dụ: ws://localhost:8080/game/123?token=abc)
        String query = request.getURI().getQuery();
        String token = null;
        if (query != null && query.contains("token=")) {
            token = query.split("token=")[1];
        }

        if (token == null) {
            return false; // Không có token, từ chối kết nối
        }

        // Xác thực token
        String playerId = jwtUtil.getEmailFromToken(token); // Sửa getUsernameFromToken thành getEmailFromToken
        if (playerId == null || !jwtUtil.verifyToken(token)) { // Sửa validateToken thành verifyToken
            return false; // Token không hợp lệ, từ chối kết nối
        }

        // Lưu playerId vào attributes để sử dụng trong GameWebSocketHandler
        attributes.put("playerId", playerId);
        return true;
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                               @NonNull WebSocketHandler wsHandler, Exception exception) {
        // Không cần xử lý sau handshake
    }
}