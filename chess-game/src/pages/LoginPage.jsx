import React from "react";
import NavBar from "../components/NavBar";
import Login from "../components/Login";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - NavBar */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        <NavBar />
      </div>

      {/* Right Side - Home Component */}
      <div className="flex-grow p-4">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
