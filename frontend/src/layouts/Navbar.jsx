import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, User } from 'lucide-react';

const Navbar = ({ userRole, userName }) => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <span className="text-xl font-semibold text-gray-900">Mindsio</span>
                        </Link>

                        <div className="hidden md:flex space-x-4">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Home
                            </Link>

                            {userRole === 'teacher' && (
                                <Link
                                    to="/teacher/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/teacher/dashboard') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                            )}

                            {userRole === 'student' && (
                                <>
                                    <Link
                                        to="/student/dashboard"
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/dashboard') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/student/mbti-test"
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/mbti-test') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        MBTI Test
                                    </Link>
                                    <Link
                                        to="/student/my-results"
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/student/my-results') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        My Results
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {userRole ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {userName || (userRole === 'teacher' ? 'Teacher' : 'Student')}
                                    </span>
                                </div>
                                <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
