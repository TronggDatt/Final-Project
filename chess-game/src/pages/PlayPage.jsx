import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validateByToken } from "../apis/api_auth"; // Import API function
import NavBar from "../components/NavBar";
import GameController from "../components/GameController";

const PlayPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        await validateByToken(token); // Validate token
      } catch (error) {
        localStorage.removeItem("token"); // Remove invalid token
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]); // Runs when the component mounts

  return (
    <div className="flex min-h-screen">
      {/* Left Side - NavBar */}
      <div className="w-1/4 bg-gray-800 text-white min-h-screen">
        <NavBar />
      </div>

      {/* Right Side - GameController Component */}
      <div className="w-3/4 p-6">
        <GameController />
      </div>
    </div>
  );
};

export default PlayPage;
