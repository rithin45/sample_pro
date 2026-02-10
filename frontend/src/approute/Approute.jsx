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
import HomeRoute from "../auth/HomeRoute";

const Approute = () => {
  return (
    <Routes>

      {/* HOME ROUTE - Blocked for admins, accessible to guests and users */}
      <Route path="/" element={
        <HomeRoute>
          <Home />
        </HomeRoute>
      } />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* CART ROUTE - Protected, users only (requires login) */}
      <Route
        path="/cart"
        element={
          <UserRoute>
            <Cart />
          </UserRoute>
        }
      />

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
