from board import XiangqiBoard

class XiangqiGame:
    """Xiangqi (Chinese Chess) game logic"""
    
    def __init__(self, game_state=None):
        """
        Initialize the game with a given game state or the default initial state.
        
        Args:
            game_state: Dictionary mapping position keys to piece values
        """
        self.board = XiangqiBoard(game_state)
        self.current_player = "r"  # Red starts
        self.move_history = []
    
    def get_valid_moves_for_piece(self, row, col):
        """
        Get all valid moves for a specific piece.
        
        Args:
            row: Row index of the piece
            col: Column index of the piece
            
        Returns:
            List of (row, col) tuples for valid moves
        """
        piece = self.board.get_piece(row, col)
        if not piece:
            return []
        
        piece_type, color = piece.split('_')
        
        # Check if it's the current player's piece
        if color != self.current_player:
            return []
        
        valid_moves = []
        
        # Implementation of movement rules for each piece type
        if piece_type == 'tuong':  # King
            valid_moves = self._get_king_moves(row, col, color)
        elif piece_type == 'sy':  # Advisor
            valid_moves = self._get_advisor_moves(row, col, color)
        elif piece_type == 'tinh':  # Elephant
            valid_moves = self._get_elephant_moves(row, col, color)
        elif piece_type == 'ma':  # Horse
            valid_moves = self._get_horse_moves(row, col, color)
        elif piece_type == 'xe':  # Chariot
            valid_moves = self._get_chariot_moves(row, col, color)
        elif piece_type == 'phao':  # Cannon
            valid_moves = self._get_cannon_moves(row, col, color)
        elif piece_type == 'tot':  # Pawn
            valid_moves = self._get_pawn_moves(row, col, color)
        
        # Filter out moves that would put own king in check
        valid_moves = [move for move in valid_moves if not self._would_be_in_check(row, col, move[0], move[1], color)]
        
        return valid_moves
    
    def _get_king_moves(self, row, col, color):
        """Get valid moves for a king"""
        valid_moves = []
        
        # Kings can only move within the palace (3x3 grid)
        palace_cols = [3, 4, 5]
        palace_rows_r = [7, 8, 9]  # Red palace rows
        palace_rows_b = [0, 1, 2]  # Black palace rows
        
        # Determine which palace based on color
        palace_rows = palace_rows_r if color == 'r' else palace_rows_b
        
        # Check orthogonal moves (up, down, left, right)
        for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            new_row, new_col = row + dr, col + dc
            
            # Check if move is within palace
            if (new_row in palace_rows and new_col in palace_cols and
                self.board.is_valid_position(new_row, new_col)):
                # Check if destination is empty or has enemy piece
                piece = self.board.get_piece(new_row, new_col)
                if not piece or not piece.endswith(f"_{color}"):
                    valid_moves.append((new_row, new_col))
        
        # Check for flying general rule (kings facing each other)
        opponent_color = 'b' if color == 'r' else 'r'
        opponent_king_pos = self._find_king(opponent_color)
        
        if opponent_king_pos and opponent_king_pos[1] == col:
            # Kings are in the same column
            min_row = min(row, opponent_king_pos[0])
            max_row = max(row, opponent_king_pos[0])
            
            # Check if there are any pieces between the kings
            has_piece_between = False
            for r in range(min_row + 1, max_row):
                if self.board.get_piece(r, col):
                    has_piece_between = True
                    break
            
            # If no pieces between, remove moves that would keep kings in the same column
            if not has_piece_between:
                valid_moves = [(r, c) for r, c in valid_moves if c != col]
        
        return valid_moves
    
    def _get_advisor_moves(self, row, col, color):
        """Get valid moves for an advisor"""
        valid_moves = []
        
        # Advisors can only move diagonally within the palace
        palace_cols = [3, 4, 5]
        palace_rows_r = [7, 8, 9]  # Red palace rows
        palace_rows_b = [0, 1, 2]  # Black palace rows
        
        # Determine which palace based on color
        palace_rows = palace_rows_r if color == 'r' else palace_rows_b
        
        # Check diagonal moves
        for dr, dc in [(1, 1), (1, -1), (-1, 1), (-1, -1)]:
            new_row, new_col = row + dr, col + dc
            
            # Check if move is within palace
            if (new_row in palace_rows and new_col in palace_cols and
                self.board.is_valid_position(new_row, new_col)):
                # Check if destination is empty or has enemy piece
                piece = self.board.get_piece(new_row, new_col)
                if not piece or not piece.endswith(f"_{color}"):
                    valid_moves.append((new_row, new_col))
        
        return valid_moves
    
    def _get_elephant_moves(self, row, col, color):
        """Get valid moves for an elephant"""
        valid_moves = []
        
        # Elephants move exactly 2 steps diagonally and cannot cross the river
        river_boundary = 5  # Row index of the river
        
        # Check diagonal moves (2 steps)
        for dr, dc in [(2, 2), (2, -2), (-2, 2), (-2, -2)]:
            new_row, new_col = row + dr, col + dc
            
            # Check if move is within board and doesn't cross river
            if (self.board.is_valid_position(new_row, new_col) and
                ((color == 'r' and new_row >= river_boundary) or
                 (color == 'b' and new_row < river_boundary))):
                
                # Check if the path is blocked (elephant eye)
                eye_row, eye_col = row + dr//2, col + dc//2
                if not self.board.get_piece(eye_row, eye_col):
                    # Check if destination is empty or has enemy piece
                    piece = self.board.get_piece(new_row, new_col)
                    if not piece or not piece.endswith(f"_{color}"):
                        valid_moves.append((new_row, new_col))
        
        return valid_moves
    
    def _get_horse_moves(self, row, col, color):
        """Get valid moves for a horse"""
        valid_moves = []
        
        # Horses move in an L-shape: 1 step orthogonally + 1 step diagonally
        # First check the orthogonal steps
        for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            leg_row, leg_col = row + dr, col + dc
            
            # Check if the leg position is valid and not blocked
            if (self.board.is_valid_position(leg_row, leg_col) and
                not self.board.get_piece(leg_row, leg_col)):
                
                # Determine the two possible diagonal moves
                if dr == 0:  # Moving horizontally first
                    diag_moves = [(1, dc), (-1, dc)]
                else:  # Moving vertically first
                    diag_moves = [(dr, 1), (dr, -1)]
                
                # Check each diagonal move
                for ddr, ddc in diag_moves:
                    new_row, new_col = leg_row + ddr, leg_col + ddc
                    
                    # Check if move is within board
                    if self.board.is_valid_position(new_row, new_col):
                        # Check if destination is empty or has enemy piece
                        piece = self.board.get_piece(new_row, new_col)
                        if not piece or not piece.endswith(f"_{color}"):
                            valid_moves.append((new_row, new_col))
        
        return valid_moves
    
    def _get_chariot_moves(self, row, col, color):
        """Get valid moves for a chariot"""
        valid_moves = []
        
        # Chariots move any number of steps orthogonally (like a rook in chess)
        for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            for step in range(1, 10):  # Maximum board size
                new_row, new_col = row + dr * step, col + dc * step
                
                # Check if move is within board
                if not self.board.is_valid_position(new_row, new_col):
                    break
                
                # Check if destination is empty
                piece = self.board.get_piece(new_row, new_col)
                if not piece:
                    valid_moves.append((new_row, new_col))
                # Check if destination has enemy piece
                elif not piece.endswith(f"_{color}"):
                    valid_moves.append((new_row, new_col))
                    break  # Can't move further after capturing
                else:
                    break  # Can't move through own pieces
        
        return valid_moves
    
    def _get_cannon_moves(self, row, col, color):
        """Get valid moves for a cannon"""
        valid_moves = []
        
        # Cannons move like chariots but need to jump over exactly one piece to capture
        for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            # First, handle normal moves (without capturing)
            platform_found = False
            for step in range(1, 10):
                new_row, new_col = row + dr * step, col + dc * step
                
                # Check if move is within board
                if not self.board.is_valid_position(new_row, new_col):
                    break
                
                piece = self.board.get_piece(new_row, new_col)
                if not piece and not platform_found:
                    # Empty square, can move here (normal move)
                    valid_moves.append((new_row, new_col))
                elif piece and not platform_found:
                    # Found a platform, can't move here but can potentially capture beyond
                    platform_found = True
                elif piece and platform_found:
                    # Found a piece after a platform
                    if not piece.endswith(f"_{color}"):
                        # It's an enemy piece, can capture
                        valid_moves.append((new_row, new_col))
                    break  # Can't move further regardless
                # If empty square after platform, continue looking
        
        return valid_moves
    
    def _get_pawn_moves(self, row, col, color):
        """Get valid moves for a pawn"""
        valid_moves = []
        river_boundary = 5  # Row index of the river
        
        if color == 'r':  # Red pawns move up
            # Forward move
            if row > 0:
                new_row, new_col = row - 1, col
                piece = self.board.get_piece(new_row, new_col)
                if not piece or not piece.endswith("_r"):
                    valid_moves.append((new_row, new_col))
            
            # Horizontal moves if crossed the river
            if row < river_boundary:
                for dc in [-1, 1]:
                    new_col = col + dc
                    if self.board.is_valid_position(row, new_col):
                        piece = self.board.get_piece(row, new_col)
                        if not piece or not piece.endswith("_r"):
                            valid_moves.append((row, new_col))
        
        else:  # Black pawns move down
            # Forward move
            if row < 9:
                new_row, new_col = row + 1, col
                piece = self.board.get_piece(new_row, new_col)
                if not piece or not piece.endswith("_b"):
                    valid_moves.append((new_row, new_col))
            
            # Horizontal moves if crossed the river
            if row >= river_boundary:
                for dc in [-1, 1]:
                    new_col = col + dc
                    if self.board.is_valid_position(row, new_col):
                        piece = self.board.get_piece(row, new_col)
                        if not piece or not piece.endswith("_b"):
                            valid_moves.append((row, new_col))
        
        return valid_moves
    
    def _find_king(self, color):
        """Find the position of a king"""
        king_piece = f"tuong_{color}"
        
        for row in range(10):
            for col in range(9):
                if self.board.get_piece(row, col) == king_piece:
                    return (row, col)
        
        return None
    
    def is_king_in_check(self, color):
        """
        Check if the king of the specified color is in check.
        
        Args:
            color: 'r' for red or 'b' for black
            
        Returns:
            True if the king is in check, False otherwise
        """
        king_pos = self._find_king(color)
        if not king_pos:
            return False  # King not found (shouldn't happen in a valid game)
        
        opponent_color = 'b' if color == 'r' else 'r'
        opponent_pieces = self.board.get_pieces_by_color(opponent_color)
        
        for opp_row, opp_col, piece in opponent_pieces:
            # For each opponent piece, check if it can capture the king
            piece_type = piece.split('_')[0]
            
            # Special case for kings facing each other
            if piece_type == 'tuong':
                if opp_col == king_pos[1]:  # Same column
                    # Check if there are any pieces between the kings
                    min_row = min(opp_row, king_pos[0])
                    max_row = max(opp_row, king_pos[0])
                    
                    has_piece_between = False
                    for r in range(min_row + 1, max_row):
                        if self.board.get_piece(r, opp_col):
                            has_piece_between = True
                            break
                    
                    if not has_piece_between:
                        return True  # Flying general rule - king is in check
                continue  # Kings can't directly check each other otherwise
            
            # For other pieces, use the move generation logic
            valid_moves = []
            if piece_type == 'sy':
                valid_moves = self._get_advisor_moves(opp_row, opp_col, opponent_color)
            elif piece_type == 'tinh':
                valid_moves = self._get_elephant_moves(opp_row, opp_col, opponent_color)
            elif piece_type == 'ma':
                valid_moves = self._get_horse_moves(opp_row, opp_col, opponent_color)
            elif piece_type == 'xe':
                valid_moves = self._get_chariot_moves(opp_row, opp_col, opponent_color)
            elif piece_type == 'phao':
                valid_moves = self._get_cannon_moves(opp_row, opp_col, opponent_color)
            elif piece_type == 'tot':
                valid_moves = self._get_pawn_moves(opp_row, opp_col, opponent_color)
            
            # Check if any of the valid moves can capture the king
            if king_pos in valid_moves:
                return True
        
        return False
    
    def _would_be_in_check(self, from_row, from_col, to_row, to_col, color):
        """
        Check if making a move would put the king in check.
        
        Args:
            from_row, from_col: Starting position
            to_row, to_col: Ending position
            color: Color of the player making the move
            
        Returns:
            True if the move would put the king in check, False otherwise
        """
        # Make a temporary move
        temp_board = self.board.copy()
        temp_board.move_piece(from_row, from_col, to_row, to_col)
        
        # Create a temporary game with the new board
        temp_game = XiangqiGame()
        temp_game.board = temp_board
        temp_game.current_player = color
        
        # Check if the king is in check
        return temp_game.is_king_in_check(color)
    
    def is_checkmate(self, color):
        """
        Check if the specified color is in checkmate.
        
        Args:
            color: 'r' for red or 'b' for black
            
        Returns:
            True if the player is in checkmate, False otherwise
        """
        # If the king is not in check, it's not checkmate
        if not self.is_king_in_check(color):
            return False
        
        # Try all possible moves to see if any can get out of check
        pieces = self.board.get_pieces_by_color(color)
        
        for row, col, piece in pieces:
            valid_moves = self.get_valid_moves_for_piece(row, col)
            
            # If there's at least one valid move, it's not checkmate
            if valid_moves:
                return False
        
        # No valid moves and king is in check, it's checkmate
        return True
    
    def make_move(self, from_row, from_col, to_row, to_col):
        """
        Make a move on the board.
        
        Args:
            from_row, from_col: Starting position
            to_row, to_col: Ending position
            
        Returns:
            True if the move was successful, False otherwise
        """
        piece = self.board.get_piece(from_row, from_col)
        
        if not piece:
            return False
        
        piece_color = piece.split('_')[1]
        
        # Check if it's the current player's piece
        if piece_color != self.current_player:
            return False
        
        # Check if the move is valid
        valid_moves = self.get_valid_moves_for_piece(from_row, from_col)
        if (to_row, to_col) not in valid_moves:
            return False
        
        # Make the move
        captured = self.board.move_piece(from_row, from_col, to_row, to_col)
        
        # Record the move
        self.move_history.append({
            'piece': piece,
            'from': (from_row, from_col),
            'to': (to_row, to_col),
            'captured': captured
        })
        
        # Switch player
        self.current_player = 'b' if self.current_player == 'r' else 'r'
        
        return True
    
    def get_all_valid_moves(self):
        """
        Get all valid moves for the current player.
        
        Returns:
            Dictionary mapping piece positions to lists of valid moves
        """
        all_moves = {}
        pieces = self.board.get_pieces_by_color(self.current_player)
        
        for row, col, piece in pieces:
            valid_moves = self.get_valid_moves_for_piece(row, col)
            if valid_moves:
                all_moves[(row, col)] = valid_moves
        
        return all_moves
    
    def get_game_state(self):
        """
        Get the current game state.
        
        Returns:
            Dictionary with the current game state
        """
        return {
            'board': self.board.to_game_state(),
            'current_player': self.current_player,
            'is_check': self.is_king_in_check(self.current_player),
            'is_checkmate': self.is_checkmate(self.current_player),
            'move_history': self.move_history
        }