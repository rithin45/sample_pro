import express from "express";
import { signup, login, verifyToken, adminSignup } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/admin-signup", adminSignup);
router.post("/login", login);
router.get("/verify", protect, verifyToken);

export default router;
