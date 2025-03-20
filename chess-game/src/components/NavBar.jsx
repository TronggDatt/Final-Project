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

const NavBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handlePlayClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/game");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null); // Cập nhật lại state
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

      {/* Hiển thị trạng thái đăng nhập */}
      <div className="mt-auto">
        {user ? (
          <div className="border-t border-gray-600 pt-4">
            <p className="text-center text-sm">
              Xin chào, <b>{user.fullName || user.email}</b>!
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
