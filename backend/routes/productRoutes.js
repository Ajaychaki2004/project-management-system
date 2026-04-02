const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();


router.post("/create", authMiddleware, createProduct);
router.get("/get", authMiddleware, getProducts);;
router.put("/update/:id", authMiddleware, updateProduct);
router.delete("/delete/:id", authMiddleware, deleteProduct);

module.exports = router;
