import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validateByToken } from "../apis/api_auth";

const Home = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [botDifficulty, setBotDifficulty] = useState("medium");

  const handleNavigation = async (path) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await validateByToken(token);
      navigate(path);
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/game/${roomCode.trim()}`);
    } else {
      alert("Vui lòng nhập mã phòng hợp lệ!");
    }
  };

  const handlePlayWithBot = () => {
    // Lưu độ khó vào localStorage để sử dụng sau
    localStorage.setItem("botDifficulty", botDifficulty);
    navigate(`/play-bot`);
  };

  useEffect(() => {
    const handleOpenModal = () => setShowModal(true);
    window.addEventListener("openOnlineModal", handleOpenModal);
    return () => window.removeEventListener("openOnlineModal", handleOpenModal);
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
      <main className="text-center p-4">
        <h2 className="text-4xl font-bold text-red-700 mb-6">
          Welcome to <span className="text-black">Xiangqi.com!</span>
        </h2>

        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 border-2 border-red-500 rounded-lg shadow bg-white hover:bg-red-100 transition"
          >
            <span className="block text-lg font-semibold text-red-700">
              Play Online
            </span>
            <span className="block text-sm text-gray-600 mt-1">
              Challenge Players Worldwide or Play with friend
            </span>
          </button>

          <button
            onClick={() => setShowBotModal(true)}
            className="px-6 py-3 border-2 border-red-500 rounded-lg shadow bg-white hover:bg-red-100 transition"
          >
            <span className="block text-lg font-semibold text-red-700">
              Play Offline
            </span>
            <span className="block text-sm text-gray-600 mt-1">
              Challenge Bot
            </span>
          </button>

          <button
            onClick={() => handleNavigation("/about")}
            className="px-6 py-3 border-2 border-red-500 rounded-lg shadow bg-white hover:bg-red-100 transition"
          >
            <span className="block text-lg font-semibold text-red-700">
              About
            </span>
            <span className="block text-sm text-gray-600 mt-1">
              Introduction
            </span>
          </button>
        </div>
      </main>

      {/* Modal chọn "Tạo Room" hoặc "Nhập Room" */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Chơi Online</h3>

            <input
              type="text"
              placeholder="Nhập mã phòng..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="border px-3 py-2 rounded-md mb-2 w-full"
            />
            <button
              onClick={handleJoinRoom}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Vào Room
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 text-gray-500"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
      {/* Modal chọn độ khó Bot */}
      {showBotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Chọn độ khó</h3>

            <div className="flex flex-col space-y-3 mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value="easy"
                  checked={botDifficulty === "easy"}
                  onChange={() => setBotDifficulty("easy")}
                  className="form-radio h-5 w-5 text-green-500"
                />
                <span>Dễ - Phù hợp cho người mới chơi</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value="medium"
                  checked={botDifficulty === "medium"}
                  onChange={() => setBotDifficulty("medium")}
                  className="form-radio h-5 w-5 text-yellow-500"
                />
                <span>Trung bình - Đối thủ có khả năng tốt</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value="hard"
                  checked={botDifficulty === "hard"}
                  onChange={() => setBotDifficulty("hard")}
                  className="form-radio h-5 w-5 text-red-500"
                />
                <span>Khó - Thách thức cho người chơi giỏi</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value="expect"
                  checked={botDifficulty === "expect"}
                  onChange={() => setBotDifficulty("expect")}
                  className="form-radio h-5 w-5 text-red-500"
                />
                <span>
                  Chuyên gia - Thách thức cho người chơi chuyên gia phân tích
                </span>
              </label>
            </div>
            <button
              onClick={handlePlayWithBot}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Bắt đầu chơi
            </button>
            <button
              onClick={() => setShowBotModal(false)}
              className="w-full mt-4 text-gray-500"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
