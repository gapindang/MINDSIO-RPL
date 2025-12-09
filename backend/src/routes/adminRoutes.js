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
  assignGuruMapel,
  unassignGuruMapel,
  getGuruMapelByKelas,
  getAllTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  getDashboard,
  getAllRapor,
  getRaporById,
  assignStudentToKelas,
  unassignStudentFromKelas,
} = require("../controllers/adminController");

const {
  exportRaporCSV,
  exportRaporJSON,
  exportRaporDetail,
  exportRaporPDF,
  exportRaporExcel,
  exportRaporDetailExcel,
  exportRaporByIdCSV,
  exportRaporByIdJSON,
  exportRaporByIdPDF,
  exportRaporByIdExcel,
} = require("../controllers/exportController");

const router = express.Router();

router.use(authenticateToken, authorizeRole("admin"));

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

router.get("/mapel", getAllMapel);
router.post("/mapel", createMapel);
router.put("/mapel/:mapelId", updateMapel);
router.delete("/mapel/:mapelId", deleteMapel);

router.get("/kelas", getAllKelas);
router.post("/kelas", createKelas);
router.put("/kelas/:kelasId", updateKelas);
router.delete("/kelas/:kelasId", deleteKelas);
// Assign/unassign siswa to kelas
router.post("/kelas/assign", assignStudentToKelas);
router.delete("/kelas/assign/:siswaId/:kelasId", unassignStudentFromKelas);

// Assign/unassign guru to mapel/kelas
router.post("/guru-mapel", assignGuruMapel);
router.delete("/guru-mapel/:id", unassignGuruMapel);
router.get("/guru-mapel", getGuruMapelByKelas);

router.get("/tahun-ajaran", getAllTahunAjaran);
router.post("/tahun-ajaran", createTahunAjaran);
router.put("/tahun-ajaran/:tahunId", updateTahunAjaran);
router.delete("/tahun-ajaran/:tahunId", deleteTahunAjaran);

router.get("/rapor", getAllRapor);
router.get("/rapor/:raporId", getRaporById);

// MBTI Admin Controls
const { resetMBTIResult } = require("../controllers/adminController");
router.delete("/mbti/:siswaId", resetMBTIResult);

router.get("/export/rapor/all/csv", exportRaporCSV);
router.get("/export/rapor/all/json", exportRaporJSON);
router.get("/export/rapor/detail/csv", exportRaporDetail);
router.get("/export/rapor/all/pdf", exportRaporPDF);
router.get("/export/rapor/all/excel", exportRaporExcel);
router.get("/export/rapor/detail/excel", exportRaporDetailExcel);

router.get("/export/rapor/:raporId/csv", exportRaporByIdCSV);
router.get("/export/rapor/:raporId/json", exportRaporByIdJSON);
router.get("/export/rapor/:raporId/pdf", exportRaporByIdPDF);
router.get("/export/rapor/:raporId/excel", exportRaporByIdExcel);

router.get("/dashboard", getDashboard);

module.exports = router;
