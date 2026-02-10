import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      
      // Redirect based on role - use replace to prevent back button to login
      if (res.data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-[#111] p-10 rounded-2xl w-full max-w-sm">
        <h1 className="text-3xl font-black mb-2">Welcome Back</h1>
        <p className="text-gray-400 mb-6">Login as User or Admin</p>
        
        {error && <div className="bg-red-900 text-red-100 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email"
            placeholder="Email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-black border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-black border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white"
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 font-bold rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          New customer? <Link to="/signup" className="text-white font-bold hover:underline">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
