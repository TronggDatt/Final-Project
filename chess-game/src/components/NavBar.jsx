import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChess,
  FaUserFriends,
  FaRobot,
  FaInfoCircle,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaChevronRight,
} from "react-icons/fa";
import { validateByToken } from "../apis/api_auth"; // Import API function

const NavBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState(false); // State cho menu Play

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsLogin(false);
    navigate("/login");
  }, [navigate]); // useCallback giúp giữ `handleLogout` ổn định

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await validateByToken(token);
          setUser({ email: data.email, role: data.role });
          setIsLogin(true);
        } catch (error) {
          console.error("Token validation failed:", error);
          handleLogout(); // Giờ không còn lỗi no-use-before-define
        }
      } else {
        setIsLogin(false);
      }
    };
    checkAuthStatus();
  }, [handleLogout]); // Giờ handleLogout ổn định hơn

  return (
    <nav className="h-screen w-64 bg-gray-800 text-white flex flex-col p-4 fixed">
      <h1 className="text-2xl font-bold text-center mb-6">Xiangqi Game</h1>

      <ul className="space-y-4">
        <li>
          <Link
            to="/"
            className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
          >
            <FaHome /> Home
          </Link>
        </li>

        {/* Menu Play với Dropdown ngang */}
        <li
          className="relative"
          onMouseEnter={() => setIsPlayMenuOpen(true)}
          onMouseLeave={() => setIsPlayMenuOpen(false)}
        >
          <button
            onClick={() => setIsPlayMenuOpen(!isPlayMenuOpen)}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
          >
            <span className="flex items-center gap-3">
              <FaChess /> Play
            </span>
            <FaChevronRight />
          </button>

          {isPlayMenuOpen && (
            <div className="absolute left-full top-0 ml-2 bg-gray-700 rounded shadow-lg w-40">
              <button
                onClick={() => navigate("/play/friends")}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-600 rounded"
              >
                <FaUserFriends /> Play Online
              </button>
              <button
                onClick={() => navigate("/play/computer")}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-600 rounded"
              >
                <FaRobot /> Play Offline
              </button>
            </div>
          )}
        </li>

        <li>
          <Link
            to="/about"
            className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
          >
            <FaInfoCircle /> About
          </Link>
        </li>
      </ul>

      {/* Authentication Status */}
      <div className="mt-auto">
        {isLogin ? (
          <div className="border-t border-gray-600 pt-4">
            <p className="text-center text-sm">
              Xin chào, <b>{user?.email}</b>!
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded w-full mt-2"
            >
              <FaSignOutAlt /> Log Out
            </button>
          </div>
        ) : (
          <ul className="space-y-4 border-t border-gray-600 pt-4">
            <li>
              <Link
                to="/login"
                className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
              >
                <FaSignInAlt /> Log In
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
              >
                <FaUserPlus /> Register
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
