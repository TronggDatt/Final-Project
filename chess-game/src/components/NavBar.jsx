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
  FaBars,
} from "react-icons/fa";
import { validateByToken } from "../apis/api_auth";

const NavBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // NEW

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsLogin(false);
    navigate("/login");
  }, [navigate]);

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
          handleLogout();
        }
      } else {
        setIsLogin(false);
      }
    };
    checkAuthStatus();
  }, [handleLogout]);

  return (
    <>
      {/* Toggle Button for Small Screens */}
      <button
        className="lg:hidden p-4 text-white bg-gray-800 fixed z-50"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <nav
        className={`h-screen bg-gray-800 text-white flex flex-col p-4 fixed z-40 transition-transform duration-300
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 w-64`}
      >
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

          {/* Play Dropdown */}
          <li className="relative">
            <button
              onClick={() => setIsPlayMenuOpen(!isPlayMenuOpen)}
              className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
            >
              <span className="flex items-center gap-3">
                <FaChess /> Play
              </span>
              <FaChevronRight
                className={`transform transition-transform duration-300 ${
                  isPlayMenuOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {isPlayMenuOpen && (
              <div className="absolute top-full left-0 mt-2 bg-gray-700 rounded shadow-lg w-40 z-50">
                <button
                  onClick={() => {
                    navigate("/play/friends");
                    setIsPlayMenuOpen(false); // Đóng menu sau khi chọn
                  }}
                  className="flex items-center gap-3 w-full p-2 hover:bg-gray-600 rounded"
                >
                  <FaUserFriends /> Online
                </button>
                <button
                  onClick={() => {
                    navigate("/play/computer");
                    setIsPlayMenuOpen(false); // Đóng menu sau khi chọn
                  }}
                  className="flex items-center gap-3 w-full p-2 hover:bg-gray-600 rounded"
                >
                  <FaRobot /> Offline
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

        {/* Authentication */}
        <div className="mt-auto">
          {isLogin ? (
            <div className="border-t border-gray-600 pt-4">
              <p className="text-center text-sm">
                Hello, <b>{user?.email}</b>
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
    </>
  );
};

export default NavBar;
