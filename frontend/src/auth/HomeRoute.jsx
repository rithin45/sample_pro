import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

/**
 * HomeRoute - Prevents admins from viewing home page
 * Guests and regular users can view home
 * Admins are redirected to /admin dashboard
 */
const HomeRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) {
        setVerifying(true);
        return;
      }

      // If admin, not authorized to view home
      if (user && user.role === "admin") {
        setIsAuthorized(false);
      } else {
        // Guest or regular user - authorized
        setIsAuthorized(true);
      }

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

  // If admin, redirect to admin dashboard
  if (user && user.role === "admin") {
    console.warn("⚠️ Security: Admin cannot access home page. Redirecting to admin dashboard...");
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default HomeRoute;
