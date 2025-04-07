import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { validateByToken } from "../apis/api_auth";
import GameController from "../components/GameController";

const PlayPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [isPortrait, setIsPortrait] = useState(
    window.matchMedia("(orientation: portrait)").matches
  );
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        await validateByToken(token);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    checkAuth();

    // Lắng nghe thay đổi chiều màn hình
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleOrientationChange = (e) => setIsPortrait(e.matches);
    mediaQuery.addEventListener("change", handleOrientationChange);

    return () => {
      mediaQuery.removeEventListener("change", handleOrientationChange);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative">
      {/* ❗ Portrait mode: Toggle slide NavBar */}
      {isPortrait && (
        <>
          {/* <button
            onClick={() => setShowNav(!showNav)}
            className="absolute top-4 left-4 z-50 bg-gray-800 text-white px-3 py-2 rounded shadow-md lg:hidden"
          >
            ☰ Menu
          </button> */}

          {showNav && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              onClick={() => setShowNav(false)}
            />
          )}

          <div
            className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-50 transform transition-transform duration-300 ${
              showNav ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* <NavBar /> */}
          </div>
        </>
      )}

      {/* ❗ Landscape mode: NavBar cố định */}
      {!isPortrait && (
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* <NavBar /> */}
        </div>
      )}

      {/* GameController */}
      <div className="flex-1 p-4">
        <GameController gameId={gameId} />
      </div>
    </div>
  );
};

export default PlayPage;
