import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaChess,
  FaInfoCircle,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const NavBar = () => {
  return (
    <nav className="h-screen w-64 bg-gray-800 text-white flex flex-col p-4 fixed">
      {/* Logo */}
      <h1 className="text-2xl font-bold text-center mb-6">Xiangqi Game</h1>

      {/* Menu Items */}
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
          <Link
            to="/game"
            className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
          >
            <FaChess /> Play
          </Link>
        </li>
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
        <li>
          <Link
            to="/about"
            className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
          >
            <FaInfoCircle /> About
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
