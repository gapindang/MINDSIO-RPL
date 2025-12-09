import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
    MdDashboard,
    MdPeople,
    MdBook,
    MdCalendarToday,
    MdAssignment,
    MdLogout
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        {
            icon: MdDashboard,
            label: 'Dashboard',
            path: '/admin/dashboard',
        },
        {
            icon: MdPeople,
            label: 'Manajemen Akun',
            path: '/admin/users',
        },
        {
            icon: MdBook,
            label: 'Mata Pelajaran',
            path: '/admin/mata-pelajaran',
        },
        {
            icon: MdCalendarToday,
            label: 'Tahun Ajaran & Kelas',
            path: '/admin/tahun-ajaran',
        },
        {
            icon: MdAssignment,
            label: 'Penugasan Guru',
            path: '/admin/assign-guru',
        },
        {
            icon: MdAssignment,
            label: 'Laporan Rapor',
            path: '/admin/laporan',
        },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
    const placeholder = document.getElementById('sidebar-toggle-placeholder');

    // Track screen size
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* Toggle button portal to navbar (Mobile only) */}
            {isMobile && placeholder && createPortal(
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>,
                placeholder
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-blue-900 text-white transform transition-transform duration-300 z-40 md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-blue-800 flex-shrink-0">
                    <h1 className="text-2xl font-bold">Mindsio</h1>
                    <p className="text-sm text-blue-300">Admin Panel</p>
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
                <div className="p-4 border-t border-blue-800 flex-shrink-0">
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

export default AdminSidebar;
