const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllMapel,
  createMapel,
  getAllKelas,
  createKelas,
  getAllTahunAjaran,
  createTahunAjaran,
  getDashboard,
} = require("../controllers/adminController");

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, authorizeRole("admin"));

// User Management
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

// Mata Pelajaran
router.get("/mapel", getAllMapel);
router.post("/mapel", createMapel);

// Kelas
router.get("/kelas", getAllKelas);
router.post("/kelas", createKelas);

// Tahun Ajaran
router.get("/tahun-ajaran", getAllTahunAjaran);
router.post("/tahun-ajaran", createTahunAjaran);

// Dashboard
router.get("/dashboard", getDashboard);

module.exports = router;
