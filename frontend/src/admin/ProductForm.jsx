import { useState, useEffect } from "react";
import api from "../services/api";

const ProductForm = ({ onSuccess, editingProduct }) => {
  const [productName, setProductName] = useState("");
  const [variants, setVariants] = useState([
    {
      color: "",
      colorCode: "#000000",
      images: {
        main: null,
        sub: [null]
      },
      sizes: [
        { size: 6, stock: 0, price: 0 }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing product data when in edit mode
  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name);
      setVariants(editingProduct.variants.map(variant => ({
        color: variant.color,
        colorCode: variant.colorCode,
        images: {
          main: variant.images.main, // This is a URL string in edit mode
          sub: variant.images.sub // These are URL strings in edit mode
        },
        sizes: variant.sizes
      })));
    }
  }, [editingProduct]);

  const handleProductNameChange = (e) => {
    setProductName(e.target.value);
  };

  const handleVariantChange = (variantIdx, field, value) => {
    const newVariants = [...variants];
    newVariants[variantIdx][field] = value;
    setVariants(newVariants);
  };

  const handleMainImageChange = (variantIdx, file) => {
    const newVariants = [...variants];
    newVariants[variantIdx].images.main = file;
    setVariants(newVariants);
  };

  const handleSubImageChange = (variantIdx, imgIdx, file) => {
    const newVariants = [...variants];
    newVariants[variantIdx].images.sub[imgIdx] = file;
    setVariants(newVariants);
  };

  const handleSizeChange = (variantIdx, sizeIdx, field, value) => {
    const newVariants = [...variants];
    newVariants[variantIdx].sizes[sizeIdx][field] = field === "size" ? parseInt(value) : parseInt(value);
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        color: "",
        colorCode: "#000000",
        images: {
          main: null,
          sub: [null]
        },
        sizes: [{ size: 6, stock: 0, price: 0 }]
      }
    ]);
  };

  const removeVariant = (variantIdx) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, idx) => idx !== variantIdx));
    } else {
      alert("At least one variant is required");
    }
  };

  const addSize = (variantIdx) => {
    const newVariants = [...variants];
    newVariants[variantIdx].sizes.push({ size: 6, stock: 0, price: 0 });
    setVariants(newVariants);
  };

  const removeSize = (variantIdx, sizeIdx) => {
    const newVariants = [...variants];
    if (newVariants[variantIdx].sizes.length > 1) {
      newVariants[variantIdx].sizes.splice(sizeIdx, 1);
      setVariants(newVariants);
    } else {
      alert("At least one size is required per variant");
    }
  };

  const addSubImage = (variantIdx) => {
    const newVariants = [...variants];
    newVariants[variantIdx].images.sub.push(null);
    setVariants(newVariants);
  };

  const removeSubImage = (variantIdx, imgIdx) => {
    const newVariants = [...variants];
    newVariants[variantIdx].images.sub.splice(imgIdx, 1);
    setVariants(newVariants);
  };

  const getFilePreview = (file) => {
    if (!file) return null;
    // If it's a File object, create object URL
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    // If it's a string (existing image URL in edit mode), return it as is
    if (typeof file === "string") {
      return file.startsWith("http") ? file : `http://localhost:5000${file}`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!productName.trim()) {
        setError("Product name is required");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", productName.trim());

      const variantData = [];

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];

        if (!variant.color) {
          setError(`Variant ${i + 1}: Color is required`);
          setLoading(false);
          return;
        }

        if (!variant.images.main) {
          setError(`Variant ${i + 1}: Main image is required`);
          setLoading(false);
          return;
        }

        if (variant.sizes.length === 0) {
          setError(`Variant ${i + 1}: At least one size is required`);
          setLoading(false);
          return;
        }

        // Add images - distinguish between File objects (new uploads) and strings (existing URLs in edit mode)
        if (variant.images.main instanceof File) {
          formData.append(`variant${i}-mainImage`, variant.images.main);
        }

        variant.images.sub.forEach((subImg, imgIdx) => {
          if (subImg instanceof File) {
            formData.append(`variant${i}-subImage`, subImg);
          }
        });

        // Build variant data (preserve existing images or empty for new)
        variantData.push({
          color: variant.color,
          colorCode: variant.colorCode,
          images: {
            main: typeof variant.images.main === "string" ? variant.images.main : "",
            sub: variant.images.sub.filter(img => typeof img === "string")
          },
          sizes: variant.sizes
        });
      }

      formData.append("variants", JSON.stringify(variantData));

      console.log("Sending product data...");

      let res;
      if (editingProduct) {
        // Edit mode - use PUT
        res = await api.put(`/products/${editingProduct._id}`, formData);
        console.log("Product updated:", res.data);
        alert("Product updated successfully!");
      } else {
        // Create mode - use POST
        res = await api.post("/products", formData);
        console.log("Product created:", res.data);
        alert("Product added successfully!");
      }

      // Reset form
      setProductName("");
      setVariants([
        {
          color: "",
          colorCode: "#000000",
          images: {
            main: null,
            sub: [null]
          },
          sizes: [{ size: 6, stock: 0, price: 0 }]
        }
      ]);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error details:", error.response?.data);
      setError(error.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111] rounded-lg border border-[#222] p-8 max-w-4xl">
      {error && <div className="bg-red-900 text-red-100 p-3 rounded mb-6">{error}</div>}

      {/* Product Name */}
      <div className="mb-8">
        <label className="block text-sm font-bold mb-2">Product Name *</label>
        <input
          type="text"
          value={productName}
          onChange={handleProductNameChange}
          placeholder="e.g., Nike Air Max"
          className="w-full p-3 bg-black border border-gray-700 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none"
          required
        />
      </div>

      {/* VARIANTS */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black">Variants</h3>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold text-sm"
          >
            + Add Variant
          </button>
        </div>

        <div className="space-y-8">
          {variants.map((variant, variantIdx) => (
            <div key={variantIdx} className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">Variant {variantIdx + 1}</h4>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(variantIdx)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Color and Color Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2">Color *</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(variantIdx, "color", e.target.value)}
                      placeholder="e.g., Black"
                      className="w-full p-2 bg-black border border-gray-700 rounded text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2">Color Code</label>
                    <input
                      type="color"
                      value={variant.colorCode}
                      onChange={(e) => handleVariantChange(variantIdx, "colorCode", e.target.value)}
                      className="w-full p-2 bg-black border border-gray-700 rounded text-sm h-10"
                    />
                  </div>
                </div>

                {/* Main Image */}
                <div>
                  <label className="block text-xs font-bold mb-2">Main Image (File) {!editingProduct || !variant.images.main ? "*" : ""}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainImageChange(variantIdx, e.target.files?.[0])}
                    className="w-full p-2 bg-black border border-gray-700 rounded text-white text-sm"
                    required={!editingProduct || !variant.images.main}
                  />
                  {variant.images.main && (
                    <div className="mt-2">
                      <img
                        src={getFilePreview(variant.images.main)}
                        alt="Main preview"
                        className="h-20 rounded"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {variant.images.main instanceof File ? variant.images.main.name : "Existing image"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Sub Images */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold">Sub Images</label>
                    <button
                      type="button"
                      onClick={() => addSubImage(variantIdx)}
                      className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {variant.images.sub.map((subImg, imgIdx) => (
                      <div key={imgIdx} className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSubImageChange(variantIdx, imgIdx, e.target.files?.[0])}
                          className="flex-1 p-2 bg-black border border-gray-700 rounded text-white text-sm"
                        />
                        {variant.images.sub.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubImage(variantIdx, imgIdx)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SIZES */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold">Sizes *</label>
                    <button
                      type="button"
                      onClick={() => addSize(variantIdx)}
                      className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      + Add Size
                    </button>
                  </div>

                  <div className="space-y-2">
                    {variant.sizes.map((sizeData, sizeIdx) => (
                      <div key={sizeIdx} className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={sizeData.size}
                          onChange={(e) => handleSizeChange(variantIdx, sizeIdx, "size", e.target.value)}
                          placeholder="Size"
                          className="w-20 p-2 bg-black border border-gray-700 rounded text-white text-sm"
                          required
                        />
                        <input
                          type="number"
                          value={sizeData.stock}
                          onChange={(e) => handleSizeChange(variantIdx, sizeIdx, "stock", e.target.value)}
                          placeholder="Stock"
                          className="flex-1 p-2 bg-black border border-gray-700 rounded text-white text-sm"
                          required
                        />
                        <input
                          type="number"
                          value={sizeData.price}
                          onChange={(e) => handleSizeChange(variantIdx, sizeIdx, "price", e.target.value)}
                          placeholder="Price"
                          className="w-24 p-2 bg-black border border-gray-700 rounded text-white text-sm"
                          required
                        />
                        {variant.sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSize(variantIdx, sizeIdx)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black py-3 font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
      >
        {loading ? (editingProduct ? "Updating..." : "Adding...") : (editingProduct ? "Update Product" : "Add Product")}
      </button>
    </form>
  );
};

export default ProductForm;
