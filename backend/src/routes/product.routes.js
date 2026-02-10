import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import upload from "../middlewares/upload.js";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

const router = express.Router();

// Get all products (public)
router.get("/", getProducts);

// Get single product (public)
router.get("/:id", getProduct);

// Create product (admin only) - with file uploads
router.post("/", protect, isAdmin, upload.any(), createProduct);

// Update product (admin only) - with file uploads
router.put("/:id", protect, isAdmin, upload.any(), updateProduct);

// Delete product (admin only)
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
