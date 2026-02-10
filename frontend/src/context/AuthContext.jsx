import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setToken(parsed.token);
        
        // Verify token with backend on app load
        verifyTokenWithBackend(parsed.token);
      } catch (error) {
        console.error("Error parsing auth data:", error);
        localStorage.removeItem("auth");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Verify token with backend
  const verifyTokenWithBackend = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token is invalid, clear auth
        localStorage.removeItem("auth");
        setUser(null);
        setToken(null);
      } else {
        const data = await response.json();
        // Update user with verified data from backend
        setUser(data.user);
      }
    } catch (error) {
      console.error("Token verification error:", error);
      localStorage.removeItem("auth");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only set up back button handler if user is logged in
    if (!user) return;

    const handlePopState = () => {
      // Show confirmation dialog
      const confirmed = window.confirm("Do you wish to logout?");
      
      if (confirmed) {
        // User confirmed logout
        logout();
      } else {
        // User canceled - push state back to prevent going back
        window.history.pushState(null, null, window.location.href);
      }
    };

    // Push initial state to prevent accidental back navigation
    window.history.pushState(null, null, window.location.href);
    
    // Add popstate listener
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user]);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    // Store in localStorage - but trust backend for role verification
    localStorage.setItem("auth", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
    
    // Remove the popstate listener before navigating
    window.onpopstate = null;
    
    // Redirect to login
    window.location.href = "/login";
  };

  // Function to verify user role with backend
  const verifyAdminRole = async () => {
    if (!token) return false;
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.user.role === "admin";
      }
      return false;
    } catch (error) {
      console.error("Admin verification error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, verifyAdminRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
