import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <p>Loading...</p>; // Show a loading indicator while checking authentication
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
