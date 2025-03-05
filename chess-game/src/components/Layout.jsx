import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <NavBar />

      {/* Nội dung chính */}
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center p-3 mt-auto">
        &copy; {new Date().getFullYear()} Xiangqi Game. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
