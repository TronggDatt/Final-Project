import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/bot";

export const initBotGame = async () => {
  const response = await axios.get(`${API_URL}/init`);
  return response.data;
};

export const getBotMoveAPI = async ({
  gameState,
  difficulty,
  player,
  game_id,
}) => {
  const response = await axios.post(`${API_URL}/move`, {
    gameState,
    difficulty,
    player,
    game_id,
  });
  return response.data;
};
