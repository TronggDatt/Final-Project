import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import React from "react";
import GameController from "./components/GameController";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Layout from "./components/Layout";
import AdminDashboard from "./components/Admin/AdminDashboard";

// Fake role check function (có thể lấy từ localStorage, token, context, etc.)
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role || "user"; // default role
};

const PrivateAdminRoute = ({ children }) => {
  const role = getUserRole();
  return role === "admin" ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<About />} />
          <Route path="game" element={<GameController />} />
          <Route
            path="admin"
            element={
              <PrivateAdminRoute>
                <AdminDashboard />
              </PrivateAdminRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
