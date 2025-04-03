import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validateByToken } from "../apis/api_auth";

const Home = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");

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

  // const handleCreateRoom = async () => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:8080/api/game/create-room",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );
  //     const data = await response.json();
  //     navigate(`/game/${data.roomCode}`);
  //   } catch (error) {
  //     console.error("Lỗi khi tạo phòng:", error);
  //   }
  // };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/game/${roomCode.trim()}`);
    } else {
      alert("Vui lòng nhập mã phòng hợp lệ!");
    }
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
            onClick={() => handleNavigation("/game")}
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
    </div>
  );
};

export default Home;
