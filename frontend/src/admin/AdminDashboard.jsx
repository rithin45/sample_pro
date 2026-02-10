import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await api.get("/orders/admin/analytics");
      setAnalytics(res.data);

      if (res.data.recentOrders) {
        const chartData = res.data.recentOrders.slice(0, 7).map(order => ({
          name: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: order.totalAmount,
        }));
        setRecentOrders(chartData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics({
        totalRevenue: 0,
        totalOrders: 0,
        returnRate: 0,
        totalProducts: 0,
        totalStock: 0,
        recentOrders: []
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get("/orders/admin/all");
      setOrders(res.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchAnalytics();
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowForm(false);
    if (tabId === "orders") {
      fetchOrders();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8">
      
      {/* TOP NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-10 md:mb-16 pb-3 sm:pb-4 md:pb-6 border-b border-[#1a1a1a]">
        <h2 className="text-xs font-bold text-neutral-400">ADMIN</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <span className="text-xs text-neutral-400 break-words">
            <span className="text-white font-bold">{user?.name}</span>
          </span>
          <button 
            onClick={handleLogout}
            className="text-xs px-3 sm:px-4 py-2 h-10 sm:h-auto border border-neutral-600 rounded hover:border-white transition text-neutral-400 hover:text-white whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-1 sm:gap-3 md:gap-4 mb-6 sm:mb-10 md:mb-12 border-b border-[#1a1a1a] pb-3 overflow-x-auto">
        <button
          onClick={() => handleTabClick("dashboard")}
          className={`px-2 sm:px-4 md:px-6 py-2 text-xs font-bold uppercase transition whitespace-nowrap ${
            activeTab === "dashboard"
              ? "text-white border-b-2 border-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => handleTabClick("inventory")}
          className={`px-2 sm:px-4 md:px-6 py-2 text-xs font-bold uppercase transition whitespace-nowrap ${
            activeTab === "inventory"
              ? "text-white border-b-2 border-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => handleTabClick("orders")}
          className={`px-2 sm:px-4 md:px-6 py-2 text-xs font-bold uppercase transition whitespace-nowrap ${
            activeTab === "orders"
              ? "text-white border-b-2 border-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Orders
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight mb-1">Dashboard</h1>
            <p className="text-neutral-500 text-xs">Overview & analytics</p>
          </div>

          {/* STATS GRID */}
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <p className="text-neutral-500 text-xs">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {[
                { label: "Revenue", value: `₹${analytics?.totalRevenue?.toLocaleString() || 0}`, icon: "💰" },
                { label: "Orders", value: analytics?.totalOrders || 0, icon: "📦" },
                { label: "Products", value: analytics?.totalProducts || 0, icon: "👟" },
                { label: "Returns", value: `${analytics?.returnRate || 0}%`, icon: "📉" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#111] border border-[#1a1a1a] rounded-lg sm:rounded-xl p-2 sm:p-4 md:p-6 hover:border-neutral-500 transition">
                  <div className="mb-2">
                    <span className="text-xl sm:text-2xl">{stat.icon}</span>
                  </div>
                  <p className="text-neutral-500 text-xs font-bold mb-1">{stat.label}</p>
                  <p className="text-sm sm:text-lg md:text-2xl font-black text-white truncate">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* CHART */}
          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-8">
            <h3 className="text-sm sm:text-base font-black uppercase mb-3 sm:mb-4">Revenue</h3>
            {recentOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={recentOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Bar dataKey="amount" fill="#ffffff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-neutral-600 text-xs">
                No data
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === "inventory" && (
        <div>
          {!showForm ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col gap-3">
                <div>
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black uppercase mb-1">Inventory</h1>
                  <p className="text-neutral-500 text-xs">Manage products</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="px-3 sm:px-6 py-3 h-10 sm:h-12 bg-white text-black rounded-lg font-bold hover:bg-neutral-200 transition text-sm"
                >
                  + Add
                </button>
              </div>
              <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
                <ProductList onEdit={handleEdit} />
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={handleFormClose}
                className="flex items-center gap-2 text-neutral-400 hover:text-white text-xs font-bold transition"
              >
                ← Back
              </button>
              <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3 sm:p-6 md:p-8">
                <h2 className="text-base sm:text-xl font-black uppercase mb-4 sm:mb-6">
                  {editingProduct ? "Edit" : "New Product"}
                </h2>
                <ProductForm 
                  editingProduct={editingProduct}
                  onSuccess={handleFormClose} 
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-4 sm:space-y-6 animate-in">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black uppercase mb-1">Orders</h1>
            <p className="text-neutral-500 text-xs">Order management</p>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-neutral-500 text-xs">Loading...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-8 flex flex-col items-center justify-center">
              <p className="text-xl mb-2">📭</p>
              <p className="text-neutral-400 text-xs">No orders</p>
            </div>
          ) : (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#0d0d0d] border-b border-[#1a1a1a]">
                    <tr className="text-neutral-500 text-xs font-bold">
                      <th className="px-2 py-2 text-left">ID</th>
                      <th className="px-2 py-2 text-left hidden sm:table-cell">Name</th>
                      <th className="px-2 py-2 text-left">Total</th>
                      <th className="px-2 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-[#0d0d0d] transition">
                        <td className="px-2 py-2">
                          <span className="font-mono text-xs text-neutral-400">#{order._id?.slice(-4)}</span>
                        </td>
                        <td className="px-2 py-2 hidden sm:table-cell">
                          <p className="font-bold text-white text-xs truncate">{order.userId?.name || "Guest"}</p>
                        </td>
                        <td className="px-2 py-2">
                          <span className="font-bold text-xs">₹{(order.totalAmount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded inline-block ${
                            order.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" :
                            order.status === "shipped" ? "bg-blue-500/20 text-blue-400" :
                            order.status === "delivered" ? "bg-green-500/20 text-green-400" :
                            order.status === "returned" ? "bg-red-500/20 text-red-400" :
                            "bg-neutral-500/20 text-neutral-400"
                          }`}>
                            {order.status?.slice(0, 3).toUpperCase() || "..."}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      {/* FOOTER */}
      <div className="mt-8 sm:mt-12 pt-4 border-t border-[#1a1a1a] text-center">
        <p className="text-neutral-600 text-xs">© 2026</p>
      </div>
    </div>
  );
};

export default AdminDashboard;