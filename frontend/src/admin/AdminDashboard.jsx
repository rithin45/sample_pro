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
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 md:px-10 py-8">
      
      {/* TOP NAVIGATION */}
      <div className="flex justify-between items-center mb-16 pb-6 border-b border-[#1a1a1a]">
        <h2 className="text-sm font-bold text-neutral-400">ADMIN PANEL</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral-400">
            Welcome, <span className="text-white font-bold">{user?.name}</span>
          </span>
          <button 
            onClick={handleLogout}
            className="text-xs px-4 py-2 border border-neutral-600 rounded hover:border-white transition text-neutral-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-4 mb-12 border-b border-[#1a1a1a] pb-4">
        <button
          onClick={() => handleTabClick("dashboard")}
          className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "dashboard"
              ? "text-white border-b-2 border-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => handleTabClick("inventory")}
          className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "inventory"
              ? "text-white border-b-2 border-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => handleTabClick("orders")}
          className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition ${
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
        <div className="space-y-8 animate-in">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Dashboard</h1>
            <p className="text-neutral-500 text-sm">System overview and analytics</p>
          </div>

          {/* STATS GRID */}
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-neutral-500">Loading analytics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Revenue", value: `₹${analytics?.totalRevenue?.toLocaleString() || 0}`, icon: "💰" },
                { label: "Total Orders", value: analytics?.totalOrders || 0, icon: "📦" },
                { label: "Total Products", value: analytics?.totalProducts || 0, icon: "👟" },
                { label: "Return Rate", value: `${analytics?.returnRate || 0}%`, icon: "📉" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 hover:border-neutral-500 transition">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                  <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* CHART */}
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-8">
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Revenue Trend</h3>
            {recentOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <div className="h-80 flex items-center justify-center text-neutral-600">
                No data available
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === "inventory" && (
        <div>
          {!showForm ? (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Inventory</h1>
                  <p className="text-neutral-500 text-sm">Manage your products</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-neutral-200 transition active:scale-95"
                >
                  Add Product
                </button>
              </div>
              <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                <ProductList onEdit={handleEdit} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={handleFormClose}
                className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-bold transition"
              >
                ← Back to Inventory
              </button>
              <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-10">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-8">
                  {editingProduct ? "Edit Product" : "Add New Product"}
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
        <div className="space-y-8 animate-in">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Orders</h1>
            <p className="text-neutral-500 text-sm">Real-time order management</p>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-neutral-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-16 flex flex-col items-center justify-center">
              <p className="text-3xl mb-4">📭</p>
              <p className="text-neutral-400 text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#0d0d0d] border-b border-[#1a1a1a]">
                    <tr className="text-neutral-500 text-xs uppercase tracking-widest font-bold">
                      <th className="px-6 py-4 text-left">Order ID</th>
                      <th className="px-6 py-4 text-left">Customer</th>
                      <th className="px-6 py-4 text-left">Items</th>
                      <th className="px-6 py-4 text-left">Total</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-[#0d0d0d] transition">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-neutral-400">#{order._id?.slice(-6)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-white">{order.userId?.name || "Guest"}</p>
                            <p className="text-xs text-neutral-500">{order.userId?.email || "N/A"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-neutral-300">
                            {order.items?.slice(0, 1).map((item, idx) => (
                              <div key={idx}>
                                {item.name} ({item.size}) x{item.quantity}
                              </div>
                            ))}
                            {order.items?.length > 1 && (
                              <div className="text-neutral-500">+{order.items.length - 1} more</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold">₹{order.totalAmount?.toLocaleString() || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                            order.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" :
                            order.status === "shipped" ? "bg-blue-500/20 text-blue-400" :
                            order.status === "delivered" ? "bg-green-500/20 text-green-400" :
                            order.status === "returned" ? "bg-red-500/20 text-red-400" :
                            "bg-neutral-500/20 text-neutral-400"
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-neutral-500">
                            {new Date(order.createdAt).toLocaleDateString()}
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
      <div className="mt-20 pt-8 border-t border-[#1a1a1a] text-center">
        <p className="text-neutral-600 text-xs uppercase tracking-widest">
          © 2026 Admin Management System
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
