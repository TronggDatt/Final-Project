"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateByToken } from "../apis/api_auth";
import BotGame from "../components/BotGame"; // Import BotGame component

const PlayBotPage = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(
    window.matchMedia("(orientation: portrait)").matches
  );
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Chuyển hướng đến trang đăng nhập nếu không có token
        navigate("/login");
        return;
      }

      try {
        await validateByToken(token);
        // Token hợp lệ, người dùng đã đăng nhập
      } catch (error) {
        // Token không hợp lệ, xóa token và chuyển hướng đến trang đăng nhập
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    // Kiểm tra xác thực khi component được mount
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
          ></button> */}

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

      {/* BotGame Component */}
      <div className="flex-1 p-4">
        <BotGame /> {/* Render BotGame here */}
      </div>
    </div>
  );
};

export default PlayBotPage;
