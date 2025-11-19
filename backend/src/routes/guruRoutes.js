const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getKelasTeaching,
  getSiswaInKelas,
  inputNilai,
  getDashboardKelas,
  createRapor,
  getMapelForClass,
  getRaporIdBySiswa,
  getMBTISiswaInKelas,
} = require("../controllers/guruController");

const router = express.Router();

// All routes require authentication and guru role
router.use(authenticateToken, authorizeRole("guru"));

router.get("/kelas", getKelasTeaching);
router.get("/kelas/:kelasId/siswa", getSiswaInKelas);
router.post("/nilai", inputNilai);
router.get("/kelas/:kelasId/dashboard", getDashboardKelas);
router.post("/rapor", createRapor);
router.get("/kelas/:kelasId/mapel", getMapelForClass);
router.get("/rapor/by-siswa", getRaporIdBySiswa);
router.get("/kelas/:kelasId/mbti", getMBTISiswaInKelas);

// Export per-rapor for guru (wali kelas)
const {
  exportRaporByIdCSV,
  exportRaporByIdJSON,
  exportRaporByIdPDF,
  exportRaporByIdExcel,
} = require("../controllers/exportController");

router.get("/rapor/:raporId/csv", exportRaporByIdCSV);
router.get("/rapor/:raporId/json", exportRaporByIdJSON);
router.get("/rapor/:raporId/pdf", exportRaporByIdPDF);
router.get("/rapor/:raporId/excel", exportRaporByIdExcel);

module.exports = router;
