import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

/**
 * AdminRoute - Protects admin-only pages
 * Only allows authenticated users with admin role
 * Logs out non-admin users trying to access admin pages
 */
const AdminRoute = ({ children }) => {
  const { user, loading, verifyAdminRole } = useAuth();
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

      // Verify admin role with backend
      const isAdmin = await verifyAdminRole();
      setIsAuthorized(isAdmin);
      setVerifying(false);
    };

    checkAuthorization();
  }, [user, loading, verifyAdminRole]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAuthorized) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
