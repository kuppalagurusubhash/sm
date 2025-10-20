const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve frontend files

// ✅ Use environment variables for MySQL (Render safe)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "subhash@123",
  database: process.env.DB_NAME || "studentdb",
});

// ✅ All routes (same as before)
app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/students/srn/:srn", async (req, res) => {
  try {
    const inputSRN = req.params.srn.trim();
    const [rows] = await pool.query(
      "SELECT * FROM students WHERE TRIM(LOWER(srn)) = LOWER(?)",
      [inputSRN]
    );
    if (rows.length === 0) return res.status(404).json({ error: "SRN not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/students", async (req, res) => {
  const { srn, name, age, dept, email } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO students (srn, name, age, dept, email) VALUES (?, ?, ?, ?, ?)",
      [srn, name, age, dept, email]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/students/:id", async (req, res) => {
  const { srn, name, age, dept, email } = req.body;
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE students SET srn=?, name=?, age=?, dept=?, email=? WHERE id=?",
      [srn, name, age, dept, email, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM students WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Important: Use process.env.PORT (Render gives this)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
