const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getNilaiRapor,
  getRaporSummary,
  getMBTIResult,
  uploadMBTIResult,
  getKelasInfo,
} = require("../controllers/siswaController");

const router = express.Router();

// All routes require authentication and siswa role
router.use(authenticateToken, authorizeRole("siswa"));

router.get("/nilai", getNilaiRapor);
router.get("/rapor-summary", getRaporSummary);
router.get("/mbti", getMBTIResult);
router.post("/mbti/upload", uploadMBTIResult);
router.get("/kelas-info", getKelasInfo);

module.exports = router;
