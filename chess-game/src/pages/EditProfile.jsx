import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

const EditProfile = () => {
  const [user, setUser] = useState({
    email: "",
    fullname: "",
    role: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the current user information from localStorage
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser) {
      setUser(localUser);
    } else {
      navigate("/login"); // Redirect to login if no user found
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save updated user information to localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // Show SweetAlert success message
    Swal.fire({
      icon: "success",
      title: "Profile Updated",
      text: "Your profile information has been updated successfully.",
      confirmButtonText: "Okay",
    }).then(() => {
      navigate("/profile"); // Redirect back to the profile page after closing the alert
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Edit Profile
      </h2>
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="text-lg text-gray-600" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled
            />
          </div>
          <div className="mb-6">
            <label className="text-lg text-gray-600" htmlFor="fullname">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={user.fullname}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="text-lg text-gray-600" htmlFor="role">
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={user.role}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-8 text-center">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
