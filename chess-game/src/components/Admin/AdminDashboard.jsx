import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <div className="space-y-4">
        <Link
          to="/admin/users"
          className="block bg-blue-500 text-white px-4 py-2 rounded"
        >
          Manage Users
        </Link>
        <Link
          to="/admin/games"
          className="block bg-green-500 text-white px-4 py-2 rounded"
        >
          Manage Games
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
