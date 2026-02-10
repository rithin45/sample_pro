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
    return <div className="text-gray-400">Loading products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="bg-[#111] rounded-lg border border-[#222] p-8 text-center">
        <p className="text-gray-500">No products added yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#222]">
            <th className="text-left p-4 font-bold">Name</th>
            <th className="text-left p-4 font-bold">Price</th>
            <th className="text-left p-4 font-bold">Stock</th>
            <th className="text-left p-4 font-bold">Actions</th>
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
                <td className="p-4">{product.name}</td>
                <td className="p-4">₹{minPrice}—₹{maxPrice}</td>
                <td className="p-4">
                  <span className={totalStock > 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                    {totalStock} units
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button 
                    onClick={() => onEdit(product)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-bold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
