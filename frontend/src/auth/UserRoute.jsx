import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

/**
 * UserRoute - Protects user-only pages (checkout, invoice, etc)
 * Only allows users with "user" role
 * BLOCKS ADMINS - Redirects admin users back to /admin when trying to access user pages
 * Security: Prevents admins from manually changing URL to access user functionality
 */
const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) return;

      if (!user) {
        setIsAuthorized(false);
        setVerifying(false);
        return;
      }

      // Check if user is admin - admins cannot access user routes
      if (user.role === "admin") {
        setIsAuthorized(false);
        setVerifying(false);
        return;
      }

      // Regular user - authorized
      setIsAuthorized(true);
      setVerifying(false);
    };

    checkAuthorization();
  }, [user, loading]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If admin, redirect back to admin dashboard
  if (user.role === "admin") {
    console.warn("⚠️ Security: Admin attempted to access user-only page. Redirecting to admin dashboard...");
    return <Navigate to="/admin" replace />;
  }

  // If not authorized, redirect to home
  if (!isAuthorized) return <Navigate to="/" replace />;

  return children;
};

export default UserRoute;
