from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from game import XiangqiGame
from ai import XiangqiAI

app = Flask(__name__)
CORS(app)

# Store active games
active_games = {}

@app.route('/api/bot/init', methods=['GET'])
def init_game():
    """Initialize a new game and return the initial state"""
    game = XiangqiGame()
    game_id = len(active_games) + 1
    active_games[game_id] = game
    
    return jsonify({
        'game_id': game_id,
        'game_state': game.board.to_game_state(),
        'current_player': game.current_player
    })


@app.route('/api/bot/move', methods=['POST'])
def get_bot_move():
    """Get a move from the AI bot."""
    data = request.json
    game_state = data.get('gameState')
    difficulty = data.get('difficulty', 'medium')
    player = data.get('player', 'b')
    game_id = data.get('game_id')

    if game_id and game_id in active_games:
        game = active_games[game_id]
        game.board.load_game_state(game_state)
    else:
        game = XiangqiGame(game_state)
        game_id = len(active_games) + 1
        active_games[game_id] = game

    game.current_player = player

    ai = XiangqiAI(difficulty)
    from_pos, to_pos = ai.get_best_move(game)

    # Get the piece BEFORE making the move
    piece = game.board.get_piece(from_pos[0], from_pos[1])

    # Validate that we have a valid piece
    if piece is None:
        # This is a defensive check - log the error and return a helpful message
        print(f"ERROR: Attempted to move a null piece from {from_pos} to {to_pos}")
        print(f"Current game state: {game_state}")
        return jsonify({
            'error': 'Invalid move: No piece at the starting position',
            'details': {
                'from_pos': from_pos,
                'to_pos': to_pos,
                'current_player': player
            }
        }), 400

    # Make the move after validating the piece
    game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])

    # Wrap the response in a data property to match frontend expectations
    response_data = {
        'data': {
            'game_id': game_id,
            'from': {'row': from_pos[0], 'col': from_pos[1]},
            'to': {'row': to_pos[0], 'col': to_pos[1]},
            'piece': piece,  # This should now never be null
            'game_state': game.board.to_game_state(),
            'current_player': game.current_player,
            'is_check': game.is_king_in_check(game.current_player),
            'is_checkmate': game.is_checkmate(game.current_player)
        }
    }

    return jsonify(response_data)


@app.route('/api/bot/difficulty', methods=['GET'])
def get_difficulty_levels():
    """Get available difficulty levels"""
    ai = XiangqiAI()
    return jsonify({
        'levels': list(ai.difficulty_settings.keys()),
        'descriptions': {
            'easy': 'Dễ - Phù hợp cho người mới chơi',
            'medium': 'Trung bình - Đối thủ có khả năng tốt',
            'hard': 'Khó - Thách thức cho người chơi giỏi'
        }
    })

@app.route('/api/bot/analyze', methods=['POST'])
def analyze_position():
    """Analyze a position and return evaluation"""
    data = request.json
    game_state = data.get('gameState')
    difficulty = data.get('difficulty', 'medium')
    
    game = XiangqiGame(game_state)
    ai = XiangqiAI(difficulty)
    
    evaluation = ai.evaluate_position(game)
    best_move = ai.get_best_move(game)
    
    return jsonify({
        'evaluation': evaluation,
        'best_move': {
            'from': {'row': best_move[0][0], 'col': best_move[0][1]},
            'to': {'row': best_move[1][0], 'col': best_move[1][1]}
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)