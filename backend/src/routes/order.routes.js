import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getAnalytics,
  createOrder,
  checkout,
  buyNow,
  getOrders,
  getOrder,
  updateOrderStatus
} from "../controllers/order.controller.js";

const router = express.Router();

// Analytics - admin only
router.get("/admin/analytics", protect, isAdmin, getAnalytics);

// Get all orders - admin only
router.get("/admin/all", protect, isAdmin, getOrders);

// Checkout endpoint - creates order AND clears cart
router.post("/checkout", protect, checkout);

// Buy Now - direct purchase from product page
router.post("/buy-now", protect, buyNow);

// Create order - user
router.post("/", protect, createOrder);

// Get single order
router.get("/:id", protect, getOrder);

// Update order status - admin only
router.put("/:id/status", protect, isAdmin, updateOrderStatus);

export default router;
