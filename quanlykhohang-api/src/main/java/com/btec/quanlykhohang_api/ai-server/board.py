import numpy as np
from typing import Dict, List, Tuple, Optional, Any

class XiangqiBoard:
    """Representation of a Xiangqi (Chinese Chess) board"""
    
    def __init__(self, game_state=None):
        """
        Initialize the board with a given game state or the default initial state.
        
        Args:
            game_state: Dictionary mapping position keys to piece values
        """
        # Initialize empty board
        self.board = [[None for _ in range(9)] for _ in range(10)]
        
        # Set up the board with the provided game state or default
        if game_state:
            self.load_game_state(game_state)
        else:
            self.setup_initial_board()
    
    def setup_initial_board(self):
        """Set up the initial board position"""
        # Initial game state for Chinese Chess
        initial_state = {
            "00": "xe_b", "10": "ma_b", "20": "tinh_b", "30": "sy_b", "40": "tuong_b",
            "50": "sy_b", "60": "tinh_b", "70": "ma_b", "80": "xe_b",
            "12": "phao_b", "72": "phao_b",
            "03": "tot_b", "23": "tot_b", "43": "tot_b", "63": "tot_b", "83": "tot_b",
            "06": "tot_r", "26": "tot_r", "46": "tot_r", "66": "tot_r", "86": "tot_r",
            "17": "phao_r", "77": "phao_r",
            "09": "xe_r", "19": "ma_r", "29": "tinh_r", "39": "sy_r", "49": "tuong_r",
            "59": "sy_r", "69": "tinh_r", "79": "ma_r", "89": "xe_r",
        }
        self.load_game_state(initial_state)
    
    def load_game_state(self, game_state):
        """
        Load a game state into the board.
        
        Args:
            game_state: Dictionary mapping position keys to piece values
        """
        # Reset the board
        self.board = [[None for _ in range(9)] for _ in range(10)]
        
        # Load the pieces
        for key, piece in game_state.items():
            col = int(key[0])
            row = int(key[1])
            self.board[row][col] = piece
    
    def to_game_state(self):
        """
        Convert the board to a game state dictionary.
        
        Returns:
            Dictionary mapping position keys to piece values
        """
        game_state = {}
        
        for row in range(10):
            for col in range(9):
                if self.board[row][col]:
                    game_state[f"{col}{row}"] = self.board[row][col]
        
        return game_state
    
    def get_piece(self, row, col):
        """Get the piece at the specified position"""
        if 0 <= row < 10 and 0 <= col < 9:
            return self.board[row][col]
        return None
    
    def set_piece(self, row, col, piece):
        """Set a piece at the specified position"""
        if 0 <= row < 10 and 0 <= col < 9:
            self.board[row][col] = piece
    
    def remove_piece(self, row, col):
        """Remove a piece from the specified position"""
        if 0 <= row < 10 and 0 <= col < 9:
            self.board[row][col] = None
    
    def move_piece(self, from_row, from_col, to_row, to_col):
        """
        Move a piece from one position to another.
        
        Returns:
            The captured piece, if any
        """
        piece = self.get_piece(from_row, from_col)
        captured = self.get_piece(to_row, to_col)
        
        if piece:
            self.remove_piece(from_row, from_col)
            self.set_piece(to_row, to_col, piece)
        
        return captured
    
    def copy(self):
        """Create a deep copy of the board"""
        new_board = XiangqiBoard()
        new_board.board = [row[:] for row in self.board]
        return new_board
    
    def get_pieces_by_color(self, color):
        """
        Get all pieces of a specific color with their positions.
        
        Args:
            color: 'r' for red or 'b' for black
            
        Returns:
            List of (row, col, piece) tuples
        """
        pieces = []
        
        for row in range(10):
            for col in range(9):
                piece = self.get_piece(row, col)
                if piece and piece.endswith(f"_{color}"):
                    pieces.append((row, col, piece))
        
        return pieces
    
    def is_valid_position(self, row, col):
        """Check if a position is valid on the board"""
        return 0 <= row < 10 and 0 <= col < 9
    
    def __str__(self):
        """String representation of the board"""
        result = ""
        for row in range(10):
            for col in range(9):
                piece = self.get_piece(row, col)
                if piece:
                    result += f"{piece:8} "
                else:
                    result += "........ "
            result += "\n"
        return result