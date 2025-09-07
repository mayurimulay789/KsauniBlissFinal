import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { checkAuth } from "../store/slices/authSlice";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, adminOnly = false, digitalMarketerOnly = false }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { isAuthenticated, user, isLoading, initialized, token } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    const isTokenValid = tokenExpiry && new Date(tokenExpiry) > new Date();

    // Run auth check if not initialized or token is about to expire (within 1 day)
    if (!initialized || (isTokenValid && new Date(tokenExpiry) <= new Date(Date.now() + 24 * 60 * 60 * 1000))) {
      dispatch(checkAuth());
    }
  }, [dispatch, initialized]);

  // 🚀 Prevent flicker → wait until auth is checked
  if (isLoading || !initialized) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Check digital marketer access
  if (digitalMarketerOnly && user?.role !== "admin" && user?.role !== "digitalMarketer") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
