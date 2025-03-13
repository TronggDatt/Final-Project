import React, { useState } from "react";
import MoveHistory from "./MoveHistory";

const ChatBox = ({ messages = [], onSendMessage, moves = [] }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="w-96 h-[700px] border border-gray-300 p-2 flex flex-col">
      {/* Navbar */}
      <div className="flex border-b border-gray-300">
        <button
          className={`flex-1 py-2 ${
            activeTab === "chat"
              ? "border-b-2 border-blue-500 font-bold"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          💬 Chat
        </button>
        <button
          className={`flex-1 py-2 ${
            activeTab === "moves"
              ? "border-b-2 border-blue-500 font-bold"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("moves")}
        >
          ♟️ Nước đi
        </button>
      </div>

      {/* Nội dung */}
      <div className="flex-1 overflow-y-auto border-b border-gray-300 p-2">
        {activeTab === "chat" ? (
          Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-1 text-sm ${
                  msg.player === "r" ? "text-red-500" : "text-black"
                }`}
              >
                <b>{msg.player === "r" ? "Đỏ" : "Đen"}:</b> {msg.text}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Chưa có tin nhắn nào</p>
          )
        ) : moves.length > 0 ? (
          <MoveHistory moveHistory={moves} />
        ) : (
          <p className="text-gray-500">Chưa có nước đi nào</p>
        )}
      </div>

      {/* Ô nhập tin nhắn */}
      {activeTab === "chat" && (
        <div className="flex p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded p-1"
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
          >
            Gửi
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
