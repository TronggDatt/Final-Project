import React from "react";
import { useNavigate } from "react-router-dom";
import { validateByToken } from "../apis/api_auth";

const Home = () => {
  const navigate = useNavigate();

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

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
      <main className="text-center p-6">
        <h2 className="text-4xl font-bold text-red-700 mb-6">Welcome to <span className="text-black">Xiangqi.com!</span></h2>
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => handleNavigation("/game")}
            className="w-72 flex items-center justify-between px-6 py-3 border-2 border-red-500 rounded-lg shadow bg-white hover:bg-red-100 transition"
          >
            <span className="text-lg font-semibold text-red-700">Play Online</span>
            <span className="text-sm text-gray-600">Challenge Players Worldwide or Play with friend</span>
          </button>

          <button 
            onClick={() => handleNavigation("/game")}
            className="w-72 flex items-center justify-between px-6 py-3 border-2 border-red-500 rounded-lg shadow bg-white hover:bg-red-100 transition"
          >
            <span className="text-lg font-semibold text-red-700">Play Offline</span>
            <span className="text-sm text-gray-600">Challenge Bot</span>
          </button>

          <button 
            onClick={() => handleNavigation("/Log")}
            className="w-72 flex items-center justify-between px-6 py-3 border-2 border-red-500 rounded-lg shadow bg-white hover:bg-red-100 transition"
          >
            <span className="text-lg font-semibold text-red-700">About</span>
            <span className="text-sm text-gray-600">Introduction</span>
          </button>

        </div>
      </main>
    </div>
  );
};

export default Home;
