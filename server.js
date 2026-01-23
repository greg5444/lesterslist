import express from "express";
import dotenv from "dotenv";
import pool from "./backend/db/connect.js";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("✅ LestersList backend is alive."));
app.get("/ping", (req, res) => res.send(`Server running on port ${process.env.PORT || 3000}`));

app.get("/testdb", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    res.json({ status: "connected", time: rows[0].time });
  } catch (err) {
    console.error("❌  Database connection error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
