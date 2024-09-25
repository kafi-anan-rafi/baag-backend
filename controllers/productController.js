const ownerModel = require("../models/ownerModel");
const productModel = require("../models/productModel");
const {
  addProductSchema,
  updateProductSchema,
} = require("../validations/productSchema");

// Get All Product
async function GetProducts(req, res) {
  try {
    const userId = req.user._id;
    const products = await productModel.find({ ownerId: userId });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found!" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Get a single Product
async function GetProduct(req, res) {
  try {
    const productId = req.params.productId;
    const product = await productModel.findOne({
      _id: productId,
      ownerId: req.user._id,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Add Product
async function AddProduct(req, res) {
  try {
    const { name, details, price, stock } = req.body;
    const ownerId = req.user._id;
    const { error, value } = addProductSchema.validate(
      { name, details, price, stock, ownerId },
      { abortEarly: false }
    );
    if (error) {
      const allMessages = error.details.map((err) => err.message);
      return res.status(400).json({ message: allMessages });
    }
    const product = await productModel.create(value);
    await ownerModel.findByIdAndUpdate(
      req.user._id,
      {
        $push: { products: product },
      },
      { new: true }
    );
    res.status(200).send(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function UpdateProduct(req, res) {
  try {
    const productId = req.params.productId;
    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      const allMessages = error.details.map((err) => err.message);
      return res.status(400).json({ message: allMessages });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      value,
      { new: true }
    );
    res.status(201).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function DeleteProduct(req, res) {
  try {
    const productId = req.params.productId;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.ownerId.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this product" });
    }
    await productModel.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = {
  GetProducts,
  GetProduct,
  AddProduct,
  UpdateProduct,
  DeleteProduct,
};
