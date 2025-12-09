import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import StatCard from '../../components/StatCard';
import { adminAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Loader } from 'lucide-react';
import { MdPeople, MdSchool, MdBusiness, MdAdminPanelSettings } from 'react-icons/md';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.getDashboard();
            setStats(response.data);
        } catch (err) {
            setError('Gagal mengambil data dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-16">
            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8 transition-all duration-300">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Dashboard Admin</h1>
                    <p className="text-gray-600 mt-2">Selamat datang di panel admin Mindsio</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total Guru"
                                value={stats.totalGuru || 0}
                                icon={MdPeople}
                                color="blue"
                            />
                            <StatCard
                                title="Total Siswa"
                                value={stats.totalSiswa || 0}
                                icon={MdSchool}
                                color="green"
                            />
                            <StatCard
                                title="Total Kelas"
                                value={stats.totalKelas || 0}
                                icon={MdBusiness}
                                color="purple"
                            />
                            <StatCard
                                title="Total Admin"
                                value={stats.totalAdmin || 0}
                                icon={MdAdminPanelSettings}
                                color="yellow"
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* User Distribution Chart */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Distribusi Pengguna</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Guru', value: stats.totalGuru || 0 },
                                                { name: 'Siswa', value: stats.totalSiswa || 0 },
                                                { name: 'Admin', value: stats.totalAdmin || 0 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {[0, 1, 2].map((index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Statistics Summary */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Statistik</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b">
                                        <span className="text-gray-600">Total Pengguna</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {(stats.totalGuru || 0) + (stats.totalSiswa || 0) + (stats.totalAdmin || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b">
                                        <span className="text-gray-600">Total Mata Pelajaran</span>
                                        <span className="text-2xl font-bold text-purple-600">
                                            {stats.totalMapel || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b">
                                        <span className="text-gray-600">Tahun Ajaran Aktif</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {stats.tahunAjaranAktif || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Status Sistem</span>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            Aktif
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <button onClick={() => navigate('/admin/users', { state: { openAddModal: true, defaultRole: 'guru' } })} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                                    <p className="text-blue-600 font-semibold">Tambah Guru</p>
                                </button>
                                <button onClick={() => navigate('/admin/users', { state: { openAddModal: true, defaultRole: 'siswa' } })} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
                                    <p className="text-green-600 font-semibold">Tambah Siswa</p>
                                </button>
                                <button onClick={() => navigate('/admin/mata-pelajaran')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                                    <p className="text-purple-600 font-semibold">Tambah Mapel</p>
                                </button>
                                <button onClick={() => navigate('/admin/tahun-ajaran')} className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
                                    <p className="text-orange-600 font-semibold">Atur Kelas</p>
                                </button>
                                <button onClick={() => navigate('/admin/laporan')} className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-center transition-colors">
                                    <p className="text-red-600 font-semibold">Lihat Laporan</p>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
