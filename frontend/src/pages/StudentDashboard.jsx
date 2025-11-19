import React, { useState } from 'react';
import { TrendingUp, Award, BookOpen, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import StudentSidebar from '../components/Student/StudentSidebar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const stats = [
        { title: 'IPK Saat Ini', value: '3.70', subtitle: '+0,1 dari bulan lalu', icon: TrendingUp, color: 'blue' },
        { title: 'Mata Pelajaran', value: '5', subtitle: 'Aktif semester ini', icon: BookOpen, color: 'purple' },
        { title: 'Nilai Rata-rata', value: '87,6%', subtitle: 'Di semua mata pelajaran', icon: Award, color: 'yellow' },
        { title: 'Tipe MBTI', value: 'INFP', subtitle: 'Si Mediator', icon: Sparkles, color: 'green' },
    ];

    const gpaData = [
        { month: 'Sep', gpa: 3.2 },
        { month: 'Okt', gpa: 3.4 },
        { month: 'Nov', gpa: 3.3 },
        { month: 'Des', gpa: 3.5 },
        { month: 'Jan', gpa: 3.7 },
    ];

    const subjectPerformance = [
        { name: 'Matematika', score: 85 },
        { name: 'Sains', score: 92 },
        { name: 'Bahasa Inggris', score: 88 },
        { name: 'Sejarah', score: 78 },
        { name: 'Seni', score: 95 },
    ];

    const detailedProgress = [
        { subject: 'Matematika', progress: 88, color: 'blue' },
        { subject: 'Sains', progress: 92, color: 'green' },
        { subject: 'Bahasa Inggris', progress: 88, color: 'blue' },
        { subject: 'Sejarah', progress: 73, color: 'yellow' },
        { subject: 'Seni', progress: 92, color: 'green' },
    ];

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
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={gpaData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={[0, 4]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="gpa" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subject Performance Chart */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performa Mata Pelajaran</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={subjectPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Subject Progress */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Perkembangan Detail per Mata Pelajaran</h2>
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
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${item.progress >= 90 ? 'bg-green-100 text-green-800' :
                                            item.progress >= 80 ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.progress}%
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
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
