import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const UserSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/signup", { name, email, password });
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-[#111] p-10 rounded-2xl w-full max-w-sm">
        <h1 className="text-3xl font-black mb-2">Create Account</h1>
        <p className="text-gray-400 mb-6">Join us to shop amazing shoes</p>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <input 
            type="text"
            placeholder="Full Name" 
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full p-3 bg-black border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white"
          />
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account? <Link to="/login" className="text-white font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignup;
