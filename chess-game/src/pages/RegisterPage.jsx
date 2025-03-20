import React from "react";
import NavBar from "../components/NavBar";
import Home from "../components/Home";
import Login from "../components/Login";
import Register from "../components/Register";

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - NavBar */}
      <div className="w-1/4 bg-gray-800 text-white min-h-screen">
        <NavBar />
      </div>

      {/* Right Side - Home Component */}
      <div className="w-3/4 p-6">
        <Register />
      </div>
    </div>
  );
};




export default RegisterPage