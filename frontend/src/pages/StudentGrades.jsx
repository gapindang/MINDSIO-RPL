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
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Sidebar */}
            <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="md:ml-64 max-w-5xl mx-auto p-6 transition-all duration-300">
                <div className="mb-6 flex items-end gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Nilai Saya</h1>
                        <p className="text-gray-600 text-sm">Lihat nilai per mata pelajaran</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter Tahun Ajaran</label>
                        <select value={tahunAjaranId} onChange={(e) => setTahunAjaranId(e.target.value)} className="px-3 py-2 border rounded-md">
                            <option value="">Semua</option>
                            {tahunOptions.map((t) => (
                                <option key={t.id} value={t.tahun_ajaran_id || ''}>{t.tahun_ajaran}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>
                )}

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mata Pelajaran</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">UTS</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">UAS</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nilai Akhir</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Guru</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Komentar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {nilai.map((n) => (
                                <tr key={n.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{n.nama_mapel}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{n.nilai_uts ?? '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{n.nilai_uas ?? '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{n.nilai_akhir ?? '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{n.guru_nama}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{n.komentar || '-'}</td>
                                </tr>
                            ))}
                            {nilai.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Belum ada nilai</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentGrades;
