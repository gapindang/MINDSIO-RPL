const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getKelasTeaching,
  getSiswaInKelas,
  inputNilai,
  getDashboardKelas,
  createRapor,
} = require("../controllers/guruController");

const router = express.Router();

// All routes require authentication and guru role
router.use(authenticateToken, authorizeRole("guru"));

router.get("/kelas", getKelasTeaching);
router.get("/kelas/:kelasId/siswa", getSiswaInKelas);
router.post("/nilai", inputNilai);
router.get("/kelas/:kelasId/dashboard", getDashboardKelas);
router.post("/rapor", createRapor);

module.exports = router;
