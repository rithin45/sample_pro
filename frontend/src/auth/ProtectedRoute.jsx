import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading, verifyAdminRole } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      // Wait for initial auth loading
      if (loading) return;

      if (!user) {
        setIsAuthorized(false);
        setVerifying(false);
        return;
      }

      // If role-specific check needed (admin)
      if (role) {
        if (role === "admin") {
          // Verify admin role with backend to prevent localStorage manipulation
          const isAdmin = await verifyAdminRole();
          setIsAuthorized(isAdmin);
        } else {
          setIsAuthorized(user.role === role);
        }
      } else {
        // No specific role required, just need to be authenticated
        setIsAuthorized(true);
      }

      setVerifying(false);
    };

    checkAuthorization();
  }, [user, loading, role, verifyAdminRole]);

  // Wait for auth state to load from localStorage
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

export default ProtectedRoute;
