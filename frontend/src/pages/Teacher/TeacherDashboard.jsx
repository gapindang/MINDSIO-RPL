import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { guruAPI } from '../../services/api';
import TeacherSidebar from '../../components/Teacher/TeacherSidebar';
import {
    MdClass,
    MdPeople,
    MdTrendingUp,
    MdAssessment,
    MdPsychology,
    MdArrowForward
} from 'react-icons/md';
import { Loader, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [kelas, setKelas] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchKelas();
    }, []);

    useEffect(() => {
        if (selectedKelas) {
            fetchDashboardData(selectedKelas);
        }
    }, [selectedKelas]);

    const fetchKelas = async () => {
        try {
            setLoading(true);
            const response = await guruAPI.getKelas();
            setKelas(response.data);
            if (response.data.length > 0) {
                setSelectedKelas(response.data[0].id);
            }
        } catch (err) {
            setError('Gagal memuat data kelas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardData = async (kelasId) => {
        try {
            setLoading(true);
            const response = await guruAPI.getDashboardKelas(kelasId);
            setDashboardData(response.data);
        } catch (err) {
            setError('Gagal memuat data dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const currentKelas = kelas.find(k => k.id === selectedKelas);

    if (loading && kelas.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Sidebar */}
            <TeacherSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} kelasId={selectedKelas} />

            {/* Main Content */}
            <div className="md:ml-64 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Dashboard Guru</h1>
                    <p className="text-gray-600 mt-2">Kelola nilai dan pantau perkembangan siswa</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Kelas Selector */}
                {kelas.length > 0 && (
                    <div className="mb-6 bg-white rounded-lg shadow p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Kelas
                        </label>
                        <select
                            value={selectedKelas || ''}
                            onChange={(e) => setSelectedKelas(e.target.value)}
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {kelas.map(k => (
                                <option key={k.id} value={k.id}>
                                    {k.nama_kelas} - {k.tahun_ajaran} ({k.jumlah_siswa} siswa)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => navigate(`/teacher/input-nilai/${selectedKelas}`)}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-blue-500 text-left group"
                        disabled={!selectedKelas}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Input Nilai</p>
                                <p className="text-lg font-bold text-gray-900">Rapor Siswa</p>
                            </div>
                            <MdAssessment className="text-4xl text-blue-500 group-hover:scale-110 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate(`/teacher/komentar/${selectedKelas}`)}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-green-500 text-left group"
                        disabled={!selectedKelas}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Komentar &</p>
                                <p className="text-lg font-bold text-gray-900">Apresiasi</p>
                            </div>
                            <MdTrendingUp className="text-4xl text-green-500 group-hover:scale-110 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate(`/teacher/mbti-siswa/${selectedKelas}`)}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-purple-500 text-left group"
                        disabled={!selectedKelas}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Hasil Tes</p>
                                <p className="text-lg font-bold text-gray-900">MBTI Siswa</p>
                            </div>
                            <MdPsychology className="text-4xl text-purple-500 group-hover:scale-110 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate(`/teacher/cetak-rapor/${selectedKelas}`)}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-orange-500 text-left group"
                        disabled={!selectedKelas}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Cetak</p>
                                <p className="text-lg font-bold text-gray-900">Rapor Digital</p>
                            </div>
                            <MdArrowForward className="text-4xl text-orange-500 group-hover:scale-110 transition-transform" />
                        </div>
                    </button>
                </div>

                {/* Dashboard Stats */}
                {dashboardData && currentKelas && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Jumlah Siswa</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {dashboardData.statistik.jumlah_siswa || 0}
                                        </p>
                                    </div>
                                    <MdPeople className="text-5xl text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Rata-rata Kelas</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {dashboardData.statistik.rata_rata_kelas
                                                ? Number(dashboardData.statistik.rata_rata_kelas).toFixed(2)
                                                : '0.00'}
                                        </p>
                                    </div>
                                    <MdTrendingUp className="text-5xl text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Nilai Tertinggi</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {dashboardData.statistik.nilai_tertinggi
                                                ? Number(dashboardData.statistik.nilai_tertinggi).toFixed(2)
                                                : '-'}
                                        </p>
                                    </div>
                                    <MdAssessment className="text-5xl text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Nilai Terendah</p>
                                        <p className="text-3xl font-bold text-red-600">
                                            {dashboardData.statistik.nilai_terendah
                                                ? Number(dashboardData.statistik.nilai_terendah).toFixed(2)
                                                : '-'}
                                        </p>
                                    </div>
                                    <MdAssessment className="text-5xl text-red-500" />
                                </div>
                            </div>
                        </div>

                        {/* Performa Per Mata Pelajaran Chart */}
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Rata-rata Nilai Per Mata Pelajaran
                            </h2>
                            {dashboardData.performa_mapel && dashboardData.performa_mapel.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={dashboardData.performa_mapel}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="nama_mapel"
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                        />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="rata_rata"
                                            fill="#3B82F6"
                                            name="Rata-rata"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    Belum ada data nilai untuk kelas ini
                                </p>
                            )}
                        </div>

                        {/* MBTI Info */}
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Tes MBTI Siswa</h3>
                                    <p className="text-purple-100">
                                        {dashboardData.statistik.mbti_selesai || 0} dari {dashboardData.statistik.jumlah_siswa || 0} siswa
                                        telah menyelesaikan tes MBTI
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/teacher/mbti-siswa/${selectedKelas}`)}
                                    className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                                >
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* No Class Message */}
                {kelas.length === 0 && !loading && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <MdClass className="mx-auto text-6xl text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Belum Ada Kelas
                        </h3>
                        <p className="text-gray-600">
                            Anda belum ditugaskan sebagai wali kelas. Hubungi admin untuk informasi lebih lanjut.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
