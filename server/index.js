console.log("SERVER FILE LOADED: index.js ✅");

import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Neon/Render will provide DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/api/db-check", async (req, res) => {
    try {
      const r = await pool.query("SELECT NOW() as now;");
      res.json({ ok: true, now: r.rows[0].now });
    } catch (err) {
      console.error("DB CHECK failed:", err);
      res.status(500).json({
        ok: false,
        error: err.message,
        code: err.code,
        detail: err.detail,
      });
    }
  });



app.get("/", (req, res) => res.send("Feedback API running"));

/**
 * Endpoints (meets "at least two API endpoints")
 */

// 1) GET all feedback
app.get("/api/feedback", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM feedback ORDER BY created_at DESC;"
      );
      res.json(result.rows);
    } catch (err) {
      console.error("GET /api/feedback failed:", err);
      res.status(500).json({
        error: err.message,
        code: err.code,
        
      });
    }
  });

  app.put("/api/feedback/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
  
      const result = await pool.query(
        "UPDATE feedback SET rating=$1, comment=$2 WHERE id=$3 RETURNING *;",
        [rating, comment, id]
      );
  
      if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("PUT /api/feedback failed:", err);
      res.status(500).json({ error: err.message, code: err.code });
    }
  });
  
  

// 2) POST new feedback
// 2) POST new feedback
app.post("/api/feedback", async (req, res) => {
    try {
      const { rating, comment } = req.body;
  
      // ✅ VALIDATION (ADD THIS PART)
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          error: "Rating must be an integer between 1 and 5",
        });
      }
  
      if (!comment || !comment.trim()) {
        return res.status(400).json({
          error: "Comment is required",
        });
      }
      // ✅ END VALIDATION
  
      const result = await pool.query(
        "INSERT INTO feedback (rating, comment) VALUES ($1, $2) RETURNING *;",
        [rating, comment]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("POST /api/feedback failed:", err);
      res.status(500).json({
        error: err.message,
        code: err.code,
        detail: err.detail,
      });
    }
  });
  

// 3) DELETE feedback by id (simple admin action)
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM feedback WHERE id = $1;", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/feedback/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
  
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be an integer 1-5" });
      }
      if (!comment || !comment.trim()) {
        return res.status(400).json({ error: "Comment is required" });
      }
  
      const result = await pool.query(
        "UPDATE feedback SET rating=$1, comment=$2 WHERE id=$3 RETURNING *;",
        [rating, comment, id]
      );
  
      if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("PUT /api/feedback failed:", err);
      res.status(500).json({ error: err.message, code: err.code });
    }
  });
  

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));


  
