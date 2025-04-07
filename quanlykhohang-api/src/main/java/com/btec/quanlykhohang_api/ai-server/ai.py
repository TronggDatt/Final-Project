import random
import time
from game import XiangqiGame
import concurrent.futures
import numpy as np
from collections import OrderedDict


class XiangqiAI:
    """Enhanced AI for Xiangqi (Chinese Chess)"""

    def __init__(self, difficulty="medium"):

        self.difficulty = difficulty
        self.difficulty_settings = {
            "easy": {"depth": 2, "random_factor": 0.3, "time_limit": 1.0},
            "medium": {"depth": 3, "random_factor": 0.15, "time_limit": 2.0},
            "hard": {"depth": 4, "random_factor": 0.05, "time_limit": 3.0},
            "expert": {"depth": 5, "random_factor": 0.02, "time_limit": 5.0},
            "master": {"depth": 6, "random_factor": 0.01, "time_limit": 7.0},  # Tăng thêm độ sâu
            "genius": {"depth": 7, "random_factor": 0.005, "time_limit": 10.0},  # Tăng thêm độ sâu
        }

        # Piece values for evaluation (improved values)
        self.piece_values = {
            "tuong": 10000,  # King
            "sy": 200,  # Advisor
            "tinh": 250,  # Elephant
            "ma": 500,  # Horse
            "xe": 900,  # Chariot
            "phao": 450,  # Cannon
            "tot": 100,  # Pawn
        }

        # Position bonuses - more sophisticated position evaluation
        self.position_bonuses = self._initialize_position_bonuses()

        # Transposition table for storing evaluated positions
        self.transposition_table = {}

        # Opening book for common starting moves
        self.opening_book = self._initialize_opening_book()

        # History heuristic for move ordering
        self.history_table = np.zeros((10, 9, 10, 9), dtype=np.int32)

        # Killer moves storage (moves that caused beta cutoffs)
        self.killer_moves = [[] for _ in range(10)]  # Store 2 killer moves per depth

        # Piece-square tables for more nuanced position evaluation
        self.piece_square_tables = self._initialize_piece_square_tables()

    def _initialize_position_bonuses(self):
        """Initialize more sophisticated position bonuses"""
        bonuses = {
            # Pawn position values (more detailed)
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
            ],
            # Horse position values
            "ma_r": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 20, 0, 0, 0, 20, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 20, 0, 0, 0, 0, 0, 20, 0],
                [0, 0, 0, 0, 30, 0, 0, 0, 0],
            ],
            "ma_b": [
                [0, 0, 0, 0, 30, 0, 0, 0, 0],
                [0, 20, 0, 0, 0, 0, 0, 20, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 20, 0, 0, 0, 20, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            # Chariot position values
            "xe_r": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [20, 0, 0, 0, 0, 0, 0, 0, 20],
                [0, 0, 0, 10, 0, 10, 0, 0, 0],
            ],
            "xe_b": [
                [0, 0, 0, 10, 0, 10, 0, 0, 0],
                [20, 0, 0, 0, 0, 0, 0, 0, 20],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
        }
        return bonuses

    def _initialize_piece_square_tables(self):
        """Initialize piece-square tables for positional evaluation"""
        # These tables provide more nuanced position evaluation
        tables = {
            # Cannon piece-square table
            "phao_r": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [20, 0, 20, 0, 0, 0, 20, 0, 20],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            "phao_b": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [20, 0, 20, 0, 0, 0, 20, 0, 20],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            # Advisor piece-square table (palace only)
            "sy_r": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 30, 0, 0, 0, 0],
                [0, 0, 0, 20, 0, 20, 0, 0, 0],
                [0, 0, 0, 0, 10, 0, 0, 0, 0],
            ],
            "sy_b": [
                [0, 0, 0, 0, 10, 0, 0, 0, 0],
                [0, 0, 0, 20, 0, 20, 0, 0, 0],
                [0, 0, 0, 0, 30, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            # Elephant piece-square table
            "tinh_r": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 20, 0, 0, 0, 20, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 20, 0, 0, 0, 0, 0, 20, 0],
            ],
            "tinh_b": [
                [0, 20, 0, 0, 0, 0, 0, 20, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 20, 0, 0, 0, 20, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
        }
        return tables

    def _initialize_opening_book(self):
        """Initialize opening book with common strong moves"""
        # Format: game_state_hash -> [(from_pos, to_pos, weight), ...]
        # Higher weight means more likely to be chosen
        opening_book = {
            # Initial position moves
            "initial": [
                # Common strong opening moves for red
                ((2, 9), (2, 7), 10),  # Elephant to center
                ((7, 9), (7, 7), 10),  # Elephant to center
                ((1, 9), (2, 7), 8),  # Horse to center
                ((7, 9), (6, 7), 8),  # Horse to center
                ((1, 7), (4, 7), 7),  # Cannon to center
                ((7, 7), (4, 7), 7),  # Cannon to center
            ],
            # Common responses to black's first move
            "response_h2e": [
                ((1, 9), (2, 7), 10),  # Horse to center
                ((7, 9), (6, 7), 9),  # Horse to center
                ((1, 7), (4, 7), 8),  # Cannon to center
            ],
            "response_e3c": [
                ((2, 9), (4, 7), 10),  # Elephant to center
                ((1, 9), (3, 8), 9),  # Horse forward
                ((4, 9), (4, 8), 8),  # King forward
            ],
        }
        return opening_book

    def get_best_move(self, game):
        """Get the best move for the current position using iterative deepening."""
        settings = self.difficulty_settings[self.difficulty]
        max_depth = settings["depth"]
        random_factor = settings["random_factor"]
        time_limit = settings["time_limit"]
        start_time = time.time()

        # Check opening book first
        opening_move = self._check_opening_book(game)
        if opening_move:
            # Validate the opening book move
            from_pos, to_pos = opening_move
            if not game.board.get_piece(from_pos[0], from_pos[1]):
                print(f"WARNING: Opening book returned invalid move: {from_pos} -> {to_pos}")
                # Don't use this opening book move
                opening_move = None
            else:
                return opening_move

        # Clear transposition table for new search
        self.transposition_table = {}

        # Initialize best move
        best_move = None
        best_score = -float('inf')

        # Get all valid moves first to ensure we have at least one move
        all_valid_moves = game.get_all_valid_moves()
        if not all_valid_moves:
            print("WARNING: No valid moves found!")
            return None

        # Pick a default move in case we run out of time
        default_from_pos = list(all_valid_moves.keys())[0]
        default_to_pos = all_valid_moves[default_from_pos][0]
        default_move = (default_from_pos, default_to_pos)

        # Iterative deepening
        for current_depth in range(1, max_depth + 1):
            # Check if we have enough time for another iteration
            if time.time() - start_time > time_limit * 0.8:
                break

            # Reset killer moves for this depth
            self.killer_moves = [[] for _ in range(current_depth + 2)]

            # Perform search at current depth
            score, move = self._iterative_deepening_search(game, current_depth, start_time, time_limit)

            # Update best move if we have a valid result
            if move and game.board.get_piece(move[0][0], move[0][1]):
                best_move = move
                best_score = score

            # If we're running out of time, stop iterative deepening
            if time.time() - start_time > time_limit * 0.7:
                break

        # If we couldn't find a valid move, use the default move
        if not best_move:
            print("WARNING: Using default move because no valid move was found")
            best_move = default_move

        # Final validation to ensure we're returning a valid move
        from_row, from_col = best_move[0]
        piece = game.board.get_piece(from_row, from_col)
        if not piece:
            print(f"ERROR: About to return invalid move: {best_move[0]} -> {best_move[1]}")
            print(f"Game state: {game.board.to_game_state()}")
            print(f"Current player: {game.current_player}")

            # Emergency fallback: find any valid move
            for from_pos, to_positions in all_valid_moves.items():
                if game.board.get_piece(from_pos[0], from_pos[1]):
                    return (from_pos, to_positions[0])

            # If we still can't find a valid move, return None and let the API handle it
            return None

        # Add some randomness based on difficulty
        if random.random() < random_factor and best_move:
            # Get all valid moves
            all_moves = game.get_all_valid_moves()
            if all_moves:
                # Randomly select a different move occasionally
                from_positions = list(all_moves.keys())
                if from_positions:
                    from_pos = random.choice(from_positions)
                    # Make sure the piece exists at this position
                    if game.board.get_piece(from_pos[0], from_pos[1]):
                        to_positions = all_moves[from_pos]
                        if to_positions:
                            to_pos = random.choice(to_positions)
                            return (from_pos, to_pos)

        return best_move

    def _check_opening_book(self, game):
        """Check if the current position is in the opening book"""
        # For simplicity, just check if it's the initial position
        if len(game.move_history) == 0:
            # It's the initial position
            moves = self.opening_book.get("initial", [])
            if moves:
                # Choose a move based on weights
                total_weight = sum(move[2] for move in moves)
                r = random.uniform(0, total_weight)
                current_weight = 0
                for from_pos, to_pos, weight in moves:
                    current_weight += weight
                    if r <= current_weight:
                        return (from_pos, to_pos)

        # Check for common responses to first move
        if len(game.move_history) == 1:
            last_move = game.move_history[0]
            piece = last_move['piece']
            from_pos = last_move['from']
            to_pos = last_move['to']

            # Check if it's a common opening move by black
            if piece == "ma_b" and from_pos == (1, 0) and to_pos == (2, 2):
                # Horse to center
                moves = self.opening_book.get("response_h2e", [])
                if moves:
                    # Choose a move based on weights
                    total_weight = sum(move[2] for move in moves)
                    r = random.uniform(0, total_weight)
                    current_weight = 0
                    for from_pos, to_pos, weight in moves:
                        current_weight += weight
                        if r <= current_weight:
                            return (from_pos, to_pos)

            if piece == "tinh_b" and from_pos == (2, 0) and to_pos == (4, 2):
                # Elephant to center
                moves = self.opening_book.get("response_e3c", [])
                if moves:
                    # Choose a move based on weights
                    total_weight = sum(move[2] for move in moves)
                    r = random.uniform(0, total_weight)
                    current_weight = 0
                    for from_pos, to_pos, weight in moves:
                        current_weight += weight
                        if r <= current_weight:
                            return (from_pos, to_pos)

        return None

    def _iterative_deepening_search(self, game, depth, start_time, time_limit):
        """Perform iterative deepening search"""
        alpha = -float('inf')
        beta = float('inf')
        best_move = None
        best_score = -float('inf')

        # Get all valid moves and sort them for better pruning
        all_moves = self._get_sorted_moves(game)

        # Use multiple threads for parallel search
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = []

            for from_pos, to_positions in all_moves.items():
                for to_pos in to_positions:
                    # Submit each move evaluation to the thread pool
                    futures.append(
                        executor.submit(
                            self._evaluate_move_at_depth,
                            game, from_pos, to_pos, depth, alpha, beta, start_time, time_limit
                        )
                    )

            # Collect results as they complete
            for future in concurrent.futures.as_completed(futures):
                # Check if we're out of time
                if time.time() - start_time > time_limit:
                    break

                try:
                    score, move = future.result()
                    if score > best_score:
                        best_score = score
                        best_move = move
                        alpha = max(alpha, best_score)
                except Exception as e:
                    print(f"Error in move evaluation: {e}")

        return best_score, best_move

    def _evaluate_move_at_depth(self, game, from_pos, to_pos, depth, alpha, beta, start_time, time_limit):
        """Evaluate a move at the specified depth"""
        # Create a temporary game state
        temp_game = XiangqiGame()
        temp_game.board = game.board.copy()
        temp_game.current_player = game.current_player

        # Make the move
        temp_game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])

        # Evaluate with negamax
        score = -self._negamax(temp_game, depth - 1, -beta, -alpha, False, start_time, time_limit)

        # Update history heuristic for move ordering
        if score >= beta:
            self.history_table[from_pos[0], from_pos[1], to_pos[0], to_pos[1]] += depth * depth

        return score, (from_pos, to_pos)

    def _get_sorted_moves(self, game):
        """Get all valid moves sorted by potential quality"""
        all_moves = game.get_all_valid_moves()
        sorted_moves = OrderedDict()

        # Score each move for sorting
        move_scores = []
        for from_pos, to_positions in all_moves.items():
            from_row, from_col = from_pos
            piece = game.board.get_piece(from_row, from_col)
            piece_type = piece.split('_')[0] if piece else ""

            for to_pos in to_positions:
                to_row, to_col = to_pos
                score = 0

                # 1. Capturing moves (MVV-LVA: Most Valuable Victim - Least Valuable Aggressor)
                target = game.board.get_piece(to_row, to_col)
                if target:
                    target_type = target.split('_')[0]
                    # Score = value of captured piece - value of capturing piece / 10
                    score += self.piece_values.get(target_type, 0) - self.piece_values.get(piece_type, 0) / 10

                # 2. History heuristic
                score += self.history_table[from_row, from_col, to_row, to_col] / 1000

                # 3. Killer moves
                for depth, killers in enumerate(self.killer_moves):
                    if (from_pos, to_pos) in killers:
                        score += 900 - depth * 100  # Higher score for killers at lower depths

                # 4. Positional improvements
                if piece_type == "tot":  # Pawn advancement
                    if game.current_player == 'r' and to_row < from_row:
                        score += (9 - to_row) * 10  # Reward advancing pawns
                    elif game.current_player == 'b' and to_row > from_row:
                        score += to_row * 10

                # 5. Center control for pieces
                if 3 <= to_col <= 5 and ((game.current_player == 'r' and to_row < 5) or
                                         (game.current_player == 'b' and to_row >= 5)):
                    score += 50

                move_scores.append((from_pos, to_pos, score))

        # Sort moves by score in descending order
        move_scores.sort(key=lambda x: x[2], reverse=True)

        # Build the sorted OrderedDict
        for from_pos, to_pos, _ in move_scores:
            if from_pos not in sorted_moves:
                sorted_moves[from_pos] = []
            sorted_moves[from_pos].append(to_pos)

        return sorted_moves

    def _negamax(self, game, depth, alpha, beta, is_quiescence, start_time, time_limit):
        """Negamax algorithm with alpha-beta pruning and quiescence search"""
        # Check for time limit
        if time.time() - start_time > time_limit:
            return 0

        # Generate position hash for transposition table
        position_hash = self._generate_position_hash(game)

        # Check transposition table
        if position_hash in self.transposition_table and self.transposition_table[position_hash]['depth'] >= depth:
            tt_entry = self.transposition_table[position_hash]
            if tt_entry['flag'] == 'exact':
                return tt_entry['score']
            elif tt_entry['flag'] == 'lower' and tt_entry['score'] > alpha:
                alpha = tt_entry['score']
            elif tt_entry['flag'] == 'upper' and tt_entry['score'] < beta:
                beta = tt_entry['score']

            if alpha >= beta:
                return tt_entry['score']

        # Check for terminal states
        if game.is_checkmate(game.current_player):
            return -10000  # Losing

        if game.is_checkmate('r' if game.current_player == 'b' else 'b'):
            return 10000  # Winning

        # If we've reached the maximum depth, evaluate the position
        if depth <= 0:
            # If in check or capturing move available, extend search with quiescence
            if not is_quiescence and (game.is_king_in_check(game.current_player) or self._has_capturing_moves(game)):
                return self._quiescence_search(game, alpha, beta, 0, 3, start_time, time_limit)
            else:
                return self.evaluate_position(game)

        # Get all valid moves and sort them for better pruning
        all_moves = self._get_sorted_moves(game)

        if not all_moves:
            # No valid moves, evaluate current position
            return self.evaluate_position(game)

        original_alpha = alpha
        best_score = -float('inf')
        best_move = None

        # Try each move
        for from_pos, to_positions in all_moves.items():
            for to_pos in to_positions:
                # Create a temporary game state
                temp_game = XiangqiGame()
                temp_game.board = game.board.copy()
                temp_game.current_player = game.current_player

                # Make the move
                temp_game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])

                # Recursive negamax call with swapped players
                score = -self._negamax(temp_game, depth - 1, -beta, -alpha, is_quiescence, start_time, time_limit)

                # Check if this is the best move so far
                if score > best_score:
                    best_score = score
                    best_move = (from_pos, to_pos)

                # Update alpha
                alpha = max(alpha, score)

                # Alpha-beta pruning
                if alpha >= beta:
                    # Store killer move for move ordering
                    if not is_quiescence and not game.board.get_piece(to_pos[0], to_pos[1]):
                        if len(self.killer_moves[depth]) < 2:
                            self.killer_moves[depth].append((from_pos, to_pos))

                    # Update history table
                    self.history_table[from_pos[0], from_pos[1], to_pos[0], to_pos[1]] += depth * depth
                    break

            if alpha >= beta:
                break

        # Store result in transposition table
        if best_score <= original_alpha:
            flag = 'upper'
        elif best_score >= beta:
            flag = 'lower'
        else:
            flag = 'exact'

        self.transposition_table[position_hash] = {
            'score': best_score,
            'depth': depth,
            'flag': flag,
            'best_move': best_move
        }

        return best_score

    def _quiescence_search(self, game, alpha, beta, depth, max_depth, start_time, time_limit):
        """Quiescence search to handle tactical sequences"""
        # Check for time limit
        if time.time() - start_time > time_limit:
            return 0

        # Stand-pat score
        stand_pat = self.evaluate_position(game)

        # Return immediately if we've reached maximum quiescence depth
        if depth >= max_depth:
            return stand_pat

        # Beta cutoff
        if stand_pat >= beta:
            return beta

        # Update alpha if stand-pat is better
        if stand_pat > alpha:
            alpha = stand_pat

        # Get capturing moves only
        capturing_moves = self._get_capturing_moves(game)

        # Try each capturing move
        for from_pos, to_positions in capturing_moves.items():
            for to_pos in to_positions:
                # Create a temporary game state
                temp_game = XiangqiGame()
                temp_game.board = game.board.copy()
                temp_game.current_player = game.current_player

                # Make the move
                temp_game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])

                # Recursive quiescence call
                score = -self._quiescence_search(temp_game, -beta, -alpha, depth + 1, max_depth, start_time, time_limit)

                # Update alpha
                if score > alpha:
                    alpha = score

                # Alpha-beta pruning
                if alpha >= beta:
                    return beta

        return alpha

    def _get_capturing_moves(self, game):
        """Get all moves that capture a piece"""
        all_moves = game.get_all_valid_moves()
        capturing_moves = OrderedDict()

        for from_pos, to_positions in all_moves.items():
            for to_pos in to_positions:
                # Check if the destination has an opponent's piece
                target = game.board.get_piece(to_pos[0], to_pos[1])
                if target:
                    if from_pos not in capturing_moves:
                        capturing_moves[from_pos] = []
                    capturing_moves[from_pos].append(to_pos)

        return capturing_moves

    def _has_capturing_moves(self, game):
        """Check if there are any capturing moves available"""
        all_moves = game.get_all_valid_moves()

        for from_pos, to_positions in all_moves.items():
            for to_pos in to_positions:
                # Check if the destination has an opponent's piece
                target = game.board.get_piece(to_pos[0], to_pos[1])
                if target:
                    return True

        return False

    def _generate_position_hash(self, game):
        """Generate a hash for the current board position"""
        # Simple string representation of the board
        board_str = ""
        for row in range(10):
            for col in range(9):
                piece = game.board.get_piece(row, col)
                if piece:
                    board_str += piece
                else:
                    board_str += "."

        return board_str + game.current_player

    def evaluate_position(self, game):
        """
        Enhanced position evaluation function.

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
            check_penalty = -300
        else:
            check_penalty = 0

        if game.is_king_in_check(opponent):
            check_bonus = 300
        else:
            check_bonus = 0

        # Initialize scores
        material_score = 0
        mobility_score = 0
        position_score = 0
        king_safety_score = 0
        pawn_structure_score = 0
        piece_coordination_score = 0

        # Count pieces and their values
        for row in range(10):
            for col in range(9):
                piece = game.board.get_piece(row, col)
                if piece:
                    piece_type, color = piece.split('_')
                    piece_value = self.piece_values.get(piece_type, 0)

                    # Material evaluation
                    if color == current_player:
                        material_score += piece_value

                        # Position bonuses from tables
                        piece_key = f"{piece_type}_{color}"
                        if piece_key in self.position_bonuses:
                            position_score += self.position_bonuses[piece_key][row][col]

                        if piece_key in self.piece_square_tables:
                            position_score += self.piece_square_tables[piece_key][row][col]

                        # King safety evaluation
                        if piece_type == 'tuong':
                            king_safety_score += self._evaluate_king_safety(game, row, col, color)

                        # Pawn structure evaluation
                        if piece_type == 'tot':
                            pawn_structure_score += self._evaluate_pawn_structure(game, row, col, color)

                        # Piece coordination
                        piece_coordination_score += self._evaluate_piece_coordination(game, row, col, piece_type, color)
                    else:
                        material_score -= piece_value

                        # Position bonuses for opponent (negative)
                        piece_key = f"{piece_type}_{color}"
                        if piece_key in self.position_bonuses:
                            position_score -= self.position_bonuses[piece_key][row][col]

                        if piece_key in self.piece_square_tables:
                            position_score -= self.piece_square_tables[piece_key][row][col]

                        # King safety evaluation for opponent
                        if piece_type == 'tuong':
                            king_safety_score -= self._evaluate_king_safety(game, row, col, color)

                        # Pawn structure evaluation for opponent
                        if piece_type == 'tot':
                            pawn_structure_score -= self._evaluate_pawn_structure(game, row, col, color)

                        # Piece coordination for opponent
                        piece_coordination_score -= self._evaluate_piece_coordination(game, row, col, piece_type, color)

        # Mobility evaluation (number of valid moves)
        current_moves = len(game.get_all_valid_moves())

        # Switch player temporarily to get opponent's moves
        game.current_player = opponent
        opponent_moves = len(game.get_all_valid_moves())
        game.current_player = current_player  # Switch back

        mobility_score = (current_moves - opponent_moves) * 10

        # Combine all factors with appropriate weights
        total_score = (
                material_score * 1.0 +  # Material is most important
                mobility_score * 0.2 +  # Mobility
                position_score * 0.3 +  # Position bonuses
                king_safety_score * 0.4 +  # King safety
                pawn_structure_score * 0.2 +  # Pawn structure
                piece_coordination_score * 0.3 +  # Piece coordination
                check_bonus + check_penalty  # Check status
        )

        return total_score

    def _evaluate_king_safety(self, game, king_row, king_col, color):
        """Evaluate the safety of a king"""
        safety_score = 0

        # Check for pieces defending the king
        defenders = 0
        for dr in range(-1, 2):
            for dc in range(-1, 2):
                if dr == 0 and dc == 0:
                    continue

                r, c = king_row + dr, king_col + dc
                if game.board.is_valid_position(r, c):
                    piece = game.board.get_piece(r, c)
                    if piece and piece.endswith(f"_{color}"):
                        defenders += 1

        safety_score += defenders * 30

        # Penalty for open lines to the king
        open_lines = 0
        for direction in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            dr, dc = direction
            r, c = king_row + dr, king_col + dc
            open_line = True

            while game.board.is_valid_position(r, c):
                piece = game.board.get_piece(r, c)
                if piece:
                    open_line = False
                    break
                r += dr
                c += dc

            if open_line:
                open_lines += 1

        safety_score -= open_lines * 50

        return safety_score

    def _evaluate_pawn_structure(self, game, pawn_row, pawn_col, color):
        """Evaluate pawn structure and advancement"""
        score = 0

        # Reward advanced pawns
        if color == 'r':
            score += (9 - pawn_row) * 10
        else:
            score += pawn_row * 10

        # Reward pawns that have crossed the river
        river_boundary = 5
        if (color == 'r' and pawn_row < river_boundary) or (color == 'b' and pawn_row >= river_boundary):
            score += 50

        # Reward connected pawns (pawns that can protect each other)
        for dc in [-1, 1]:
            neighbor_col = pawn_col + dc
            if game.board.is_valid_position(pawn_row, neighbor_col):
                piece = game.board.get_piece(pawn_row, neighbor_col)
                if piece and piece == f"tot_{color}":
                    score += 30

        return score

    def _evaluate_piece_coordination(self, game, row, col, piece_type, color):
        """Evaluate how well pieces work together"""
        score = 0

        # Check for pieces supporting each other
        for dr in range(-2, 3):
            for dc in range(-2, 3):
                if dr == 0 and dc == 0:
                    continue

                r, c = row + dr, col + dc
                if game.board.is_valid_position(r, c):
                    piece = game.board.get_piece(r, c)
                    if piece and piece.endswith(f"_{color}"):
                        # Pieces are near each other
                        score += 5

                        # Special combinations
                        other_piece_type = piece.split('_')[0]

                        # Horse and chariot work well together
                        if (piece_type == 'ma' and other_piece_type == 'xe') or \
                                (piece_type == 'xe' and other_piece_type == 'ma'):
                            score += 20

                        # Cannon and chariot on same file/rank
                        if ((piece_type == 'phao' and other_piece_type == 'xe') or \
                            (piece_type == 'xe' and other_piece_type == 'phao')) and \
                                (row == r or col == c):
                            score += 25

        return score

def _negamax(self, game, depth, alpha, beta, is_quiescence, start_time, time_limit):
    """Negamax algorithm with alpha-beta pruning and quiescence search"""
    # Kiểm tra thời gian
    if time.time() - start_time > time_limit:
        return 0

    # Lấy hash của trạng thái bàn cờ
    position_hash = self._generate_position_hash(game)

    # Kiểm tra bảng chuyển vị (transposition table)
    if position_hash in self.transposition_table and self.transposition_table[position_hash]['depth'] >= depth:
        tt_entry = self.transposition_table[position_hash]
        if tt_entry['flag'] == 'exact':
            return tt_entry['score']
        elif tt_entry['flag'] == 'lower' and tt_entry['score'] > alpha:
            alpha = tt_entry['score']
        elif tt_entry['flag'] == 'upper' and tt_entry['score'] < beta:
            beta = tt_entry['score']

        if alpha >= beta:
            return tt_entry['score']

    # Kiểm tra các trạng thái kết thúc như chiếu hết
    if game.is_checkmate(game.current_player):
        return -10000  # Thua

    if game.is_checkmate('r' if game.current_player == 'b' else 'b'):
        return 10000  # Thắng

    if depth <= 0:
        return self.evaluate_position(game)

    all_moves = self._get_sorted_moves(game)

    if not all_moves:
        return self.evaluate_position(game)

    original_alpha = alpha
    best_score = -float('inf')
    best_move = None

    # Thử từng nước đi
    for from_pos, to_positions in all_moves.items():
        for to_pos in to_positions:
            temp_game = XiangqiGame()
            temp_game.board = game.board.copy()
            temp_game.current_player = game.current_player
            temp_game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])

            score = -self._negamax(temp_game, depth - 1, -beta, -alpha, is_quiescence, start_time, time_limit)

            if score > best_score:
                best_score = score
                alpha = max(alpha, best_score)

            if alpha >= beta:
                break

    # Lưu kết quả vào bảng chuyển vị
    if best_score <= original_alpha:
        flag = 'upper'
    elif best_score >= beta:
        flag = 'lower'
    else:
        flag = 'exact'

    self.transposition_table[position_hash] = {
        'score': best_score,
        'depth': depth,
        'flag': flag,
        'best_move': best_move
    }

    return best_score

def _quiescence_search(self, game, alpha, beta, depth, max_depth, start_time, time_limit):
    """Quiescence search to handle tactical sequences"""
    # Kiểm tra thời gian
    if time.time() - start_time > time_limit:
        return 0

    stand_pat = self.evaluate_position(game)

    if depth >= max_depth:
        return stand_pat

    if stand_pat >= beta:
        return beta

    if stand_pat > alpha:
        alpha = stand_pat

    # Lấy các nước đi bắt quân
    capturing_moves = self._get_capturing_moves(game)

    # Thử từng nước đi bắt quân
    for from_pos, to_positions in capturing_moves.items():
        for to_pos in to_positions:
            temp_game = XiangqiGame()
            temp_game.board = game.board.copy()
            temp_game.current_player = game.current_player
            temp_game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])

            # Gọi quiescence tìm kiếm đệ quy
            score = -self._quiescence_search(temp_game, -beta, -alpha, depth + 1, max_depth, start_time, time_limit)

            if score > alpha:
                alpha = score

            if alpha >= beta:
                return beta

    return alpha
