import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OnlinePlay = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/game/create-room",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok)
        throw new Error("Không thể tạo phòng. Vui lòng thử lại!");

      const data = await response.json();
      navigate(`/game/${data.roomCode}`);
    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
      setErrorMessage(error.message);
    }
  };

  const handleJoinRoom = () => {
    const trimmedCode = roomCode.trim();
    if (trimmedCode) {
      navigate(`/game/${trimmedCode}`);
    } else {
      setErrorMessage("Vui lòng nhập mã phòng hợp lệ!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Chơi Online</h2>

      {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

      <button
        onClick={handleCreateRoom}
        className="bg-blue-500 text-white px-6 py-3 rounded-md mb-4"
      >
        Tạo Room
      </button>

      <input
        type="text"
        placeholder="Nhập mã phòng..."
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="border px-4 py-2 rounded-md mb-2"
      />

      <button
        onClick={handleJoinRoom}
        className="bg-green-500 text-white px-6 py-3 rounded-md"
      >
        Vào Room
      </button>
    </div>
  );
};

export default OnlinePlay;
