import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user information from localStorage
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser) {
      setUser(localUser);
    } else {
      navigate("/login"); // Redirect to login if no user found
    }
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        User Profile
      </h2>
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl mx-auto">
        <div className="mb-6">
          <strong className="text-lg text-gray-600">Email: </strong>
          <span className="text-lg text-gray-800">{user.email}</span>
        </div>
        <div className="mb-6">
          <strong className="text-lg text-gray-600">Full Name: </strong>
          <span className="text-lg text-gray-800">{user.fullname}</span>
        </div>
        <div className="mb-6">
          <strong className="text-lg text-gray-600">Role: </strong>
          <span className="text-lg text-gray-800">{user.role}</span>
        </div>
        <div className="mt-8 text-center">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
            onClick={() => navigate("/edit-profile")}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
