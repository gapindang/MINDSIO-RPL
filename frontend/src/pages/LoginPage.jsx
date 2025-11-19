import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirect ke dashboard sesuai role
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'guru') {
                navigate('/teacher/dashboard');
            } else if (user.role === 'siswa') {
                navigate('/student/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.username || !formData.password) {
                setError('Username dan password harus diisi');
                setLoading(false);
                return;
            }

            const response = await login(formData);
            const userRole = response.user.role;

            if (userRole === 'guru') {
                navigate('/teacher/dashboard');
            } else if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError(err.message || authError || 'Login gagal');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 pt-16">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                            <LogIn className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Masuk</h1>
                        <p className="text-gray-600">Selamat datang kembali di Mindsio</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username atau Email
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="masukkan username atau email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="masukkan password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200"
                        >
                            {loading ? 'Sedang masuk...' : 'Masuk'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">atau</span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-gray-600 text-sm">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                            Daftar di sini
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    © 2025 Mindsio. Hak cipta dilindungi.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
