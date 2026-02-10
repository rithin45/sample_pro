import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";

export const getAnalytics = async (req, res) => {
  try {
    // Get total orders
    const orders = await Order.find();
    const totalOrders = orders.length;

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate return rate (assuming orders with status "returned" are returns)
    const returnedOrders = orders.filter(order => order.status === "returned").length;
    const returnRate = totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : 0;

    // Get total products
    const products = await Product.find();
    const totalProducts = products.length;

    // Calculate total stock
    const totalStock = products.reduce((sum, product) => {
      return sum + product.variants.reduce((variantSum, variant) => {
        return variantSum + variant.sizes.reduce((sizeSum, size) => sizeSum + size.stock, 0);
      }, 0);
    }, 0);

    res.json({
      totalRevenue,
      totalOrders,
      returnRate,
      totalProducts,
      totalStock,
      recentOrders: orders.slice(-5).reverse()
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: "pending"
    });

    res.status(201).json({
      message: "Order created successfully",
      order
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// New checkout endpoint - creates order AND clears cart
export const checkout = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }

    console.log("🛒 Checkout initiated for user:", req.user.id);
    console.log("📦 Order items:", items.length);
    console.log("💳 Payment method:", paymentMethod);

    // 1. Create the order
    const order = await Order.create({
      userId: req.user.id,
      items: items.map(item => ({
        productId: item.productId?._id || item.productId,
        name: item.name,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      })),
      shippingAddress,
      paymentMethod: paymentMethod.toLowerCase(),
      totalAmount,
      status: "confirmed"  // Assume payment successful
    });

    console.log("✅ Order created:", order._id);

    // 2. Reduce product stock in database
    for (const item of items) {
      const productId = item.productId?._id || item.productId;
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      console.log(`📉 Stock reduced for product ${productId} by ${item.quantity}`);
    }

    // 3. Delete all CartItems for this user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      await CartItem.deleteMany({ cartId: cart._id });
      console.log("🗑️ CartItems deleted:", cart.items.length, "items");

      // 4. Clear the cart
      cart.items = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
      await cart.save();
      console.log("🧹 Cart cleared");
    }

    res.status(201).json({
      message: "Order placed successfully! Cart cleared.",
      order: order.populate("userId", "name email")
    });
  } catch (error) {
    console.error("❌ Checkout error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["pending", "confirmed", "shipped", "delivered", "returned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({
      message: "Order updated successfully",
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const buyNow = async (req, res) => {
  try {
    const { product, quantity, shippingAddress, paymentMethod, totalAmount } = req.body;
    
    if (!product || quantity <= 0) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    console.log("🛍️ Buy Now initiated for user:", req.user.id);
    console.log("📦 Product:", product.name, "| Qty:", quantity);
    console.log("💳 Payment method:", paymentMethod);

    // 1. Create the order directly (without cart)
    const order = await Order.create({
      userId: req.user.id,
      items: [{
        productId: product.id,
        name: product.name,
        color: product.color,
        size: product.size,
        price: product.price,
        quantity: quantity
      }],
      shippingAddress,
      paymentMethod: paymentMethod.toLowerCase(),
      totalAmount,
      status: "confirmed"
    });

    console.log("✅ Buy Now order created:", order._id);

    // 2. Reduce product stock in database
    await Product.findByIdAndUpdate(
      product.id,
      { $inc: { "variants.$[var].sizes.$[size].stock": -quantity } },
      { 
        arrayFilters: [
          { "var.color": product.color },
          { "size.size": product.size }
        ],
        new: true
      }
    );
    console.log(`📉 Stock reduced for product ${product.name} by ${quantity}`);

    res.status(201).json({
      message: "Order placed successfully!",
      order: order.populate("userId", "name email")
    });
  } catch (error) {
    console.error("❌ Buy Now error:", error);
    res.status(500).json({ message: error.message });
  }
};
