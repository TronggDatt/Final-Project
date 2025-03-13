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
    </div>
  );
};

export default Home;
