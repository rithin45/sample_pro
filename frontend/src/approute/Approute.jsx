import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load pages for code splitting
const Home = React.lazy(() => import("../components/Home"));
const ProductDetail = React.lazy(() => import("../components/ProductDetail"));
const Cart = React.lazy(() => import("../components/Cart"));
const Checkout = React.lazy(() => import("../components/Checkout"));
const Invoice = React.lazy(() => import("../components/Invoice"));
const Login = React.lazy(() => import("../auth/Login"));
const Signup = React.lazy(() => import("../auth/Signup"));
const AdminDashboard = React.lazy(() => import("../admin/AdminDashboard"));

// Route protection
import ProtectedRoute from "../auth/ProtectedRoute";
import AdminRoute from "../auth/AdminRoute";
import UserRoute from "../auth/UserRoute";
import HomeRoute from "../auth/HomeRoute";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p>Loading...</p>
    </div>
  </div>
);

const Approute = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
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
    </Suspense>
  );
};

export default Approute;
