import mongoose from "mongoose";

/* ---------- Size ---------- */
const SizeSchema = new mongoose.Schema(
  {
    size: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

/* ---------- Images ---------- */
const ImageSchema = new mongoose.Schema(
  {
    main: {
      type: String,
      required: true
    },
    sub: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

/* ---------- Variant ---------- */
const VariantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true
    },
    colorCode: {
      type: String,
      required: true
    },
    images: {
      type: ImageSchema,
      required: true
    },
    sizes: {
      type: [SizeSchema],
      required: true
    }
  },
  { _id: false }
);

/* ---------- Product ---------- */
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    variants: {
      type: [VariantSchema],
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
