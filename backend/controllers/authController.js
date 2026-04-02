const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require('../config/db')

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Email and password are required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
      select: {
        id: true,
        email: true,
      },
    });

    return res.json(user);
  } catch (error) {
    return res.status(500).json("Signup failed");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json("User not found");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({ token });
  } catch (error) {
    return res.status(500).json("Login failed");
  }
};
