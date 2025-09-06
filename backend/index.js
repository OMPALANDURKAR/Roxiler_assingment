console.log(">>> index.js started <<<");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); 

// ✅ MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Middleware to check JWT token
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
}

// ✅ Form Validations
function validateUserInput(name, email, password, address) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;

  if (name.length < 20 || name.length > 60) return "Name must be 20-60 characters";
  if (address.length > 400) return "Address must be under 400 characters";
  if (!emailRegex.test(email)) return "Invalid email format";
  if (!passRegex.test(password)) return "Password must be 8–16 chars, 1 uppercase, 1 special char";

  return null;
}

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Express is working! 🚀");
});

// ✅ Signup API (Normal User)
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    const validationError = validateUserInput(name, email, password, address);
    if (validationError) return res.status(400).json({ message: validationError });

    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, address, "user"]
    );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "36h",
    });

    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin: Add Store
app.post("/api/stores", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied, Admin only" });

    const { name, email, address, owner_id } = req.body;
    if (!name || !address) return res.status(400).json({ message: "Store name & address required" });

    await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name, email, address, owner_id || null]
    );

    res.status(201).json({ message: "Store added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin Dashboard
app.get("/api/admin/dashboard", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied, Admin only" });

    const [[users]] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
    const [[stores]] = await pool.query("SELECT COUNT(*) AS total_stores FROM stores");
    const [[ratings]] = await pool.query("SELECT COUNT(*) AS total_ratings FROM ratings");

    res.json({ total_users: users.total_users, total_stores: stores.total_stores, total_ratings: ratings.total_ratings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ User: Update Password
app.put("/api/user/password", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passRegex.test(password))
      return res.status(400).json({ message: "Password must meet security requirements" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password=? WHERE id=?", [hashedPassword, req.user.id]);

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ User: View/Search Stores
app.get("/api/stores", async (req, res) => {
  try {
    const { name, address } = req.query;
    let query = `
      SELECT s.id, s.name, s.address, s.email,
             IFNULL(ROUND(AVG(r.rating),1), 0) AS avg_rating,
             COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;
    let params = [];

    if (name || address) {
      query += " WHERE ";
      if (name) {
        query += "s.name LIKE ? ";
        params.push("%" + name + "%");
      }
      if (address) {
        if (params.length) query += "AND ";
        query += "s.address LIKE ? ";
        params.push("%" + address + "%");
      }
    }
    query += " GROUP BY s.id";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ User: Submit/Update Rating
app.post("/api/stores/:id/rate", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Only normal users can rate stores" });

    const { id } = req.params;
    const { rating } = req.body;

    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1–5" });

    const [existing] = await pool.query(
      "SELECT * FROM ratings WHERE user_id = ? AND store_id = ?",
      [req.user.id, id]
    );

    if (existing.length > 0) {
      await pool.query("UPDATE ratings SET rating = ? WHERE id = ?", [rating, existing[0].id]);
      return res.json({ message: "Rating updated successfully!" });
    }

    await pool.query("INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)", [
      req.user.id,
      id,
      rating,
    ]);

    res.status(201).json({ message: "Rating submitted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Store Owner: Dashboard
app.get("/api/store/dashboard", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "store_owner")
      return res.status(403).json({ message: "Only store owners can access this" });

    const [rows] = await pool.query(
      `SELECT u.name, r.rating 
       FROM ratings r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.store_id = (SELECT id FROM stores WHERE owner_id = ?)`,
      [req.user.id]
    );

    const [[avg]] = await pool.query(
      "SELECT ROUND(AVG(rating),1) as avg_rating FROM ratings WHERE store_id = (SELECT id FROM stores WHERE owner_id = ?)",
      [req.user.id]
    );

    res.json({ ratings: rows, average: avg.avg_rating || 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
