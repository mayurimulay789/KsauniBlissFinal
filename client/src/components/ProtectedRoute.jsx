"use client"

import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import { checkAuth } from "../store/slices/authSlice"
import LoadingSpinner from "./LoadingSpinner"

const ProtectedRoute = ({ children, adminOnly = false, digitalMarketerOnly = false }) => {
  const dispatch = useDispatch()
  const location = useLocation()

  const { isAuthenticated, user, isLoading, token } = useSelector((state) => state.auth)

  useEffect(() => {
    // Check authentication status if we have a token but no user data
    if ( !user && !isLoading) {
      dispatch(checkAuth())
    }
  }, [dispatch,  user, isLoading])

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated ) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check admin access
  if (adminOnly && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="mb-6 text-gray-600">You don't have permission to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    )
  }

  // Check digital marketer access
  if (digitalMarketerOnly && user.role !== "admin" && user.role !== "digitalMarketer") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="mb-6 text-gray-600">You don't have permission to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
