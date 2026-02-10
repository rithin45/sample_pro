import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { cartService } from "../services/cartService";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, error: cartError } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [cartSuccess, setCartSuccess] = useState("");
  const [showBuyNowForm, setShowBuyNowForm] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [buyNowForm, setBuyNowForm] = useState({
    address: "",
    paymentMethod: "cod"
  });

  useEffect(() => {
    // Check if user is logged in, redirect to login if not
    if (!user) {
      alert("Please login first to view product details!");
      navigate("/login", { replace: true });
      return;
    }
    fetchProduct();
  }, [id, user, navigate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const apiBase = baseUrl.replace("/api", ""); // Remove /api to get base URL
    return `${apiBase}${imagePath}`;
  };

  // --- Stock & Price Helpers ---
  const isProductInStock = (product) =>
    product?.variants.some((v) => v.sizes.some((s) => s.stock > 0));

  const isVariantInStock = (variant) =>
    variant.sizes.some((s) => s.stock > 0);

  // --- State ---
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Update selected variant when product loads
  useEffect(() => {
    if (product?.variants[0]) {
      setSelectedVariant(product.variants[0]);
      setSelectedImage(product.variants[0].images.main);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p>Product not found. <button onClick={() => navigate('/')} className="underline">Back to Shop</button></p>
      </div>
    );
  }

  if (!selectedVariant) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p>Loading variant...</p>
      </div>
    );
  }

  const allImages = [
    selectedVariant.images.main,
    ...selectedVariant.images.sub,
  ];

  const selectedSizeObj = selectedSize
    ? selectedVariant.sizes.find((s) => s.size == selectedSize)
    : null;

  // Calculate price to show: use selected size price, or the first available size price as a starting point
  const displayPrice = selectedSizeObj ? selectedSizeObj.price : selectedVariant.sizes[0].price;
  const maxQty = selectedSizeObj ? selectedSizeObj.stock : 1;
  const remainingStock = selectedSizeObj ? selectedSizeObj.stock - quantity : 0;

  // --- Logic Helpers ---
  const getProductPayload = () => {
    if (!selectedSizeObj) return null;
    return {
      id: product._id,
      name: product.name,
      color: selectedVariant.color,
      size: selectedSize,
      price: selectedSizeObj.price,
      quantity,
      image: selectedVariant.images.main,
      maxStock: selectedSizeObj.stock,
    };
  };

  // --- Handlers ---
  const handleAddToCart = async () => {
    const payload = getProductPayload();
    if (!payload) {
        alert("Please select a size first");
        return;
    }

    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setAdding(true);
    setCartSuccess("");
    try {
      const success = await addToCart({
        productId: payload.id,
        name: payload.name,
        color: payload.color,
        size: payload.size,
        price: payload.price,
        quantity: payload.quantity,
        image: payload.image,
        maxStock: payload.maxStock,
      });
      
      if (success) {
        setCartSuccess("Added to cart successfully!");
        setTimeout(() => navigate("/cart"), 1000);
      } else {
        alert(cartError || "Failed to add to cart");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    const payload = getProductPayload();
    if (!payload) {
        alert("Please select a size first");
        return;
    }

    if (!user) {
      alert("Please login to proceed");
      navigate("/login");
      return;
    }

    // Show the buy now form instead of directly buying
    setShowBuyNowForm(true);
  };

  const handleSubmitBuyNow = async () => {
    if (!buyNowForm.address.trim()) {
      alert("Please enter a shipping address");
      return;
    }

    const payload = getProductPayload();
    setBuyNowLoading(true);

    try {
      const orderData = {
        product: payload,
        quantity: payload.quantity,
        shippingAddress: buyNowForm.address,
        paymentMethod: buyNowForm.paymentMethod,
        totalAmount: payload.price * payload.quantity
      };

      const response = await cartService.buyNow(orderData);
      console.log("Buy Now response:", response);
      
      // Format data for Invoice page
      const invoiceData = {
        order: response.order.items,
        customer: {
          name: user.name || "Customer",
          address: buyNowForm.address,
          phone: user.phone || "N/A"
        },
        timestamp: new Date().toISOString(),
        totals: {
          subtotal: payload.price * quantity,
          tax: 0,
          delivery: 0,
          discount: 0,
          total: payload.price * quantity
        }
      };
      
      // Navigate to invoice page with order details
      navigate("/invoice", { state: invoiceData });
    } catch (error) {
      console.error("Buy Now error:", error);
      alert(error.response?.data?.message || "Failed to place order");
    } finally {
      setBuyNowLoading(false);
      setShowBuyNowForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 md:px-10 py-16 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* LEFT: IMAGE SECTION */}
        <div className="space-y-6">
          <div className="bg-[#111] rounded-3xl overflow-hidden h-[400px] md:h-[550px] flex items-center justify-center border border-[#1a1a1a] relative">
             {/* Large Price Badge for visual impact */}
             <div className="absolute top-6 right-6 bg-white text-black px-4 py-1 rounded-full font-black text-lg">
                ₹{displayPrice}
             </div>
            <img
              src={getImageUrl(selectedImage)}
              alt={product.name}
              className="h-full object-contain transition-transform duration-700 hover:scale-110 p-10"
            />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`flex-shrink-0 rounded-xl p-2 transition border-2 ${
                  selectedImage === img ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                } bg-[#111]`}
              >
                <img src={getImageUrl(img)} alt="thumb" className="h-16 md:h-20 object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: DETAILS SECTION */}
        <div className="flex flex-col justify-center">
          <div className="mb-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
                <span className="text-3xl font-light text-neutral-300">₹{displayPrice}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${isProductInStock(product) ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"}`}>
                {isProductInStock(product) ? "In Stock" : "Sold Out"}
                </span>
            </div>
          </div>

          <p className="text-neutral-500 text-sm mb-8 max-w-md">
            Premium quality footwear designed for comfort and style. Part of our exclusive Ernakulam Vytilla collection.
          </p>

          <hr className="border-[#222] mb-8" />

          {/* Color Selection */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-4 font-bold">Available Colors</p>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant, i) => (
                <button
                  key={i}
                  disabled={!isVariantInStock(variant)}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setSelectedImage(variant.images.main);
                    setSelectedSize("");
                    setQuantity(1);
                  }}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    variant.color === selectedVariant.color ? "bg-white text-black scale-105" : "bg-[#111] text-neutral-400 hover:bg-[#1a1a1a]"
                  } ${!isVariantInStock(variant) && "opacity-20 cursor-not-allowed"}`}
                >
                  {variant.color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Select Size (UK)</p>
                <button className="text-[10px] text-neutral-400 underline uppercase tracking-widest">Size Guide</button>
            </div>
            <select
              value={selectedSize}
              onChange={(e) => {
                setSelectedSize(e.target.value);
                setQuantity(1);
              }}
              className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-white transition cursor-pointer appearance-none"
            >
              <option value="">Select your UK size</option>
              {selectedVariant.sizes.map((s, i) => (
                <option key={i} value={s.size} disabled={s.stock === 0}>
                  UK {s.size} — ₹{s.price} {s.stock === 0 ? "(Sold Out)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity with Zero-Back-Home Logic */}
          <div className="mb-10 bg-[#111] p-6 rounded-3xl border border-[#222]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-4 font-bold">Quantity</p>
            <div className="flex items-center gap-8">
              <button
                onClick={() => {
                  if (quantity === 1) {
                    navigate("/"); 
                  } else {
                    setQuantity(q => q - 1);
                  }
                }}
                disabled={!selectedSize}
                className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center hover:bg-white hover:text-black transition-all group disabled:opacity-20"
              >
                <span className={`text-xl font-bold ${quantity === 1 ? "text-red-500 group-hover:text-black" : ""}`}>
                  {quantity === 1 ? "×" : "−"}
                </span>
              </button>

              <span className="text-3xl font-black">{quantity}</span>

              <button
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                disabled={!selectedSize || quantity >= maxQty}
                className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-20"
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
            {selectedSizeObj && (
              <p className={`text-[10px] mt-4 uppercase tracking-[0.2em] font-bold ${remainingStock <= 2 ? "text-red-500 animate-pulse" : "text-neutral-600"}`}>
                {quantity === 1 ? "Decrease to return to shop" : `${remainingStock} items left in stock`}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {cartSuccess && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm font-semibold text-center animate-pulse">
                {cartSuccess}
              </div>
            )}
            {cartError && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm font-semibold text-center">
                {cartError}
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || adding}
              className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border-2 transition-all ${
                selectedSize ? "border-white text-white hover:bg-white hover:text-black disabled:opacity-50" : "border-[#222] text-neutral-800"
              }`}
            >
              {adding ? "Adding..." : "Add to Bag"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!selectedSize || adding}
              className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl ${
                selectedSize ? "bg-white text-black hover:bg-neutral-200 active:scale-95 disabled:opacity-50" : "bg-neutral-900 text-neutral-700"
              }`}
            >
              {adding ? "Processing..." : "Buy it Now"}
            </button>
          </div>

          {/* Buy Now Form Modal */}
          {showBuyNowForm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#111] border border-[#222] rounded-3xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-black mb-6">Complete Your Order</h2>
                
                {/* Shipping Address */}
                <div className="mb-6">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3 block font-bold">
                    Shipping Address
                  </label>
                  <textarea
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition resize-none"
                    rows="4"
                    placeholder="Enter your complete address"
                    value={buyNowForm.address}
                    onChange={(e) => setBuyNowForm({...buyNowForm, address: e.target.value})}
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-8">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3 block font-bold">
                    Payment Method
                  </label>
                  <select
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition"
                    value={buyNowForm.paymentMethod}
                    onChange={(e) => setBuyNowForm({...buyNowForm, paymentMethod: e.target.value})}
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="card">Debit/Credit Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>

                {/* Order Summary */}
                <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-400">Subtotal</span>
                    <span>₹{(displayPrice * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-neutral-400">Shipping</span>
                    <span>FREE</span>
                  </div>
                  <div className="border-t border-[#222] pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{(displayPrice * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBuyNowForm(false)}
                    disabled={buyNowLoading}
                    className="flex-1 py-3 rounded-xl border border-[#222] text-white hover:bg-[#1a1a1a] transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitBuyNow}
                    disabled={buyNowLoading}
                    className="flex-1 py-3 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition disabled:opacity-50"
                  >
                    {buyNowLoading ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;