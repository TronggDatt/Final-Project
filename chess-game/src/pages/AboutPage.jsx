import React from "react";
import About from "../components/About";

const AboutPage = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="flex-grow p-4">
        <About />
      </div>
    </div>
  );
};

export default AboutPage;
