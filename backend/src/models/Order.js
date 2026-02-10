import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    color: String,
    size: Number,
    price: Number,
    quantity: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "netbanking", "cod"],
    default: "cod"
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "returned", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);

