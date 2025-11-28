const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getNilaiRapor,
  getRaporSummary,
  getMBTIResult,
  saveMBTIResult,
  getKelasInfo,
  downloadRaporPDF,
} = require("../controllers/siswaController");

const router = express.Router();

// All routes require authentication and siswa role
router.use(authenticateToken, authorizeRole("siswa"));

router.get("/nilai", getNilaiRapor);
router.get("/rapor-summary", getRaporSummary);
router.get("/mbti", getMBTIResult);
router.post("/mbti", saveMBTIResult);
router.get("/kelas-info", getKelasInfo);
router.get("/rapor/pdf", downloadRaporPDF);

module.exports = router;
