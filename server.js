const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve frontend files

// 🧩 MySQL connection credentials
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "subhash@123", // ✅ change to your MySQL password
  database: "studentdb",
});

// ✅ Fetch all students
app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch student by ID
app.get("/api/students/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 🔍 Fetch student by SRN (case-insensitive + trim for spaces)
app.get("/api/students/srn/:srn", async (req, res) => {
  try {
    const inputSRN = req.params.srn.trim(); // Remove leading/trailing spaces
    console.log("🔍 Searching for SRN:", inputSRN); // Debug log

    const [rows] = await pool.query(
      "SELECT * FROM students WHERE TRIM(LOWER(srn)) = LOWER(?)",
      [inputSRN]
    );

    if (rows.length === 0) {
      console.log("❌ No record found for SRN:", inputSRN);
      return res.status(404).json({ error: "SRN not found" });
    }

    console.log("✅ Student found:", rows[0]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new student
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

// ✅ Update student by ID
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

// ✅ Delete student
app.delete("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM students WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Start server
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
