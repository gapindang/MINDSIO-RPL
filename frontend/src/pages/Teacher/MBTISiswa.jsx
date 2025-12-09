import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guruAPI } from '../../services/api';
import TeacherSidebar from '../../components/Teacher/TeacherSidebar';
import { Loader, AlertCircle, ArrowLeft, Brain, CheckCircle, XCircle } from 'lucide-react';
import { MdPsychology } from 'react-icons/md';

const MBTISiswa = () => {
    const { kelasId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const [mbtiData, setMbtiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [kelasInfo, setKelasInfo] = useState(null);
    const [selectedSiswa, setSelectedSiswa] = useState(null);

    useEffect(() => {
        fetchData();
    }, [kelasId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mbtiRes, kelasRes] = await Promise.all([
                guruAPI.getMBTISiswaInKelas(kelasId),
                guruAPI.getKelas()
            ]);
            setMbtiData(mbtiRes.data);
            const currentKelas = kelasRes.data.find(k => k.id === kelasId);
            setKelasInfo(currentKelas);
            setError(null);
        } catch (err) {
            // Jika server mengembalikan 403, gunakan pesan server jika ada.
            // Jika server mengirim 'Akses ditolak' (generik), ganti dengan pesan yang diminta.
            if (err?.response?.status === 403) {
                const serverMsg = err.response?.data?.message || '';
                if (serverMsg && serverMsg !== 'Akses ditolak') {
                    setError(serverMsg);
                } else {
                    setError('tidak memiliki akses mbti ke kelas ini, karena anda bukan wali kelasnya');
                }
            } else {
                setError('Gagal memuat data MBTI');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStats = () => {
        const total = mbtiData.length;
        const completed = mbtiData.filter(s => s.tipe_mbti).length;
        const notCompleted = total - completed;
        return { total, completed, notCompleted };
    };

    const getMBTITypes = () => {
        const types = {};
        mbtiData.forEach(s => {
            if (s.tipe_mbti) {
                types[s.tipe_mbti] = (types[s.tipe_mbti] || 0) + 1;
            }
        });
        return Object.entries(types).sort((a, b) => b[1] - a[1]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-purple-600 animate-spin" />
                    <p className="text-gray-600">Memuat data MBTI...</p>
                </div>
            </div>
        );
    }

    const stats = getStats();
    const mbtiTypes = getMBTITypes();

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Sidebar */}
            <TeacherSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} kelasId={kelasId} />

            {/* Main Content */}
            <div className="md:ml-64 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/teacher/dashboard')}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Hasil Tes MBTI Siswa</h1>
                    <p className="text-gray-600 mt-2">
                        {kelasInfo?.nama_kelas} - {kelasInfo?.tahun_ajaran}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <MdPsychology className="text-5xl text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Sudah Tes</p>
                                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Belum Tes</p>
                                <p className="text-3xl font-bold text-red-600">{stats.notCompleted}</p>
                            </div>
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* MBTI Type Distribution */}
                {mbtiTypes.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Distribusi Tipe MBTI</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {mbtiTypes.map(([type, count]) => (
                                <div key={type} className="bg-purple-50 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-purple-600">{type}</p>
                                    <p className="text-sm text-gray-600">{count} siswa</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Student List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Daftar Siswa & Hasil MBTI</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Siswa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NISN
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipe MBTI
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mbtiData.map(siswa => (
                                    <tr key={siswa.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{siswa.nama_lengkap}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-600">{siswa.nisn}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {siswa.tipe_mbti ? (
                                                <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    {siswa.tipe_mbti}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {siswa.tipe_mbti ? (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Sudah Tes
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Belum Tes
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {siswa.tipe_mbti ? (
                                                <button
                                                    onClick={() => setSelectedSiswa(siswa)}
                                                    className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                                                >
                                                    Lihat Detail
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Modal */}
                {selectedSiswa && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedSiswa.nama_lengkap}</h3>
                                        <p className="text-gray-600">NISN: {selectedSiswa.nisn}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSiswa(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* MBTI Type */}
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-2">Tipe MBTI</label>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-3xl font-bold text-purple-600 text-center">
                                            {selectedSiswa.tipe_mbti}
                                        </p>
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                {selectedSiswa.deskripsi && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 block mb-2">Deskripsi Kepribadian</label>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-800 whitespace-pre-wrap">{selectedSiswa.deskripsi}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Rekomendasi */}
                                {selectedSiswa.rekomendasi_belajar && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 block mb-2">
                                            Rekomendasi Gaya Belajar
                                        </label>
                                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                            <p className="text-gray-800 whitespace-pre-wrap">{selectedSiswa.rekomendasi_belajar}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Tanggal Tes */}
                                {selectedSiswa.tanggal_tes && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 block mb-2">Tanggal Tes</label>
                                        <p className="text-gray-800">
                                            {new Date(selectedSiswa.tanggal_tes).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setSelectedSiswa(null)}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MBTISiswa;
