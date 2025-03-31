import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Kết nối WebSocket với backend

const RoomList = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.on("updateRooms", (data) => {
      setRooms(data);
    });
    return () => socket.off("updateRooms");
  }, []);

  return (
    <div className="bg-wood-pattern min-h-screen p-5 grid grid-cols-6 gap-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-green-700 p-3 rounded-lg shadow-lg flex flex-col items-center"
        >
          <div className="w-20 h-10 bg-black rounded-lg flex items-center justify-center text-white">
            {room.id}
          </div>
          <p className="text-white mt-2">{room.player1} vs {room.player2 || "Waiting..."}</p>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
