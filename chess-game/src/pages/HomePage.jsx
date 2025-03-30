import React from "react";
import Home from "../components/Home";

const HomePage = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Right Side - Home Component */}
      <div className="flex-grow p-4">
        <Home />
      </div>
    </div>
  );
};

export default HomePage;
