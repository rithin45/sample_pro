import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";

// Helper function to calculate and update cart totals
const updateCartTotals = async (cartId) => {
  const items = await CartItem.find({ cartId });
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  await Cart.findByIdAndUpdate(cartId, { totalItems, totalPrice });
};

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: "items",
        populate: { path: "productId", select: "name price" }
      });
    
    if (!cart) {
      // Create empty cart for user
      cart = await Cart.create({
        userId: req.user.id,
        items: []
      });
    }

    res.json({ cart });
  } catch (error) {
    console.error("❌ Get cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, name, color, size, price, quantity, image, maxStock } = req.body;

    if (!productId || !name || !price || !quantity) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    if (quantity > maxStock) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot add more than ${maxStock} items in stock` 
      });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      // Create new cart if doesn't exist
      cart = await Cart.create({
        userId: req.user.id,
        items: []
      });
      console.log("✅ New cart created:", cart._id);
    }

    // Check if item already exists with same product, color, and size
    let cartItem = await CartItem.findOne({
      cartId: cart._id,
      productId,
      color,
      size
    });

    if (cartItem) {
      // Update quantity if item exists
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > maxStock) {
        return res.status(400).json({ 
          success: false,
          message: `Cannot add more than ${maxStock} items in stock` 
        });
      }
      cartItem.quantity = newQuantity;
      await cartItem.save();
      console.log("📦 CartItem updated - Qty:", newQuantity, "Item ID:", cartItem._id);
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cartId: cart._id,
        productId,
        name,
        color,
        size,
        price,
        quantity,
        image,
        maxStock
      });
      
      // Add item reference to cart
      cart.items.push(cartItem._id);
      await cart.save();
      console.log("➕ New CartItem created:", cartItem._id, "Product:", name);
    }

    // Update cart totals
    await updateCartTotals(cart._id);

    // Fetch and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items",
      populate: { path: "productId", select: "name price" }
    });

    console.log("📊 Cart totals - Items:", updatedCart.totalItems, "Price:", updatedCart.totalPrice);

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart: updatedCart
    });
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to add item to cart" 
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    console.log("🔄 PUT /cart/:itemId route hit!");
    console.log("  itemId from params:", itemId);
    console.log("  quantity from body:", quantity);

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      console.log("❌ Cart not found for user:", req.user.id);
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      console.log("❌ CartItem not found:", itemId);
      return res.status(404).json({ message: "Item not found in cart" });
    }

    console.log("🔄 Updating CartItem:", itemId, "Qty:", cartItem.quantity, "→", quantity);

    // If quantity is 0 or less, delete the item
    if (quantity <= 0) {
      await CartItem.findByIdAndDelete(itemId);
      cart.items = cart.items.filter(id => id.toString() !== itemId);
      await cart.save();
      
      console.log("🗑️ CartItem deleted (qty ≤ 0):", itemId);
      
      // Update cart totals
      await updateCartTotals(cart._id);
      
      // Fetch and return updated cart
      const updatedCart = await Cart.findById(cart._id).populate({
        path: "items",
        populate: { path: "productId", select: "name price" }
      });

      return res.json({
        message: "Item removed from cart (quantity reached 0)",
        cart: updatedCart
      });
    }

    if (quantity > cartItem.maxStock) {
      return res.status(400).json({ message: `Cannot add more than ${cartItem.maxStock} items in stock` });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    console.log("✅ CartItem quantity updated:", itemId, "New Qty:", quantity);

    // Update cart totals
    await updateCartTotals(cart._id);

    // Fetch and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items",
      populate: { path: "productId", select: "name price" }
    });

    console.log("📊 Cart totals updated - Items:", updatedCart.totalItems, "Price:", updatedCart.totalPrice);

    res.json({
      message: "Cart item updated",
      cart: updatedCart
    });
  } catch (error) {
    console.error("❌ Update cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Delete CartItem document
    await CartItem.findByIdAndDelete(itemId);
    console.log("🗑️ CartItem deleted from DB:", itemId);

    // Remove item reference from cart
    cart.items = cart.items.filter(id => id.toString() !== itemId);
    await cart.save();
    console.log("🔗 Cart reference removed, remaining items:", cart.items.length);

    // Update cart totals
    await updateCartTotals(cart._id);

    // Fetch and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items",
      populate: { path: "productId", select: "name price" }
    });

    console.log("📊 Cart totals updated - Items:", updatedCart.totalItems, "Price:", updatedCart.totalPrice);

    res.json({
      message: "Item removed from cart",
      cart: updatedCart
    });
  } catch (error) {
    console.error("❌ Remove from cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Delete all CartItems for this cart
    await CartItem.deleteMany({ cartId: cart._id });

    // Clear items array and reset totals
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.json({
      message: "Cart cleared",
      cart
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    const count = cart ? cart.totalItems : 0;

    res.json({ count });
  } catch (error) {
    console.error("Get cart count error:", error);
    res.status(500).json({ message: error.message });
  }
};
