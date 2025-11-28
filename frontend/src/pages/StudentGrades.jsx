import React, { useEffect, useMemo, useState } from 'react';
import { siswaAPI } from '../services/api';
import StudentSidebar from '../components/Student/StudentSidebar';
import { Loader } from 'lucide-react';

const StudentGrades = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nilai, setNilai] = useState([]);
    const [raporSummary, setRaporSummary] = useState([]);
    const [tahunAjaranId, setTahunAjaranId] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const [nilaiRes, raporRes] = await Promise.all([
                    siswaAPI.getNilaiRapor(tahunAjaranId || null),
                    siswaAPI.getRaporSummary(),
                ]);
                setNilai(nilaiRes.data || []);
                setRaporSummary(raporRes.data || []);
            } catch (e) {
                setError('Gagal memuat nilai');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [tahunAjaranId]);

    const tahunOptions = useMemo(() => {
        const unique = new Map();
        (raporSummary || []).forEach((r) => {
            if (r.tahun_ajaran && r.id) {
                unique.set(r.tahun_ajaran, r);
            }
        });
        return Array.from(unique.values());
    }, [raporSummary]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-16">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Memuat nilai...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-16">
            {/* Sidebar */}
            <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8 transition-all duration-300">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Nilai Saya</h1>
                    <p className="text-gray-600 mt-2">Lihat nilai per mata pelajaran</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter Tahun Ajaran
                            </label>
                            <select
                                value={tahunAjaranId}
                                onChange={(e) => setTahunAjaranId(e.target.value)}
                                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">Semua</option>
                                {tahunOptions.map((t) => (
                                    <option key={t.id} value={t.tahun_ajaran_id || ''}>{t.tahun_ajaran}</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-600">
                            Total: <strong>{nilai.length}</strong> mata pelajaran
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mata Pelajaran</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">UTS</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">UAS</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nilai Akhir</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Guru</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Komentar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {nilai.map((n) => (
                                    <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{n.nama_mapel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{n.nilai_uts ?? '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{n.nilai_uas ?? '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${n.nilai_akhir >= 85 ? 'bg-green-100 text-green-800' :
                                                    n.nilai_akhir >= 75 ? 'bg-blue-100 text-blue-800' :
                                                        n.nilai_akhir >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {n.nilai_akhir ?? '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{n.guru_nama}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 italic">{n.komentar || '-'}</td>
                                    </tr>
                                ))}
                                {nilai.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-gray-500">Belum ada nilai</p>
                                                <p className="text-sm text-gray-400">Nilai akan muncul setelah guru menginput</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentGrades;
