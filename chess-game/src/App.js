import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  // Navigate,
} from "react-router-dom";
import React from "react";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
// import GameController from "./components/GameController";
import PlayPage from "./pages/PlayPage";
import RegisterPage from "./pages/RegisterPage";

// Fake role check function (có thể lấy từ localStorage, token, context, etc.)
// const getUserRole = () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   return user?.role || "user"; // default role
// };

// const PrivateAdminRoute = ({ children }) => {
//   const role = getUserRole();
//   return role === "admin" ? children : <Navigate to="/" />;
// };

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/game" element={<PlayPage />} />
      </Routes>
    </Router>
  );
}

export default App;
