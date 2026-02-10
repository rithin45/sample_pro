import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

/**
 * UserRoute - Protects user-only pages (checkout, invoice, etc)
 * Only allows users with "user" role
 * BLOCKS ADMINS - Logs out admin users trying to access user pages
 * Security: Prevents admins from manually changing URL to access user functionality
 */
const UserRoute = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) return;

      if (!user) {
        setIsAuthorized(false);
        setVerifying(false);
        return;
      }

      // Check if user is admin
      if (user.role === "admin") {
        // Admin trying to access user page - LOG THEM OUT for security
        setIsAdmin(true);
        setIsAuthorized(false);
        setVerifying(false);
        return;
      }

      // Regular user
      setIsAuthorized(true);
      setVerifying(false);
    };

    checkAuthorization();
  }, [user, loading]);

  // If admin tried to access user page, log them out immediately
  useEffect(() => {
    if (isAdmin) {
      console.warn("⚠️ Security: Admin attempted to access user-only page. Logging out...");
      // Give a brief moment for component to render message, then logout
      const timer = setTimeout(() => {
        logout();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, logout]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  // If admin, show message and redirect
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">⚠️ Admin access denied on this page.</p>
          <p>Logging you out for security...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAuthorized) return <Navigate to="/" replace />;

  return children;
};

export default UserRoute;
