import React, { useEffect, useMemo, useState } from 'react';
import { Users, FileCheck, TrendingUp, FileText, Download } from 'lucide-react';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { guruAPI } from '../services/api';
import { MdDownload } from 'react-icons/md';

const TeacherDashboard = () => {
    const [kelasList, setKelasList] = useState([]);
    const [kelasId, setKelasId] = useState('');
    const [tahunAjaranId, setTahunAjaranId] = useState('');
    const [siswaList, setSiswaList] = useState([]);
    const [mapelList, setMapelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nilaiForm, setNilaiForm] = useState({ siswaId: '', mapelId: '', nilaiUts: '', nilaiUas: '', komentar: '', apresiasi: '' });
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const { data } = await guruAPI.getKelasTeaching();
                setKelasList(data || []);
                if (data && data.length) {
                    setKelasId(data[0].id);
                    setTahunAjaranId(data[0].tahun_ajaran_id);
                }
            } catch (e) {
                setError('Gagal memuat daftar kelas');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const loadKelasData = async () => {
            if (!kelasId) return;
            try {
                setLoading(true);
                const [siswaRes, mapelRes, dashRes] = await Promise.all([
                    guruAPI.getSiswaInKelas(kelasId),
                    guruAPI.getMapelForClass(kelasId),
                    guruAPI.getDashboardKelas(kelasId),
                ]);
                setSiswaList(siswaRes.data || []);
                setMapelList(mapelRes.data || []);
                setDashboard(dashRes.data || null);
                setError(null);
            } catch (e) {
                setError('Gagal memuat data kelas');
            } finally {
                setLoading(false);
            }
        };
        loadKelasData();
    }, [kelasId]);

    const stats = useMemo(() => ([
        { title: 'Total Siswa', value: dashboard?.statistik?.jumlah_siswa || 0, subtitle: 'Di kelas terpilih', icon: Users, color: 'blue' },
        { title: 'Tes MBTI Selesai', value: dashboard?.statistik?.mbti_selesai || 0, subtitle: 'Selesai MBTI', icon: FileCheck, color: 'purple' },
        { title: 'Rata-rata Kelas', value: (dashboard?.statistik?.rata_rata_kelas || 0).toFixed(1), subtitle: 'Rata-rata nilai akhir', icon: TrendingUp, color: 'green' },
        { title: 'Rapor Tersedia', value: siswaList.length, subtitle: 'Siswa dalam kelas', icon: FileText, color: 'yellow' },
    ]), [dashboard, siswaList.length]);

    const classPerformance = useMemo(() => (dashboard?.performa_mapel || []).map(p => ({ name: p.nama_mapel, value: Math.round(p.rata_rata || 0) })), [dashboard]);

    const handleUploadGrade = async () => {
        const { siswaId, mapelId, nilaiUts, nilaiUas, komentar, apresiasi } = nilaiForm;
        if (!siswaId || !mapelId || !kelasId || !tahunAjaranId) return alert('Lengkapi data nilai terlebih dahulu');
        try {
            await guruAPI.inputNilai({ siswaId, mapelId, kelasId, tahunAjaranId, nilaiUts: Number(nilaiUts), nilaiUas: Number(nilaiUas), komentar, apresiasi });
            alert('Nilai tersimpan');
            setNilaiForm({ siswaId: '', mapelId: '', nilaiUts: '', nilaiUas: '', komentar: '', apresiasi: '' });
        } catch (e) {
            alert(e?.response?.data?.message || 'Gagal menyimpan nilai');
        }
    };

    const handleCetakRapor = async (siswa) => {
        try {
            // Pastikan rapor dibuat/diupdate
            await guruAPI.createRapor({ siswaId: siswa.id, kelasId, tahunAjaranId, komentar: '', apresiasi: '' });
            // Ambil raporId
            const { data } = await guruAPI.getRaporIdBySiswa(siswa.id, tahunAjaranId);
            const raporId = data.raporId;
            // Download PDF
            const pdf = await guruAPI.exportRaporPDF(raporId);
            const blob = pdf.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rapor_${(siswa.nama_lengkap || 'siswa').replace(/[^a-z0-9-_]+/gi, '_').toLowerCase()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert(e?.response?.data?.message || 'Gagal mencetak rapor');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dasbor Guru</h1>
                    <p className="text-gray-600 mt-1">Kelola kelas, input nilai, dan cetak rapor</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Select Kelas */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Kelas</h2>
                        <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                            {kelasList.map(k => (
                                <option key={k.id} value={k.id}>{k.nama_kelas} • {k.tahun_ajaran}</option>
                            ))}
                        </select>
                    </div>
                    {/* Upload Student Grades */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Unggah Nilai Siswa</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pilih Siswa
                                </label>
                                <select value={nilaiForm.siswaId} onChange={(e) => setNilaiForm({ ...nilaiForm, siswaId: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                                    <option value="">Pilih siswa</option>
                                    {siswaList.map(s => (
                                        <option key={s.id} value={s.id}>{s.nama_lengkap} ({s.nisn})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mata Pelajaran
                                </label>
                                <select value={nilaiForm.mapelId} onChange={(e) => setNilaiForm({ ...nilaiForm, mapelId: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                                    <option value="">Pilih mapel</option>
                                    {mapelList.map(m => (
                                        <option key={m.id} value={m.id}>{m.nama_mapel}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nilai (%)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" value={nilaiForm.nilaiUts} onChange={(e) => setNilaiForm({ ...nilaiForm, nilaiUts: e.target.value })} placeholder="UTS" className="w-full px-3 py-2 border rounded-md" />
                                    <input type="number" value={nilaiForm.nilaiUas} onChange={(e) => setNilaiForm({ ...nilaiForm, nilaiUas: e.target.value })} placeholder="UAS" className="w-full px-3 py-2 border rounded-md" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Komentar (opsional)</label>
                                <textarea value={nilaiForm.komentar} onChange={(e) => setNilaiForm({ ...nilaiForm, komentar: e.target.value })} className="w-full px-3 py-2 border rounded-md" rows={2} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apresiasi (opsional)</label>
                                <textarea value={nilaiForm.apresiasi} onChange={(e) => setNilaiForm({ ...nilaiForm, apresiasi: e.target.value })} className="w-full px-3 py-2 border rounded-md" rows={2} />
                            </div>

                            <button
                                onClick={handleUploadGrade}
                                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                            >
                                Simpan Nilai
                            </button>
                        </div>
                    </div>

                    {/* Class Performance Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performa Kelas</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={classPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Student Overview Table */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Daftar Siswa</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {siswaList.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.nama_lengkap}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.nisn}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{Math.round(s.rata_rata_nilai || 0)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button onClick={() => handleCetakRapor(s)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                                                <MdDownload size={16} /> Cetak Rapor (PDF)
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
