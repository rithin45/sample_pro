import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { cartService } from "../services/cartService";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, coupon, dispatch } = useCart();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLocating, setIsLocating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // --- NEW: Geolocation Logic ---
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap's Nominatim (Free Reverse Geocoding)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.display_name) {
            setForm(prev => ({ ...prev, address: data.display_name.toUpperCase() }));
          }
        } catch (error) {
          alert("Error fetching address. Please enter manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve your location. Please check your permissions.");
      }
    );
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  let discount = 0;
  if (coupon) {
    discount = coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
  }
  const total = subtotal + tax + deliveryFee - discount;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      alert("Please fill all shipping fields");
      return;
    }

    setIsProcessing(true);
    setShowSuccessModal(true);

    try {
      // Prepare order data
      const orderData = {
        items: cart,
        shippingAddress: form.address,
        paymentMethod: paymentMethod.toUpperCase(),
        totalAmount: total
      };

      console.log("🛒 Sending checkout request:", orderData);

      // Call checkout API
      const response = await cartService.checkout(orderData);
      console.log("✅ Order placed successfully:", response);

      // Save invoice data
      const invoiceData = {
        order: cart,
        customer: form,
        paymentMethod: paymentMethod.toUpperCase(),
        totals: { subtotal, tax, delivery: deliveryFee, discount, total },
        timestamp: new Date().toISOString(),
        orderId: response.order._id
      };

      localStorage.setItem("lastInvoice", JSON.stringify(invoiceData));

      setTimeout(() => {
        navigate("/invoice", { state: { ...invoiceData, autoDownload: true } });
        dispatch({ type: "CLEAR_CART" });
      }, 2500);
    } catch (error) {
      console.error("❌ Checkout error:", error);
      alert("Order failed: " + (error.response?.data?.message || error.message));
      setShowSuccessModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !showSuccessModal) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 md:px-10 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-[#1a1a1a] pb-8">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Checkout</h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Secure Transaction</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Shipping Section */}
            <div className="bg-[#111] rounded-[2rem] p-8 border border-[#1a1a1a]">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-4">
                  <span className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px]">01</span>
                  Shipping Details
                </h2>
                
                {/* NEW: Location Button */}
                <button 
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="text-[9px] font-black uppercase tracking-widest bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg hover:bg-white hover:text-black transition flex items-center gap-2"
                >
                  {isLocating ? "Locating..." : "📍 Use Current Location"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="JOHN DOE" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-5 py-4 text-xs font-bold outline-none focus:border-white transition placeholder:text-neutral-800 uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Email Address</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="EMAIL@EXAMPLE.COM" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-5 py-4 text-xs font-bold outline-none focus:border-white transition placeholder:text-neutral-800 uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 0000 0000" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-5 py-4 text-xs font-bold outline-none focus:border-white transition placeholder:text-neutral-800" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Complete Address</label>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase">Manual Edit allowed</span>
                  </div>
                  <textarea name="address" value={form.address} onChange={handleChange} rows={3} placeholder="STREET, CITY, STATE, ZIP" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-5 py-4 text-xs font-bold outline-none focus:border-white transition placeholder:text-neutral-800 uppercase" />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Section */}
            <div className="bg-[#111] rounded-[2rem] p-8 border border-[#1a1a1a]">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8 flex items-center gap-4">
                <span className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px]">02</span>
                Payment Method
              </h2>
              
              <div className="space-y-4">
                {[
                    { id: 'card', label: 'Credit / Debit Card', icons: ['VISA', 'MC'] },
                    { id: 'upi', label: 'UPI Payment', sub: 'GPay, PhonePe, Paytm' },
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay on arrival' }
                ].map((method) => (
                    <div 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMethod === method.id ? 'border-white bg-[#0a0a0a]' : 'border-[#222] hover:border-neutral-700'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === method.id ? 'border-white' : 'border-neutral-700'}`}>
                                    {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest">{method.label}</p>
                                    {method.sub && <p className="text-[9px] text-neutral-600 font-bold uppercase mt-1">{method.sub}</p>}
                                </div>
                            </div>
                            {method.icons && (
                                <div className="flex gap-2">
                                    {method.icons.map(icon => <span key={icon} className="text-[8px] font-black border border-[#333] px-2 py-0.5 rounded text-neutral-500">{icon}</span>)}
                                </div>
                            )}
                        </div>

                        {paymentMethod === 'card' && method.id === 'card' && (
                            <div className="mt-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <input placeholder="CARD NUMBER" className="col-span-2 bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-[10px] font-black outline-none focus:border-white transition" />
                                <input placeholder="MM/YY" className="bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-[10px] font-black outline-none focus:border-white transition" />
                                <input placeholder="CVV" className="bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-[10px] font-black outline-none focus:border-white transition" />
                            </div>
                        )}
                        {paymentMethod === 'upi' && method.id === 'upi' && (
                            <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                                <input placeholder="ENTER UPI ID (e.g. user@okaxis)" className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-[10px] font-black outline-none focus:border-white transition uppercase" />
                            </div>
                        )}
                    </div>
                ))}
              </div>
            </div>
            
            <button onClick={() => navigate('/cart')} className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition flex items-center gap-2 pl-4">
              ← Return to Bag
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-[#1a1a1a] rounded-[2rem] p-8 sticky top-24 shadow-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-8 border-b border-[#222] pb-4">Order Summary</h2>
              
              <div className="space-y-4 text-[10px] font-black uppercase tracking-widest mb-8 border-b border-[#222] pb-8">
                <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span className="text-white">₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between text-neutral-500"><span>Tax (5%)</span><span className="text-white">₹{tax.toFixed(0)}</span></div>
                <div className="flex justify-between text-neutral-500"><span>Delivery</span><span className={deliveryFee === 0 ? "text-emerald-500" : "text-white"}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-500"><span>Discount</span><span>-₹{discount.toFixed(0)}</span></div>}
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Total</span>
                <span className="text-4xl font-black italic tracking-tighter">₹{total.toFixed(0)}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </button>
              
              <p className="text-[8px] text-center text-neutral-600 font-black uppercase tracking-widest mt-6">
                By placing an order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-2xl">
          <div className="text-center p-10 border border-[#1a1a1a] bg-[#0d0d0d] rounded-[3rem] max-w-sm w-full mx-4">
            <div className="text-5xl mb-8 animate-bounce">
                {paymentMethod === 'card' ? '💳' : paymentMethod === 'upi' ? '📱' : '🚚'}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">
                {paymentMethod === 'cod' ? 'Confirming Order' : 'Verifying Payment'}
            </h2>
            <div className="w-full bg-[#1a1a1a] h-1 rounded-full overflow-hidden mb-6">
                <div className="bg-white h-full animate-[progress_2.5s_ease-in-out]" style={{ width: '100%' }}></div>
            </div>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Securely processing via {paymentMethod.toUpperCase()}... Please do not refresh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;