import jwt from "jsonwebtoken";
import { getJWTConfig } from "../config/jwt.js";

export const protect = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized" });

  try {
    const token = auth.split(" ")[1];
    const { JWT_SECRET } = getJWTConfig();
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};
