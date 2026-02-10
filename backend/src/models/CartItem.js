import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  color: String,
  size: Number,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: String,
  maxStock: Number,
  subtotal: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate subtotal before saving
cartItemSchema.pre("save", async function() {
  this.subtotal = this.price * this.quantity;
});

export default mongoose.model("CartItem", cartItemSchema);
