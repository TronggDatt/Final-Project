import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Welcome to Xiangqi (Chinese Chess)
        </h2>
        <p className="text-gray-600 max-w-lg">
          Challenge your friends or play against the AI ​​in this tactical chess
          game. Log in to save your progress!
        </p>
        <Link
          to="/game"
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          Start playing
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
