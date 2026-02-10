import api from "./api";

export const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const res = await api.get("/cart");
      return res.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (itemData) => {
    try {
      const res = await api.post("/cart/add", itemData);
      return res.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      return res.data;
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      return res.data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const res = await api.delete("/cart");
      return res.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },

  // Get cart item count
  getCartCount: async () => {
    try {
      const res = await api.get("/cart/count");
      return res.data.count;
    } catch (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }
  },

  // Checkout - creates order and clears cart
  checkout: async (orderData) => {
    try {
      const res = await api.post("/orders/checkout", orderData);
      return res.data;
    } catch (error) {
      console.error("Error during checkout:", error);
      throw error;
    }
  },

  // Buy Now - direct purchase from product page
  buyNow: async (orderData) => {
    try {
      const res = await api.post("/orders/buy-now", orderData);
      return res.data;
    } catch (error) {
      console.error("Error during buy now:", error);
      throw error;
    }
  }
};
