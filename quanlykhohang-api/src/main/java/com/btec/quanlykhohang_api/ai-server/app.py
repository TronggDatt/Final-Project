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
    """Get a move from the AI bot"""
    data = request.json
    game_state = data.get('gameState')
    difficulty = data.get('difficulty', 'medium')
    player = data.get('player', 'b')  # Default to black
    game_id = data.get('game_id')
    
    # Use existing game or create a new one
    if game_id and game_id in active_games:
        game = active_games[game_id]
        game.board.load_game_state(game_state)
    else:
        game = XiangqiGame(game_state)
        game_id = len(active_games) + 1
        active_games[game_id] = game
    
    # Set current player
    game.current_player = player
    
    # Create AI and get move
    ai = XiangqiAI(difficulty)
    from_pos, to_pos = ai.get_best_move(game)
    
    # Make the move
    piece = game.board.get_piece(from_pos[0], from_pos[1])
    game.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
    
    # Return the move and updated game state
    return jsonify({
        'game_id': game_id,
        'from': {'row': from_pos[0], 'col': from_pos[1]},
        'to': {'row': to_pos[0], 'col': to_pos[1]},
        'piece': piece,
        'game_state': game.board.to_game_state(),
        'current_player': game.current_player,
        'is_check': game.is_king_in_check(game.current_player),
        'is_checkmate': game.is_checkmate(game.current_player)
    })

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