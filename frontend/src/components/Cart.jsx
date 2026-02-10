import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, coupon, couponError, dispatchCart, refreshCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [isRemoving, setIsRemoving] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);

  // Debug: log cart items structure
  useEffect(() => {
    if (cart.length > 0) {
      console.log("Cart items:", cart);
      console.log("First item:", cart[0]);
      console.log("First item _id:", cart[0]._id);
      console.log("First item keys:", Object.keys(cart[0]));
    }
  }, [cart]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const apiBase = baseUrl.replace("/api", ""); // Remove /api to get base URL
    return `${apiBase}${imagePath}`;
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate delivery fee
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  
  // Calculate tax (5%)
  const tax = (subtotal * 0.05);
  
  // Calculate discount
  let discount = 0;
  if (coupon) {
    if (coupon.type === "percentage") {
      discount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === "flat") {
      discount = coupon.value;
    }
  }
  
  const total = subtotal + deliveryFee + tax - discount;

  const handleRemove = async (itemId, index) => {
    if (!user) {
      // If not logged in, use local dispatch
      dispatchCart({ type: "REMOVE_FROM_CART", payload: index });
      if (cart.length === 1) {
        navigate("/");
      }
      return;
    }

    setIsRemoving(itemId);
    const success = await removeFromCart(itemId);
    setIsRemoving(null);
    
    if (success && cart.length === 1) {
      navigate("/");
    }
  };

  const handleIncreaseQty = async (itemId, currentQty, maxStock) => {
    if (!user) {
      dispatchCart({ type: "INCREASE_QTY", payload: itemId });
      return;
    }

    setIsUpdating(itemId);
    await updateQuantity(itemId, Math.min(currentQty + 1, maxStock));
    setIsUpdating(null);
  };

  const handleDecreaseQty = async (itemId, index, currentQty) => {
    if (!user) {
      // Local logic
      if (currentQty > 1) {
        dispatchCart({ type: "DECREASE_QTY", payload: index });
      } else {
        dispatchCart({ type: "REMOVE_FROM_CART", payload: index });
        if (cart.length === 1) {
          navigate("/");
        }
      }
      return;
    }

    // Backend logic
    if (currentQty > 1) {
      setIsUpdating(itemId);
      await updateQuantity(itemId, currentQty - 1);
      setIsUpdating(null);
    } else {
      setIsRemoving(itemId);
      const success = await removeFromCart(itemId);
      setIsRemoving(null);
      if (success && cart.length === 1) {
        navigate("/");
      }
    }
  };

  const handleApplyCoupon = (codeToApply) => {
    const code = codeToApply || couponInput;
    if (code.trim()) {
      dispatchCart({ type: "APPLY_COUPON", payload: code });
      setCouponInput("");
    }
  };

  const handleRemoveCoupon = () => {
    dispatchCart({ type: "REMOVE_COUPON" });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white px-10 py-16 flex flex-col items-center justify-center">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">Empty Bag</h1>
        <p className="text-neutral-500 uppercase tracking-widest text-xs font-bold mb-10">Your collection is currently empty</p>
        <button
          onClick={() => navigate("/")}
          className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-200 transition active:scale-95"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 md:px-10 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Your Bag</h1>
          <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.3em]">{cart.length} Items Selected</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="bg-[#111] border border-[#1a1a1a] rounded-[2rem] p-6 flex flex-col sm:flex-row gap-8 hover:border-neutral-700 transition duration-500 group">
                {/* PRODUCT IMAGE */}
                <div className="w-full sm:w-32 h-32 bg-[#0a0a0a] rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#222]">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="h-24 object-contain group-hover:scale-110 transition duration-700"
                  />
                </div>

                {/* PRODUCT DETAILS */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black uppercase tracking-tight">{item.name}</h3>
                    <button
                      onClick={() => handleRemove(item._id || index, index)}
                      disabled={isRemoving === (item._id || index)}
                      className="text-neutral-600 hover:text-red-500 transition uppercase text-[10px] font-black tracking-widest disabled:opacity-50"
                    >
                      {isRemoving === (item._id || index) ? "..." : "Remove"}
                    </button>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mt-1 mb-4">
                    {item.color} • Size UK {item.size}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-xl font-bold italic">₹{item.price}</p>
                    
                    {/* QUANTITY TOGGLE */}
                    <div className="flex items-center gap-4 bg-[#0a0a0a] border border-[#222] p-1 rounded-full">
                      <button
                        onClick={() => handleDecreaseQty(item._id || index, index, item.quantity)}
                        disabled={isUpdating === (item._id || index) || isRemoving === (item._id || index)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#222] transition disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQty(item._id || index, item.quantity, item.maxStock)}
                        disabled={item.quantity >= item.maxStock || isUpdating === (item._id || index)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#222] transition disabled:opacity-20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY CARD */}
          <div className="bg-[#111] border border-[#1a1a1a] rounded-[2rem] p-8 h-fit sticky top-24 shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 mb-8">Summary</h2>

            {/* PRICE BREAKDOWN */}
            <div className="space-y-4 mb-8 border-b border-[#222] pb-8">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-neutral-500">Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-neutral-500">Tax (5%)</span>
                <span>₹{tax.toFixed(0)}</span>
              </div>
              
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-neutral-500">Delivery Fee</span>
                <span className={subtotal > 1000 ? "text-emerald-500" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-emerald-500">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(0)}</span>
                </div>
              )}
            </div>

            {/* COUPON SECTION */}
            <div className="mb-8">
              {coupon ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    {coupon.code} Applied
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-[10px] font-black text-emerald-500 underline">Remove</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="PROMO CODE"
                      className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-white transition placeholder:text-neutral-700"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="bg-white text-black px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition"
                    >
                      Apply
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">Available Offers</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleApplyCoupon("SAVE10")}
                        className="px-3 py-1.5 rounded-lg border border-dashed border-[#333] hover:border-emerald-500 hover:text-emerald-500 transition text-[9px] font-black text-neutral-400"
                      >
                        SAVE10 (10% OFF)
                      </button>
                      <button 
                        onClick={() => handleApplyCoupon("FLAT100")}
                        className="px-3 py-1.5 rounded-lg border border-dashed border-[#333] hover:border-emerald-500 hover:text-emerald-500 transition text-[9px] font-black text-neutral-400"
                      >
                        FLAT100 (₹100 OFF)
                      </button>
                    </div>
                  </div>

                  {couponError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1">{couponError}</p>}
                </div>
              )}
            </div>

            {/* FINAL TOTAL */}
            <div className="flex justify-between items-end mb-10">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Total</span>
              <span className="text-4xl font-black italic">₹{total.toFixed(0)}</span>
            </div>

            <div className="space-y-3">
                <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition active:scale-95 shadow-xl">
                Proceed to Checkout
                </button>

                <button
                onClick={() => navigate("/")}
                className="w-full bg-transparent text-white border border-[#222] py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition active:scale-95">
                Back to Shop
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;