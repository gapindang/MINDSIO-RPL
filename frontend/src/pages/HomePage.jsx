import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Lightbulb, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        // Redirect admin ke admin dashboard
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (isAuthenticated && user?.role === 'guru') {
            navigate('/teacher/dashboard');
        } else if (isAuthenticated && user?.role === 'siswa') {
            navigate('/student/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const features = [
        {
            icon: TrendingUp,
            title: 'Pantau Perkembangan',
            description: 'Monitor perkembangan akademik Anda dengan grafik dan insight yang jelas.',
            color: 'blue',
        },
        {
            icon: Lightbulb,
            title: 'Wawasan MBTI',
            description: 'Temukan tipe kepribadian Anda dan pengaruhnya pada gaya belajar.',
            color: 'yellow',
        },
        {
            icon: Sparkles,
            title: 'Tips Personalisasi',
            description: 'Dapatkan rekomendasi belajar yang dipersonalisasi berdasarkan kepribadian Anda.',
            color: 'green',
        },
        {
            icon: Users,
            title: 'Dukungan Guru',
            description: 'Guru dapat memantau dan mendukung siswa dengan lebih efektif.',
            color: 'purple',
        },
    ];

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="p-4 bg-blue-600 rounded-full">
                            <Sparkles className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Temukan Cara Belajar Terbaik Anda
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Mindsio menggabungkan pelacakan akademik dengan wawasan kepribadian untuk membantu siswa mencapai potensi maksimal melalui rekomendasi belajar yang dipersonalisasi.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/student/mbti-test"
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                        >
                            Ikuti Tes MBTI
                        </Link>
                        <Link
                            to="/student/dashboard"
                            className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md border-2 border-blue-600 hover:bg-blue-50 transition"
                        >
                            Lihat Rapor
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                        Mengapa Memilih Mindsio?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
                                    <div className={`inline-flex p-3 rounded-lg ${colorClasses[feature.color]} mb-4`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-4 bg-blue-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">Cara Kerja</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <div>
                            <div className="text-4xl font-bold mb-4">1</div>
                            <h3 className="text-xl font-semibold mb-2">Ikuti Tes</h3>
                            <p className="text-blue-100">Selesaikan asesmen kepribadian MBTI</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-4">2</div>
                            <h3 className="text-xl font-semibold mb-2">Dapatkan Wawasan</h3>
                            <p className="text-blue-100">Ketahui gaya belajar dan kekuatan Anda</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-4">3</div>
                            <h3 className="text-xl font-semibold mb-2">Pantau Perkembangan</h3>
                            <p className="text-blue-100">Pantau performa akademik Anda dari waktu ke waktu</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
