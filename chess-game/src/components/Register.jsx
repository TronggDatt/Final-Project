import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../apis/api_auth"; // Import register function

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (password !== confirmPassword) {
      alert("Confirmation password does not match!");
      return;
    }

    try {
      await register(fullName, email, password, confirmPassword);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      alert(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register for an account
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Full name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition duration-300"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log In now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;