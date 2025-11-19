import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <span className="text-xl font-semibold text-gray-900">Mindsio</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-4">
                            {!isAuthenticated && (
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Beranda
                                </Link>
                            )}

                            {isAuthenticated && user?.role === 'guru' && (
                                <Link
                                    to="/teacher/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/teacher/dashboard') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Dasbor
                                </Link>
                            )}

                            {isAuthenticated && user?.role === 'siswa' && (
                                <>
                                    <Link
                                        to="/student/dashboard"
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/dashboard') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Dasbor
                                    </Link>
                                    <Link
                                        to="/student/grades"
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/grades') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Nilai Saya
                                    </Link>
                                    <Link
                                        to="/student/mbti-test"
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/mbti-test') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Tes MBTI
                                    </Link>
                                    <Link
                                        to="/student/my-results"
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/my-results') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Hasil Saya
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Auth Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{user?.nama_lengkap}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Keluar</span>
                                </button>
                            </>
                        ) : (
                            <div className="space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        {!isAuthenticated && (
                            <Link
                                to="/"
                                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Beranda
                            </Link>
                        )}

                        {isAuthenticated && user?.role === 'guru' && (
                            <Link
                                to="/teacher/dashboard"
                                className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/teacher/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Dashboard
                            </Link>
                        )}

                        {isAuthenticated && user?.role === 'siswa' && (
                            <>
                                <Link
                                    to="/student/dashboard"
                                    className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/student/grades"
                                    className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/grades') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Nilai Saya
                                </Link>
                                <Link
                                    to="/student/mbti-test"
                                    className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/mbti-test') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Tes MBTI
                                </Link>
                                <Link
                                    to="/student/my-results"
                                    className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/my-results') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Hasil Saya
                                </Link>
                            </>
                        )}

                        <div className="pt-2 border-t">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium text-gray-700">{user?.nama_lengkap}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                                    >
                                        Keluar
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 text-sm font-medium text-center text-blue-600 border border-blue-600 rounded-md"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md text-center"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
