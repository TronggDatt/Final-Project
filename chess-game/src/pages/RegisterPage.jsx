import React from "react";
import NavBar from "../components/NavBar";
import Register from "../components/Register";

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - NavBar */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        <NavBar />
      </div>

      {/* Right Side - Home Component */}
      <div className="flex-grow p-4">
        <Register />
      </div>
    </div>
  );
};

export default RegisterPage;
