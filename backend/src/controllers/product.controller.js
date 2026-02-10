import Product from "../models/Product.js";
import path from "path";

export const createProduct = async (req, res) => {
  try {
    let { name, variants } = req.body;

    // Log for debugging
    console.log("=== Product Creation Debug ===");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Product name:", name);
    console.log("Request files count:", req.files?.length || 0);
    if (req.files) {
      console.log("Files:", req.files.map(f => ({ fieldname: f.fieldname, filename: f.filename })));
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Product name is required" });
    }

    // Parse variants if it's a string (from FormData)
    let parsedVariants = variants;
    if (typeof variants === "string") {
      try {
        parsedVariants = JSON.parse(variants);
      } catch (e) {
        console.error("Error parsing variants:", e);
        return res.status(400).json({ message: "Invalid variants format" });
      }
    }

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      return res.status(400).json({ message: "At least one variant is required" });
    }

    // Process file uploads
    const files = req.files || [];
    const fileMap = {};

    console.log("\n=== File Processing ===");
    files.forEach((file) => {
      console.log(`File: ${file.fieldname} -> ${file.filename}`);
      const fileKey = file.fieldname.replace(/[\[\]]/g, "");
      if (!fileMap[fileKey]) {
        fileMap[fileKey] = [];
      }
      fileMap[fileKey].push({
        filename: file.filename,
        path: `/assets/shoes/${file.filename}`
      });
    });

    console.log("File map:", fileMap);

    // Map uploaded files to variants
    const processedVariants = parsedVariants.map((variant, variantIdx) => {
      const mainImageKey = `variant${variantIdx}-mainImage`;
      const subImagesKey = `variant${variantIdx}-subImage`;

      const mainImagePath = fileMap[mainImageKey]?.[0]?.path;
      const subImagePaths = fileMap[subImagesKey]?.map(f => f.path) || [];

      console.log(`\nVariant ${variantIdx}:`);
      console.log(`  Main image key: ${mainImageKey} -> ${mainImagePath}`);
      console.log(`  Sub images: ${subImagePaths.length} items`);

      return {
        color: variant.color,
        colorCode: variant.colorCode,
        images: {
          main: mainImagePath || variant.images?.main || "",
          sub: subImagePaths.length > 0 ? subImagePaths : (variant.images?.sub || [])
        },
        sizes: variant.sizes
      };
    });

    console.log("\n=== Final Product Data ===");
    console.log("Name:", name.trim());
    console.log("Variants:", JSON.stringify(processedVariants, null, 2));

    const product = await Product.create({
      name: name.trim(),
      variants: processedVariants
    });

    console.log("Product saved to DB:", product._id);

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "name email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("createdBy", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    let { name, variants } = req.body;

    console.log("=== Product Update Debug ===");
    console.log("Product ID:", req.params.id);
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Product name:", name);
    console.log("Request files count:", req.files?.length || 0);

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Product name is required" });
    }

    // Parse variants if it's a string (from FormData)
    let parsedVariants = variants;
    if (typeof variants === "string") {
      try {
        parsedVariants = JSON.parse(variants);
      } catch (e) {
        console.error("Error parsing variants:", e);
        return res.status(400).json({ message: "Invalid variants format" });
      }
    }

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      return res.status(400).json({ message: "At least one variant is required" });
    }

    // Process file uploads
    const files = req.files || [];
    const fileMap = {};

    console.log("\n=== File Processing ===");
    files.forEach((file) => {
      console.log(`File: ${file.fieldname} -> ${file.filename}`);
      const fileKey = file.fieldname.replace(/[\[\]]/g, "");
      if (!fileMap[fileKey]) {
        fileMap[fileKey] = [];
      }
      fileMap[fileKey].push({
        filename: file.filename,
        path: `/assets/shoes/${file.filename}`
      });
    });

    // Map uploaded files to variants - preserve existing images if no new files provided
    const processedVariants = parsedVariants.map((variant, variantIdx) => {
      const mainImageKey = `variant${variantIdx}-mainImage`;
      const subImagesKey = `variant${variantIdx}-subImage`;

      const mainImagePath = fileMap[mainImageKey]?.[0]?.path;
      const subImagePaths = fileMap[subImagesKey]?.map(f => f.path) || [];

      return {
        color: variant.color,
        colorCode: variant.colorCode,
        images: {
          main: mainImagePath || variant.images?.main || "",
          sub: subImagePaths.length > 0 ? subImagePaths : (variant.images?.sub || [])
        },
        sizes: variant.sizes
      };
    });

    console.log("\n=== Final Product Data ===");
    console.log("Name:", name.trim());
    console.log("Variants:", JSON.stringify(processedVariants, null, 2));

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), variants: processedVariants },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    console.log("Product updated in DB:", product._id);

    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
