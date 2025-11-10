const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const guruRoutes = require("./src/routes/guruRoutes");
const siswaRoutes = require("./src/routes/siswaRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/guru", guruRoutes);
app.use("/api/siswa", siswaRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend Mindsio running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Mindsio berjalan di port ${PORT}`);
});
