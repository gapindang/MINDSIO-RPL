import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        nama_lengkap: '',
        role: 'siswa',
        nisn: '',
        nip: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect ke dashboard jika sudah login
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/student/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.username) {
            setError('Username harus diisi');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Username minimal 3 karakter');
            return false;
        }
        if (!formData.email) {
            setError('Email harus diisi');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email tidak valid');
            return false;
        }
        if (!formData.password) {
            setError('Password harus diisi');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok');
            return false;
        }
        if (!formData.nama_lengkap) {
            setError('Nama lengkap harus diisi');
            return false;
        }
        if (formData.role === 'siswa' && !formData.nisn) {
            setError('NISN harus diisi untuk siswa');
            return false;
        }
        if (formData.role === 'guru' && !formData.nip) {
            setError('NIP harus diisi untuk guru');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!validateForm()) {
                setLoading(false);
                return;
            }

            // Prepare data for registration
            const registrationData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                nama_lengkap: formData.nama_lengkap,
                role: formData.role,
            };

            // Add NISN or NIP based on role
            if (formData.role === 'siswa') {
                registrationData.nisn = formData.nisn;
            } else if (formData.role === 'guru') {
                registrationData.nip = formData.nip;
            }

            // Register
            await register(registrationData);

            // Show success message and redirect to login
            setTimeout(() => {
                navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login.' } });
            }, 1000);
        } catch (err) {
            setError(err.message || 'Registrasi gagal');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8 pt-16">
            <div className="w-full max-w-2xl">
                {/* Card */}
                <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                            <UserPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Daftar</h1>
                        <p className="text-sm text-gray-600">Buat akun Mindsio baru Anda</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Row 1: Username & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="pilih username unik"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                />
                            </div>
                        </div>

                        {/* Row 2: Nama Lengkap & Role */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="nama_lengkap" className="block text-xs font-medium text-gray-700 mb-1">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="nama_lengkap"
                                    name="nama_lengkap"
                                    type="text"
                                    value={formData.nama_lengkap}
                                    onChange={handleChange}
                                    placeholder="masukkan nama lengkap"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
                                    Peran / Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                >
                                    <option value="siswa">Siswa</option>
                                    <option value="guru">Guru</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: NISN/NIP */}
                        {formData.role === 'siswa' && (
                            <div>
                                <label htmlFor="nisn" className="block text-xs font-medium text-gray-700 mb-1">
                                    NISN
                                </label>
                                <input
                                    id="nisn"
                                    name="nisn"
                                    type="text"
                                    value={formData.nisn}
                                    onChange={handleChange}
                                    placeholder="masukkan NISN"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                />
                            </div>
                        )}

                        {formData.role === 'guru' && (
                            <div>
                                <label htmlFor="nip" className="block text-xs font-medium text-gray-700 mb-1">
                                    NIP
                                </label>
                                <input
                                    id="nip"
                                    name="nip"
                                    type="text"
                                    value={formData.nip}
                                    onChange={handleChange}
                                    placeholder="masukkan NIP"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                />
                            </div>
                        )}

                        {/* Row 4: Password & Confirm Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="minimal 6 karakter"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                                    Konfirmasi Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="konfirmasi password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200 mt-4 text-sm"
                        >
                            {loading ? 'Sedang mendaftar...' : 'Daftar'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-gray-600 text-xs mt-4">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-4">
                    © 2025 Mindsio. Hak cipta dilindungi.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
