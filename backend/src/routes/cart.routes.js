import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
} from "../controllers/cart.controller.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Get user's cart
router.get("/", getCart);

// Get cart item count (must come before :itemId routes)
router.get("/count", getCartCount);

// Add item to cart
router.post("/add", addToCart);

// Update cart item quantity (before DELETE /:itemId)
router.put("/:itemId", updateCartItem);

// Remove item from cart (before DELETE /)
router.delete("/:itemId", removeFromCart);

// Clear entire cart (must come last to avoid matching :itemId)
router.delete("/", clearCart);

export default router;
