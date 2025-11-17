import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './layouts/Navbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MBTITest from './pages/MBTITest';
import MBTIResults from './pages/MBTIResults';
import StudentGrades from './pages/StudentGrades';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminMataPelajaran from './pages/Admin/AdminMataPelajaran';
import AdminTahunAjaran from './pages/Admin/AdminTahunAjaran';
import AdminLaporan from './pages/Admin/AdminLaporan';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole="siswa">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/grades"
              element={
                <ProtectedRoute requiredRole="siswa">
                  <StudentGrades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/mbti-test"
              element={
                <ProtectedRoute requiredRole="siswa">
                  <MBTITest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-results"
              element={
                <ProtectedRoute requiredRole="siswa">
                  <MBTIResults />
                </ProtectedRoute>
              }
            />

            {/* Teacher Protected Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute requiredRole="guru">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/mata-pelajaran"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminMataPelajaran />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tahun-ajaran"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTahunAjaran />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/laporan"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLaporan />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
