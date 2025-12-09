import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTHENTICATION API
// ============================================================

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),

  login: (credentials) => api.post("/auth/login", credentials),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (profileData) => api.put("/auth/profile", profileData),
};

// ============================================================
// ADMIN API
// ============================================================

export const adminAPI = {
  // User Management
  getAllUsers: (params = {}) => api.get("/admin/users", { params }),

  createUser: (userData) => api.post("/admin/users", userData),

  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),

  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Mata Pelajaran Management
  getAllMapel: () => api.get("/admin/mapel"),

  createMapel: (mapelData) => api.post("/admin/mapel", mapelData),

  updateMapel: (mapelId, mapelData) =>
    api.put(`/admin/mapel/${mapelId}`, mapelData),

  deleteMapel: (mapelId) => api.delete(`/admin/mapel/${mapelId}`),

  // Kelas Management
  getAllKelas: () => api.get("/admin/kelas"),

  createKelas: (kelasData) => api.post("/admin/kelas", kelasData),

  updateKelas: (kelasId, kelasData) =>
    api.put(`/admin/kelas/${kelasId}`, kelasData),

  deleteKelas: (kelasId) => api.delete(`/admin/kelas/${kelasId}`),

  // Tahun Ajaran Management
  getAllTahunAjaran: () => api.get("/admin/tahun-ajaran"),

  createTahunAjaran: (tahunData) => api.post("/admin/tahun-ajaran", tahunData),

  updateTahunAjaran: (tahunId, tahunData) =>
    api.put(`/admin/tahun-ajaran/${tahunId}`, tahunData),

  deleteTahunAjaran: (tahunId) => api.delete(`/admin/tahun-ajaran/${tahunId}`),

  // Dashboard
  getDashboard: () => api.get("/admin/dashboard"),

  // Guru-Mapel assignments
  assignGuruMapel: (data) => api.post("/admin/guru-mapel", data),
  unassignGuruMapel: (id) => api.delete(`/admin/guru-mapel/${id}`),
  getGuruMapelByKelas: (kelasId) =>
    api.get("/admin/guru-mapel", { params: { kelasId } }),

  // Rapor & Export
  getAllRapor: () => api.get("/admin/rapor"),

  getRaporById: (raporId) => api.get(`/admin/rapor/${raporId}`),

  exportRaporCSV: (raporId) =>
    api.get(`/admin/export/rapor/${raporId}/csv`, { responseType: "blob" }),

  exportRaporJSON: (raporId) =>
    api.get(`/admin/export/rapor/${raporId}/json`, { responseType: "blob" }),

  exportRaporPDF: (raporId) =>
    api.get(`/admin/export/rapor/${raporId}/pdf`, { responseType: "blob" }),

  exportRaporExcel: (raporId) =>
    api.get(`/admin/export/rapor/${raporId}/excel`, { responseType: "blob" }),

  exportAllRaporPDF: () =>
    api.get("/admin/export/rapor/all/pdf", { responseType: "blob" }),

  exportAllRaporExcel: () =>
    api.get("/admin/export/rapor/all/excel", { responseType: "blob" }),

  exportAllRaporCSV: () =>
    api.get("/admin/export/rapor/all/csv", { responseType: "blob" }),

  exportRaporDetailExcel: () =>
    api.get("/admin/export/rapor/detail/excel", { responseType: "blob" }),

  exportRaporDetailCSV: () =>
    api.get("/admin/export/rapor/detail/csv", { responseType: "blob" }),

  exportAllRaporJSON: () =>
    api.get("/admin/export/rapor/all/json", { responseType: "blob" }),

  // MBTI Admin Controls
  resetMBTI: (siswaId) => api.delete(`/admin/mbti/${siswaId}`),
};

// ============================================================
// TEACHER (GURU) API
// ============================================================

export const guruAPI = {
  getKelas: () => api.get("/guru/kelas"),
  // Kelas yang guru ajar (digunakan untuk input nilai)
  getKelasMengajar: () => api.get("/guru/kelas/mengajar"),

  getKelasTeaching: () => api.get("/guru/kelas"),

  getSiswaInKelas: (kelasId) => api.get(`/guru/kelas/${kelasId}/siswa`),

  inputNilai: (nilaiData) => api.post("/guru/nilai", nilaiData),

  getDashboardKelas: (kelasId) => api.get(`/guru/kelas/${kelasId}/dashboard`),

  createRapor: (raporData) => api.post("/guru/rapor", raporData),

  getMapelForClass: (kelasId) => api.get(`/guru/kelas/${kelasId}/mapel`),

  getRaporIdBySiswa: (siswaId, tahunAjaranId) =>
    api.get(`/guru/rapor/by-siswa`, { params: { siswaId, tahunAjaranId } }),

  getMBTISiswaInKelas: (kelasId) => api.get(`/guru/kelas/${kelasId}/mbti`),
  getIsWaliForKelas: (kelasId) => api.get(`/guru/kelas/${kelasId}/is-wali`),

  // Export per-rapor (akses untuk guru wali kelas)
  exportRaporCSV: (raporId) =>
    api.get(`/guru/rapor/${raporId}/csv`, { responseType: "blob" }),

  exportRaporJSON: (raporId) =>
    api.get(`/guru/rapor/${raporId}/json`, { responseType: "blob" }),

  exportRaporPDF: (raporId) =>
    api.get(`/guru/rapor/${raporId}/pdf`, { responseType: "blob" }),

  exportRaporExcel: (raporId) =>
    api.get(`/guru/rapor/${raporId}/excel`, { responseType: "blob" }),

  // Export rapor PDF by siswa ID (lebih mudah digunakan)
  exportRaporPDFBySiswa: (siswaId) =>
    api.get(`/guru/rapor/siswa/${siswaId}/pdf`, { responseType: "blob" }),
  // Assign/unassign siswa to kelas (wali kelas)
  assignStudentToKelas: (data) => api.post("/guru/kelas/assign", data),
  unassignStudentFromKelas: (siswaId, kelasId) =>
    api.delete(`/guru/kelas/assign/${siswaId}/${kelasId}`),
  // Get all students for selection
  getAllSiswa: () => api.get("/guru/siswa"),
};

// ============================================================
// STUDENT (SISWA) API
// ============================================================

export const siswaAPI = {
  getNilaiRapor: (tahunAjaranId = null) => {
    const params = tahunAjaranId ? { tahun_ajaran_id: tahunAjaranId } : {};
    return api.get("/siswa/nilai", { params });
  },

  getRaporSummary: () => api.get("/siswa/rapor-summary"),

  getMBTIResult: () => api.get("/siswa/mbti"),

  uploadMBTIResult: (mbtiData) => api.post("/siswa/mbti", mbtiData),

  getKelasInfo: () => api.get("/siswa/kelas-info"),

  downloadRaporPDF: () => api.get("/siswa/rapor/pdf", { responseType: "blob" }),
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export const utilAPI = {
  healthCheck: () => api.get("/health"),

  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "Terjadi kesalahan pada server";
  },
};

export default api;
