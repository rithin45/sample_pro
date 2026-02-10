import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJWTConfig } from "../config/jwt.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role: "user" });

  res.status(201).json({ message: "Signup successful", user: { id: user._id, role: user.role } });
};

// Protected admin signup - requires admin secret key
export const adminSignup = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    // Verify admin secret key
    const ADMIN_SECRET = process.env.ADMIN_SECRET;
    if (!adminSecret || adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid admin secret key. Admin registration denied." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // Create admin user
    const user = await User.create({ name, email, password, role: "admin" });

    res.status(201).json({ 
      message: "Admin signup successful", 
      user: { id: user._id, role: user.role, email: user.email } 
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const { JWT_SECRET, JWT_EXPIRES } = getJWTConfig();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyToken = async (req, res) => {
  try {
    // User is already authenticated by auth middleware
    // If we reach here, token is valid
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
