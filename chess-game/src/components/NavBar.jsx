import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChess,
  FaInfoCircle,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from "react-icons/fa";
import { validateByToken } from "../apis/api_auth"; // Import API function

const NavBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false); // Track login state

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await validateByToken(token);
          setUser({ email: data.email, role: data.role });
          setIsLogin(true); // User is logged in
        } catch (error) {
          console.error("Token validation failed:", error);
          handleLogout();
        }
      } else {
        setIsLogin(false); // No token, user is logged out
      }
    };
    checkAuthStatus();
  }, []);

  const handlePlayClick = () => {
    if (!isLogin) {
      navigate("/login");
    } else {
      navigate("/game");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsLogin(false); // Update login state
    navigate("/login");
  };

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
        <li>
          <button
            onClick={handlePlayClick}
            className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded w-full text-left"
          >
            <FaChess /> Play
          </button>
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
