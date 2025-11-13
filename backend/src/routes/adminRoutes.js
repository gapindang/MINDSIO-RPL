const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllMapel,
  createMapel,
  updateMapel,
  deleteMapel,
  getAllKelas,
  createKelas,
  updateKelas,
  deleteKelas,
  getAllTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  getDashboard,
  getAllRapor,
  getRaporById,
} = require("../controllers/adminController");

const {
  exportRaporCSV,
  exportRaporJSON,
  exportRaporDetail,
  exportRaporPDF,
  exportRaporExcel,
  exportRaporDetailExcel,
} = require("../controllers/exportController");

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
router.put("/mapel/:mapelId", updateMapel);
router.delete("/mapel/:mapelId", deleteMapel);

// Kelas
router.get("/kelas", getAllKelas);
router.post("/kelas", createKelas);
router.put("/kelas/:kelasId", updateKelas);
router.delete("/kelas/:kelasId", deleteKelas);

// Tahun Ajaran
router.get("/tahun-ajaran", getAllTahunAjaran);
router.post("/tahun-ajaran", createTahunAjaran);
router.put("/tahun-ajaran/:tahunId", updateTahunAjaran);
router.delete("/tahun-ajaran/:tahunId", deleteTahunAjaran);

// Rapor Management
router.get("/rapor", getAllRapor);
router.get("/rapor/:raporId", getRaporById);

// Export Routes
router.get("/export/rapor/all/csv", exportRaporCSV);
router.get("/export/rapor/all/json", exportRaporJSON);
router.get("/export/rapor/detail/csv", exportRaporDetail);
router.get("/export/rapor/all/pdf", exportRaporPDF);
router.get("/export/rapor/all/excel", exportRaporExcel);
router.get("/export/rapor/detail/excel", exportRaporDetailExcel);

// Dashboard
router.get("/dashboard", getDashboard);

module.exports = router;
