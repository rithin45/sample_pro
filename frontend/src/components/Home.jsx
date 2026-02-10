import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { cart, getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
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

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isProductInStock = (product) => {
    return product.variants.some(variant =>
      variant.sizes.some(size => size.stock > 0)
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 md:px-10 py-8">

      {/* TOP NAV - User Auth */}
      <div className="flex justify-between items-center mb-16 pb-6 border-b border-[#1a1a1a]">
        <h2 className="text-sm font-bold text-neutral-400">SHOESTORE</h2>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs text-neutral-400">Welcome, <span className="text-white font-bold">{user.name}</span></span>
              <button 
                onClick={handleLogout}
                className="text-xs px-4 py-2 border border-neutral-600 rounded hover:border-white transition text-neutral-400 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs px-4 py-2 border border-neutral-600 rounded hover:border-white transition text-neutral-400 hover:text-white">
                Login
              </Link>
              <Link to="/signup" className="text-xs px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 transition font-bold">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Elite <br /> Collections
          </h1>
          <p className="text-neutral-500 mt-4 text-xs uppercase tracking-[0.3em] font-bold">
            Ernakulam • Vytilla • Global Shipping
          </p>
        </div>

        {/* CART BUTTON */}
        <Link to="/cart">
          <button className="relative px-8 py-4 rounded-2xl bg-[#111] border border-[#222] hover:border-white transition-all flex items-center gap-3 group">
            <span className="text-xs uppercase font-black tracking-widest">Bag</span>
            <div className="w-5 h-5 flex items-center justify-center bg-white text-black rounded-full text-[10px] font-black group-hover:scale-110 transition">
              {cart?.reduce((total, item) => total + item.quantity, 0) || 0}
            </div>
          </button>
        </Link>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="min-h-[400px] flex items-center justify-center">
          <p className="text-gray-500 text-lg">Loading products...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-white"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT GRID */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg">No products available yet</p>
            </div>
          ) : (
            products.map(product => {
              const firstVariant = product.variants[0];
              const inStock = isProductInStock(product);
              // Getting the price from the first available size
              const price = firstVariant.sizes[0].price;

              return (
                <div
                  key={product._id}
                  className="group relative flex flex-col bg-[#0d0d0d] rounded-[2rem] border border-[#1a1a1a] overflow-hidden hover:border-neutral-500 transition-all duration-500"
                >
                  {/* IMAGE CONTAINER */}
                  <div className="relative h-[360px] flex items-center justify-center p-10 overflow-hidden bg-[#111]">
                    {/* Price Badge */}
                    <div className="absolute top-5 left-5 z-10 bg-white text-black px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                      ₹{price}
                    </div>

                    <img
                      src={getImageUrl(firstVariant.images.main)}
                      alt={product.name}
                      className="h-full object-contain transition-transform duration-1000 group-hover:scale-110 group-hover:-rotate-6"
                    />
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black uppercase tracking-tight leading-tight max-w-[70%]">
                        {product.name}
                      </h3>
                      <span className="text-xs text-neutral-500 font-bold uppercase">{firstVariant.color}</span>
                    </div>

                    <div className="mt-auto">
                      <p className={`text-[10px] uppercase tracking-widest font-black mb-6 flex items-center gap-2
                        ${inStock ? "text-emerald-500" : "text-red-500"}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-500"}`}></span>
                        {inStock ? "Available Now" : "Out of Stock"}
                      </p>

                      <button
                        onClick={() => {
                          if (!user) {
                            alert("Please login first to view product details!");
                            navigate("/login");
                          } else {
                            navigate(`/product/${product._id}`);
                          }
                        }}
                        disabled={!inStock}
                        className={`w-full py-4 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all
                          ${inStock
                            ? "bg-white text-black hover:bg-neutral-200"
                            : "bg-neutral-800 text-neutral-600 cursor-not-allowed"}
                        `}
                      >
                        {inStock ? "Explore Detail" : "Restocking Soon"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FOOTER DECOR */}
      <div className="mt-24 pt-12 border-t border-[#1a1a1a] text-center">
        <p className="text-neutral-700 text-[10px] font-black uppercase tracking-[0.5em]">
          Premium Footwear Experience © 2026
        </p>
      </div>
    </div>
  );
};

export default Home;