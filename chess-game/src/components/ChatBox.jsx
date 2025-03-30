import React, { useState } from "react";
import MoveHistory from "./MoveHistory";

const ChatBox = ({ messages = [], onSendChat, moves = [] }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const currentEmail = localStorage.getItem("email");

  const handleSend = () => {
    if (message.trim()) {
      onSendChat(message);
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
          ♟️ Moves
        </button>
      </div>

      {/* Nội dung */}
      <div className="flex-1 overflow-y-auto border-b border-gray-300 p-2 space-y-2">
        {activeTab === "chat" ? (
          Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, index) => {
              const isMe = msg.senderId === currentEmail;
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[70%] text-sm shadow ${
                      isMe
                        ? "bg-green-500 text-white self-end"
                        : "bg-gray-200 text-black self-start"
                    }`}
                  >
                    {!isMe && (
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        {msg.senderId}
                      </div>
                    )}
                    <div>{msg.content}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No messages yet</p>
          )
        ) : moves.length > 0 ? (
          <MoveHistory moveHistory={moves} />
        ) : (
          <p className="text-gray-500">No move yet</p>
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
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
