// Verify user is authenticated as admin
export const isAdmin = (req, res, next) => {
  // req.user is set by protect middleware
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only. Insufficient permissions." });
  }
  
  next();
};
