import React from "react";
import { Routes, Route } from "react-router-dom";

// Public pages
import Home from "../components/Home";
import ProductDetail from "../components/ProductDetail";
import Cart from "../components/Cart";

// Protected user pages
import Checkout from "../components/Checkout";
import Invoice from "../components/Invoice";

// Auth pages
import Login from "../auth/Login";
import Signup from "../auth/Signup";

// Admin
import AdminDashboard from "../admin/AdminDashboard";

// Route protection
import ProtectedRoute from "../auth/ProtectedRoute";
import AdminRoute from "../auth/AdminRoute";
import UserRoute from "../auth/UserRoute";

const Approute = () => {
  return (
    <Routes>

      {/* PUBLIC ROUTES - Accessible to all (logged in or not) */}
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* USER PROTECTED ROUTES - Only users can access, admins are logged out */}
      <Route path="/checkout" element={
          <UserRoute>
            <Checkout />
          </UserRoute>
        }
      />

      <Route
        path="/invoice"
        element={
          <UserRoute>
            <Invoice />
          </UserRoute>
        }
      />

      {/* ADMIN ONLY ROUTES - Only admins can access */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

    </Routes>
  );
};

export default Approute;
