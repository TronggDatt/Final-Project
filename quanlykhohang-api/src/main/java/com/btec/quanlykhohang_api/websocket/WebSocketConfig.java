package com.btec.quanlykhohang_api.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Sửa đổi: dùng setAllowedOriginPatterns thay cho setAllowedOrigins để tránh lỗi CORS hiện đại
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Quan trọng cho frontend từ localhost:3000
                .withSockJS(); // Kích hoạt fallback SockJS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Đích để client subscribe
        registry.enableSimpleBroker("/topic");

        // Đích để client gửi message đến
        registry.setApplicationDestinationPrefixes("/app");
    }
}
