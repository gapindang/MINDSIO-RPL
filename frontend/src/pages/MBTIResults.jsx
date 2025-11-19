import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Eye, Headphones, Zap, CheckCircle } from 'lucide-react';
import { siswaAPI } from '../services/api';
import StudentSidebar from '../components/Student/StudentSidebar';

const MBTIResults = () => {
    const location = useLocation();
    const initialType = location.state?.mbtiType || null;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                // Prefer server result so recommendations are included
                const { data } = await siswaAPI.getMBTIResult();
                setResult(data);
            } catch (e) {
                // Fallback to client type if provided
                if (initialType) {
                    setResult({ mbti_type: initialType });
                } else {
                    setError('Hasil MBTI belum tersedia. Silakan lakukan tes.');
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [initialType]);

    const learningRecommendations = [
        {
            icon: Eye,
            title: 'Pembelajaran Visual',
            description: 'Gunakan peta konsep, diagram, dan catatan berwarna untuk mengorganisir informasi serta membuat panduan belajar visual.',
            color: 'blue',
        },
        {
            icon: Headphones,
            title: 'Pembelajaran Auditori',
            description: 'Dengarkan podcast, ikut diskusi, dan rekam penjelasan untuk memperkuat pembelajaran melalui pendengaran.',
            color: 'purple',
        },
        {
            icon: Zap,
            title: 'Pembelajaran Kinestetik',
            description: 'Lakukan aktivitas praktik, gunakan objek fisik untuk mewakili ide, dan selingi belajar dengan jeda untuk bergerak.',
            color: 'green',
        },
    ];

    const studyTips = [
        'Sediakan waktu khusus untuk refleksi dan eksplorasi kreatif',
        'Hubungkan informasi baru dengan nilai serta pengalaman pribadi Anda',
        'Gunakan cerita atau narasi untuk mengingat konsep kompleks',
        'Ciptakan lingkungan belajar yang nyaman dan inspiratif',
        'Ambil jeda rutin untuk memproses informasi secara mendalam',
    ];

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="md:ml-64 flex items-center justify-center text-gray-600 min-h-[calc(100vh-4rem)] transition-all duration-300">Memuat hasil MBTI...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="md:ml-64 flex items-center justify-center min-h-[calc(100vh-4rem)] transition-all duration-300 px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-red-500 max-w-md">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-900">Hasil MBTI Belum Tersedia</h3>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.href = '/student/mbti-test'}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Lakukan Tes MBTI
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const mbtiType = result?.mbti_type || 'INFP';
    const info = {
        name: result?.nama_tipe || mbtiType,
        description: result?.deskripsi || 'Hasil MBTI Anda ditampilkan di bawah ini.',
        strengths: [result?.kekuatan_1, result?.kekuatan_2, result?.kekuatan_3].filter(Boolean),
        learningStyle: result?.gaya_belajar || 'Personalized Learning',
        learningDescription: 'Rekomendasi berdasarkan tipe MBTI Anda',
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-16">
            {/* Sidebar */}
            <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="md:ml-64 py-12 px-4 transition-all duration-300">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil MBTI Anda</h1>
                        <p className="text-gray-600">Wawasan personal untuk belajar lebih efektif</p>
                    </div>

                    {/* Main Result Card */}
                    <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-200 mb-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex p-4 bg-blue-600 rounded-full mb-4">
                                <Sparkles className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{mbtiType}</h2>
                            <p className="text-lg text-blue-600 font-semibold mb-4">{info.name}</p>
                            <p className="text-gray-600 max-w-2xl mx-auto">{info.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Kekuatan Anda</h3>
                                <ul className="space-y-2">
                                    {info.strengths.map((strength, index) => (
                                        <li key={index} className="flex items-center text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-yellow-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Gaya Belajar yang Disukai
                                </h3>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Eye className="h-6 w-6 text-yellow-600" />
                                    <span className="text-xl font-bold text-yellow-600">{info.learningStyle}</span>
                                </div>
                                <p className="text-sm text-gray-600">{info.learningDescription}</p>
                            </div>
                        </div>
                    </div>

                    {/* Learning Style Recommendations */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rekomendasi Gaya Belajar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {learningRecommendations.map((rec, index) => {
                                const Icon = rec.icon;
                                return (
                                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                        <div className={`inline-flex p-3 rounded-lg ${colorClasses[rec.color]} mb-4`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                                        <p className="text-sm text-gray-600">{rec.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Personalized Study Tips */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tips Belajar yang Dipersonalisasi untuk {mbtiType}</h2>
                        <ul className="space-y-3">
                            {[result?.rekomendasi_belajar_1, result?.rekomendasi_belajar_2, result?.rekomendasi_belajar_3]
                                .filter(Boolean)
                                .map((tip, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                                            {index + 1}
                                        </span>
                                        <span className="text-gray-700">{tip}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MBTIResults;
