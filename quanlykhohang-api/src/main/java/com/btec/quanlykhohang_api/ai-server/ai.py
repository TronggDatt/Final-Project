import random
import time
from game import XiangqiGame

class XiangqiAI:
    """AI for Xiangqi (Chinese Chess)"""
    
    def __init__(self, difficulty="medium"):
        """
        Initialize the AI with a specified difficulty level.
        
        Args:
            difficulty: "easy", "medium", or "hard"
        """
        self.difficulty = difficulty
        self.difficulty_settings = {
            "easy": {"depth": 2, "random_factor": 0.3, "time_limit": 1.0},
            "medium": {"depth": 3, "random_factor": 0.15, "time_limit": 2.0},
            "hard": {"depth": 4, "random_factor": 0.05, "time_limit": 3.0}
        }
        
        # Piece values for evaluation
        self.piece_values = {
            "tuong": 10000,  # King
            "sy": 200,       # Advisor
            "tinh": 250,     # Elephant
            "ma": 500,       # Horse
            "xe": 900,       # Chariot
            "phao": 450,     # Cannon
            "tot": 100,      # Pawn
        }
        
        # Position bonuses
        self.position_bonuses = {
            # Center control bonus for pawns after crossing the river
            "tot_r": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [10, 20, 30, 40, 50, 40, 30, 20, 10],  # After crossing river
                [20, 40, 60, 80, 100, 80, 60, 40, 20],
                [30, 60, 90, 120, 150, 120, 90, 60, 30],
                [40, 80, 120, 160, 200, 160, 120, 80, 40],
                [50, 100, 150, 200, 250, 200, 150, 100, 50],
            ],
            "tot_b": [
                [50, 100, 150, 200, 250, 200, 150, 100, 50],
                [40, 80, 120, 160, 200, 160, 120, 80, 40],
                [30, 60, 90, 120, 150, 120, 90, 60, 30],
                [20, 40, 60, 80, 100, 80, 60, 40, 20],
                [10, 20, 30, 40, 50, 40, 30, 20, 10],  # After crossing river
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]
        }
    
    def get_best_move(self, game):
        """
        Get the best move for the current position.
        
        Args:
            game: XiangqiGame instance
            
        Returns:
            Tuple of ((from_row, from_col), (to_row, to_col))
        """
        # Get settings for current difficulty
        settings = self.difficulty_settings[self.difficulty]
        depth = settings["depth"]
        random_factor = settings["random_factor"]
        time_limit = settings["time_limit"]
        
        # Start timer
        start_time = time.time()
        
        # Get all valid moves
        all_moves = game.get_all_valid_moves()
        if not all_moves:
            return None  # No valid moves
        
        best_score = float('-inf')
        best_moves = []
        
        # For each possible move
        for from_pos, moves in all_moves.items():
            for to_pos in moves:
                # Make a temporary move
                temp_game = XiangqiGame()
                temp_game.board = game.board.copy()
                temp_game.current_player = game.current_player
                
                # Make the move
                temp_game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
                
                # Evaluate the position using minimax
                score = self.minimax(temp_game, depth - 1, float('-inf'), float('inf'), False)
                
                # Add random factor based on difficulty
                if random_factor > 0:
                    score += random.uniform(-random_factor * 100, random_factor * 100)
                
                # Update best move
                if score > best_score:
                    best_score = score
                    best_moves = [(from_pos, to_pos)]
                elif score == best_score:
                    best_moves.append((from_pos, to_pos))
                
                # Check time limit
                if time.time() - start_time > time_limit:
                    break
            
            # Check time limit again
            if time.time() - start_time > time_limit:
                break
        
        # Return a random move from the best moves
        return random.choice(best_moves) if best_moves else None
    
    def minimax(self, game, depth, alpha, beta, maximizing_player):
        """
        Minimax algorithm with alpha-beta pruning.
        
        Args:
            game: XiangqiGame instance
            depth: Current depth
            alpha: Alpha value for pruning
            beta: Beta value for pruning
            maximizing_player: True if maximizing, False if minimizing
            
        Returns:
            Score for the position
        """
        # Terminal conditions
        if depth == 0:
            return self.evaluate_position(game)
        
        # Check for checkmate
        if game.is_checkmate(game.current_player):
            return -10000 if maximizing_player else 10000
        
        # Get all valid moves
        all_moves = game.get_all_valid_moves()
        if not all_moves:
            return 0  # Stalemate
        
        if maximizing_player:
            max_eval = float('-inf')
            
            for from_pos, moves in all_moves.items():
                for to_pos in moves:
                    # Make a temporary move
                    temp_game = XiangqiGame()
                    temp_game.board = game.board.copy()
                    temp_game.current_player = game.current_player
                    
                    # Make the move
                    temp_game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
                    
                    # Recursive evaluation
                    eval_score = self.minimax(temp_game, depth - 1, alpha, beta, False)
                    max_eval = max(max_eval, eval_score)
                    
                    # Alpha-beta pruning
                    alpha = max(alpha, eval_score)
                    if beta <= alpha:
                        break
                
                if beta <= alpha:
                    break
            
            return max_eval
        else:
            min_eval = float('inf')
            
            for from_pos, moves in all_moves.items():
                for to_pos in moves:
                    # Make a temporary move
                    temp_game = XiangqiGame()
                    temp_game.board = game.board.copy()
                    temp_game.current_player = game.current_player
                    
                    # Make the move
                    temp_game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
                    
                    # Recursive evaluation
                    eval_score = self.minimax(temp_game, depth - 1, alpha, beta, True)
                    min_eval = min(min_eval, eval_score)
                    
                    # Alpha-beta pruning
                    beta = min(beta, eval_score)
                    if beta <= alpha:
                        break
                
                if beta <= alpha:
                    break
            
            return min_eval
    
    def evaluate_position(self, game):
        """
        Evaluate the current position.
        
        Args:
            game: XiangqiGame instance
            
        Returns:
            Score for the position (positive for advantage to current player)
        """
        current_player = game.current_player
        opponent = 'b' if current_player == 'r' else 'r'
        
        # Check for checkmate
        if game.is_checkmate(current_player):
            return -10000
        if game.is_checkmate(opponent):
            return 10000
        
        # Check for check
        if game.is_king_in_check(current_player):
            check_penalty = -500
        else:
            check_penalty = 0
        
        if game.is_king_in_check(opponent):
            check_bonus = 500
        else:
            check_bonus = 0
        
        # Material evaluation
        material_score = 0
        mobility_score = 0
        position_score = 0
        
        # Count pieces and their values
        for row in range(10):
            for col in range(9):
                piece = game.board.get_piece(row, col)
                if piece:
                    piece_type, color = piece.split('_')
                    piece_value = self.piece_values.get(piece_type, 0)
                    
                    # Add or subtract based on piece color
                    if color == current_player:
                        material_score += piece_value
                        
                        # Add position bonus for pawns
                        if piece_type == 'tot' and piece in self.position_bonuses:
                            position_score += self.position_bonuses[piece][row][col]
                    else:
                        material_score -= piece_value
                        
                        # Subtract position bonus for opponent pawns
                        if piece_type == 'tot' and piece in self.position_bonuses:
                            position_score -= self.position_bonuses[piece][row][col]
        
        # Mobility evaluation (number of valid moves)
        current_moves = len(game.get_all_valid_moves())
        
        # Switch player temporarily to get opponent's moves
        game.current_player = opponent
        opponent_moves = len(game.get_all_valid_moves())
        game.current_player = current_player  # Switch back
        
        mobility_score = current_moves - opponent_moves
        
        # Combine all factors
        total_score = (
            material_score * 1.0 +  # Material is most important
            mobility_score * 0.1 +  # Mobility is less important
            position_score * 0.2 +  # Position bonuses
            check_bonus + check_penalty  # Check status
        )
        
        return total_score