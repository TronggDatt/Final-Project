import React from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-8 pl-72">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          About Xiangqi Game
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed">
          Welcome to the{" "}
          <span className="font-semibold text-indigo-600">Xiangqi Game</span>!
          <br />
          This project is proudly developed by{" "}
          <span className="font-semibold">Trong Dat</span> and{" "}
          <span className="font-semibold">Duc Anh</span>. Leveraging modern
          technologies like <span className="font-semibold">ReactJS</span> and{" "}
          <span className="font-semibold">Tailwind CSS</span>, we aim to bring
          an engaging and visually appealing experience to every player.
        </p>

        <p className="text-gray-700 text-lg leading-relaxed mt-6">
          Our ultimate goal is to integrate advanced AI techniques, particularly
          <span className="font-semibold text-purple-600">
            {" "}
            Deep Learning
          </span>{" "}
          and
          <span className="font-semibold text-purple-600">
            {" "}
            Reinforcement Learning
          </span>
          , to develop a smart and challenging opponent.
        </p>

        <p className="text-gray-700 text-lg leading-relaxed mt-6">
          The game strictly follows traditional Chinese Chess rules,
          meticulously records every move, and offers clear visualization of
          move history using unique notations for a seamless playing experience.
        </p>

        <Link to="/" className="inline-block mt-8">
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition duration-300">
            <FaHome /> Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default About;
