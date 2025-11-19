import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import {
    MdDashboard,
    MdGrade,
    MdPsychology,
    MdQuiz,
    MdLogout
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const StudentSidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        {
            icon: MdDashboard,
            label: 'Dasbor',
            path: '/student/dashboard',
        },
        {
            icon: MdGrade,
            label: 'Nilai Saya',
            path: '/student/grades',
        },
        {
            icon: MdQuiz,
            label: 'Tes MBTI',
            path: '/student/mbti-test',
        },
        {
            icon: MdPsychology,
            label: 'Hasil Saya',
            path: '/student/my-results',
        },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-20 left-4 z-40 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-blue-900 text-white transform transition-transform duration-300 z-30 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-blue-800">
                    <h1 className="text-2xl font-bold">Mindsio</h1>
                    <p className="text-sm text-blue-300">Panel Siswa</p>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    if (window.innerWidth < 768) {
                                        toggleSidebar();
                                    }
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-blue-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900 hover:text-red-100 transition-colors duration-200"
                    >
                        <MdLogout size={20} />
                        <span className="font-medium">Keluar</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default StudentSidebar;
