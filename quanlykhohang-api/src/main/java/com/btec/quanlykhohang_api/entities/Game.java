package com.btec.quanlykhohang_api.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Game {
    @Id
    private String id;
    private String player1;
    private String player2;
    private String status; // ONGOING, FINISHED
    private List<Move> moves;
}

