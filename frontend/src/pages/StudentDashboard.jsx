import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import StudentSidebar from '../components/Student/StudentSidebar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { siswaAPI } from '../services/api';

const StudentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const [loading, setLoading] = useState(true);
    const [mbtiData, setMbtiData] = useState(null);
    const [raporData, setRaporData] = useState(null);
    const [nilaiData, setNilaiData] = useState([]);
    const [kelasInfo, setKelasInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all data in parallel
                const [mbtiRes, raporRes, nilaiRes, kelasRes] = await Promise.all([
                    siswaAPI.getMBTIResult().catch((err) => {
                        console.error('MBTI Error:', err?.response?.data || err?.message);
                        return null;
                    }),
                    siswaAPI.getRaporSummary().catch((err) => {
                        console.error('Rapor Error:', err?.response?.data || err?.message);
                        return null;
                    }),
                    siswaAPI.getNilaiRapor().catch((err) => {
                        console.error('Nilai Error:', err?.response?.data || err?.message);
                        return { data: [] };
                    }),
                    siswaAPI.getKelasInfo().catch((err) => {
                        console.error('Kelas Error:', err?.response?.data || err?.message);
                        return null;
                    }),
                ]);

                console.log('Rapor Response:', raporRes?.data);
                setMbtiData(mbtiRes?.data || null);
                setRaporData(raporRes?.data?.[0] || null);
                setNilaiData(nilaiRes?.data || []);
                setKelasInfo(kelasRes?.data || null);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate stats from real data
    const rataRata = raporData?.rata_rata_nilai ? Number(raporData.rata_rata_nilai) : null;
    const jumlahMapel = nilaiData.length || 0;
    const mbtiType = mbtiData?.mbti_type || '-';
    const mbtiName = mbtiData?.deskripsi?.split('-')[0]?.trim() || 'Belum ada';

    // Handle case when rata_rata_nilai is 0 or null
    const displayRataRata = rataRata && rataRata > 0 ? rataRata : null;
    const ipk = displayRataRata ? (displayRataRata / 25).toFixed(2) : '-';
    const rataRataDisplay = displayRataRata ? displayRataRata.toFixed(1) : '-';

    const stats = [
        { title: 'IPK Saat Ini', value: ipk, subtitle: kelasInfo?.tahun_ajaran || 'Tahun ajaran aktif', icon: TrendingUp, color: 'blue' },
        { title: 'Mata Pelajaran', value: jumlahMapel.toString(), subtitle: 'Aktif semester ini', icon: BookOpen, color: 'purple' },
        { title: 'Nilai Rata-rata', value: rataRataDisplay, subtitle: 'Di semua mata pelajaran', icon: Award, color: 'yellow' },
        { title: 'Tipe MBTI', value: mbtiType, subtitle: mbtiName, icon: Sparkles, color: 'green' },
    ];

    // Generate GPA trend from rapor history
    const gpaData = displayRataRata ? [
        { month: 'Semester', gpa: (displayRataRata / 25).toFixed(2) }
    ] : [];

    // Convert nilai to subject performance
    const subjectPerformance = nilaiData.map(n => ({
        name: n.nama_mapel,
        score: Number(n.nilai_akhir) || 0
    }));

    const detailedProgress = nilaiData.map(n => {
        const progress = Number(n.nilai_akhir) || 0;
        return {
            subject: n.nama_mapel,
            progress: progress,
            color: progress >= 85 ? 'green' : progress >= 75 ? 'blue' : 'yellow'
        };
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="md:ml-64 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-gray-600">Memuat data dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Sidebar */}
            <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="md:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Selamat datang kembali, Siswa!</h1>
                    <p className="text-gray-600 mt-1">Berikut ringkasan perkembangan akademik Anda</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* GPA Trend Chart */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tren IPK</h2>
                        {gpaData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={gpaData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 4]} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="gpa" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                Belum ada data rapor
                            </div>
                        )}
                    </div>

                    {/* Subject Performance Chart */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performa Mata Pelajaran</h2>
                        {subjectPerformance.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={subjectPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                Belum ada data nilai
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Subject Progress */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Perkembangan Detail per Mata Pelajaran</h2>
                    {detailedProgress.length > 0 ? (
                        <div className="space-y-4">
                            {detailedProgress.map((item, index) => {
                                const colorClasses = {
                                    blue: 'bg-blue-600',
                                    green: 'bg-green-600',
                                    yellow: 'bg-yellow-500',
                                };

                                return (
                                    <div key={index}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded ${item.progress >= 85 ? 'bg-green-100 text-green-800' :
                                                item.progress >= 75 ? 'bg-blue-100 text-blue-800' :
                                                    item.progress >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {Math.round(item.progress)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${colorClasses[item.color]}`}
                                                style={{ width: `${item.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Belum ada data nilai untuk ditampilkan
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
