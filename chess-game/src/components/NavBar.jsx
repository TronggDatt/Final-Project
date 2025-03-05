import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-xl font-bold">Xiangqi Game</h1>
        <ul className="flex gap-4">
          <li>
            <Link to="/" className="hover:text-gray-400">
              Home
            </Link>
          </li>
          <li>
            <Link to="/game" className="hover:text-gray-400">
              Play
            </Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-gray-400">
              Đăng nhập
            </Link>
          </li>
          <li>
            <Link to="/register" className="hover:text-gray-400">
              Đăng ký
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
