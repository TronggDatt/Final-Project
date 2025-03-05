import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Chào mừng đến với Xiangqi (Cờ Tướng)
        </h2>
        <p className="text-gray-600 max-w-lg">
          Thách thức bạn bè hoặc chơi với AI trong trò chơi cờ tướng chiến
          thuật. Đăng nhập để lưu tiến trình của bạn!
        </p>
        <Link
          to="/game"
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          Bắt đầu chơi
        </Link>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center p-4 mt-auto">
        © 2025 Xiangqi Game. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
