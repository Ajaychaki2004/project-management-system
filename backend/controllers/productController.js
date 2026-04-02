const prisma = require("../config/db");

exports.createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json("Name and price are required");
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        userId: req.userId,
      },
    });

    return res.json(product);
  } catch (error) {
    return res.status(500).json("Failed to create product");
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.userId },
      orderBy: { id: "desc" },
    });

    return res.json(products);
  } catch (error) {
    return res.status(500).json("Failed to fetch products");
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json("Invalid product id");
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: req.userId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json("Product not found");
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = Number(price);

    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return res.json(product);
  } catch (error) {
    return res.status(500).json("Failed to update product");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json("Invalid product id");
    }

    const deleted = await prisma.product.deleteMany({
      where: {
        id: productId,
        userId: req.userId,
      },
    });

    if (!deleted.count) {
      return res.status(404).json("Product not found");
    }

    return res.json("Deleted");
  } catch (error) {
    return res.status(500).json("Failed to delete product");
  }
};
