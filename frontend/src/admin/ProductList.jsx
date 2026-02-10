import { useState, useEffect } from "react";
import api from "../services/api";

const ProductList = ({ onEdit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${productId}`);
        alert("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-xs px-3">Loading...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="bg-[#111] rounded-lg border border-[#222] p-6 text-center">
        <p className="text-gray-500 text-xs">No products</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#222]">
              <th className="text-left p-2 sm:p-3 font-bold">Name</th>
              <th className="text-left p-2 sm:p-3 font-bold">Price</th>
              <th className="text-left p-2 sm:p-3 font-bold">Stock</th>
              <th className="text-left p-2 sm:p-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, variant) => {
                return sum + variant.sizes.reduce((variantSum, size) => variantSum + size.stock, 0);
              }, 0);
              const minPrice = Math.min(...product.variants.flatMap(v => v.sizes.map(s => s.price)));
              const maxPrice = Math.max(...product.variants.flatMap(v => v.sizes.map(s => s.price)));
              
              return (
                <tr key={product._id} className="border-b border-[#222] hover:bg-[#111] transition">
                  <td className="p-2 sm:p-3 truncate">{product.name}</td>
                  <td className="p-2 sm:p-3">₹{minPrice}—₹{maxPrice}</td>
                  <td className="p-2 sm:p-3">
                    <span className={totalStock > 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 space-x-1">
                    <button 
                      onClick={() => onEdit(product)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs h-7"
                    >
                      E
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs h-7"
                    >
                      D
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="sm:hidden space-y-2 p-2">
        {products.map((product) => {
          const totalStock = product.variants.reduce((sum, variant) => {
            return sum + variant.sizes.reduce((variantSum, size) => variantSum + size.stock, 0);
          }, 0);
          const minPrice = Math.min(...product.variants.flatMap(v => v.sizes.map(s => s.price)));
          const maxPrice = Math.max(...product.variants.flatMap(v => v.sizes.map(s => s.price)));
          
          return (
            <div key={product._id} className="bg-[#111] border border-[#222] rounded-lg p-3">
              <h3 className="font-bold text-xs mb-2 truncate">{product.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="text-neutral-500">
                  <p>Price</p>
                  <p className="font-bold text-white">₹{minPrice}</p>
                </div>
                <div className="text-neutral-500">
                  <p>Stock</p>
                  <p className={totalStock > 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                    {totalStock}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 pt-2 border-t border-[#222]">
                <button 
                  onClick={() => onEdit(product)}
                  className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs h-8"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs h-8"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
