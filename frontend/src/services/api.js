import axios from "axios";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTHENTICATION API
// ============================================================

export const authAPI = {
  // Register new user
  register: (userData) => api.post("/auth/register", userData),

  // Login user
  login: (credentials) => api.post("/auth/login", credentials),

  // Get current user profile
  getProfile: () => api.get("/auth/profile"),

  // Update user profile
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

  // Subject (Mata Pelajaran) Management
  getAllMapel: () => api.get("/admin/mapel"),

  createMapel: (mapelData) => api.post("/admin/mapel", mapelData),

  // Class (Kelas) Management
  getAllKelas: () => api.get("/admin/kelas"),

  createKelas: (kelasData) => api.post("/admin/kelas", kelasData),

  // Academic Year (Tahun Ajaran) Management
  getAllTahunAjaran: () => api.get("/admin/tahun-ajaran"),

  createTahunAjaran: (tahunData) => api.post("/admin/tahun-ajaran", tahunData),

  // Admin Dashboard
  getDashboard: () => api.get("/admin/dashboard"),
};

// ============================================================
// TEACHER (GURU) API
// ============================================================

export const guruAPI = {
  // Get classes taught by teacher
  getKelasTeaching: () => api.get("/guru/kelas"),

  // Get students in specific class
  getSiswaInKelas: (kelasId) => api.get(`/guru/kelas/${kelasId}/siswa`),

  // Input student grades
  inputNilai: (nilaiData) => api.post("/guru/nilai", nilaiData),

  // Get class dashboard
  getDashboardKelas: (kelasId) => api.get(`/guru/kelas/${kelasId}/dashboard`),

  // Create student report card
  createRapor: (raporData) => api.post("/guru/rapor", raporData),
};

// ============================================================
// STUDENT (SISWA) API
// ============================================================

export const siswaAPI = {
  // Get student grades by academic year
  getNilaiRapor: (tahunAjaranId = null) => {
    const params = tahunAjaranId ? { tahun_ajaran_id: tahunAjaranId } : {};
    return api.get("/siswa/nilai", { params });
  },

  // Get student report card summary
  getRaporSummary: () => api.get("/siswa/rapor"),

  // Get student MBTI result
  getMBTIResult: () => api.get("/siswa/mbti"),

  // Upload MBTI test result
  uploadMBTIResult: (mbtiData) => api.post("/siswa/mbti", mbtiData),

  // Get student class info
  getKelasInfo: () => api.get("/siswa/kelas"),
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export const utilAPI = {
  // Health check
  healthCheck: () => api.get("/health"),

  // Format API error messages
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
