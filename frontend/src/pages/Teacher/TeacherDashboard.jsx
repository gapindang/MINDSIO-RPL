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
import { MdPersonAdd } from 'react-icons/md';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [kelas, setKelas] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [classStudents, setClassStudents] = useState([]);
    const [showNilaiModal, setShowNilaiModal] = useState(false);
    const [selectedStudentForNilai, setSelectedStudentForNilai] = useState(null);
    const [mapelList, setMapelList] = useState([]);
    const [nilaiForm, setNilaiForm] = useState({ mapelId: '', nilaiUts: '', nilaiUas: '', komentar: '', apresiasi: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [allSiswa, setAllSiswa] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [searchCandidate, setSearchCandidate] = useState('');

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchKelas();
    }, []);

    useEffect(() => {
        if (selectedKelas) {
            fetchDashboardData(selectedKelas);
        }
        // when opening class selection or loading, also load all siswa for modal
        if (selectedKelas) {
            fetchAllSiswa();
            fetchClassStudents(selectedKelas);
        }
    }, [selectedKelas]);

    const fetchClassStudents = async (kelasId) => {
        try {
            const res = await guruAPI.getSiswaInKelas(kelasId);
            setClassStudents(res.data || []);
        } catch (err) {
            console.error('Gagal memuat siswa kelas', err);
            setClassStudents([]);
        }
    };

    const fetchAllSiswa = async () => {
        try {
            const res = await guruAPI.getAllSiswa();
            setAllSiswa(res.data || []);
            // compute candidates (not already in class)
            const classSiswaRes = await guruAPI.getSiswaInKelas(selectedKelas);
            const classSiswa = classSiswaRes.data || [];
            const classIds = new Set(classSiswa.map(s => s.id));
            const available = (res.data || []).filter(s => !classIds.has(s.id));
            setCandidates(available);
        } catch (err) {
            console.error('Gagal memuat daftar siswa', err);
        }
    };

    const handleAssignStudent = async (siswaId) => {
        try {
            await guruAPI.assignStudentToKelas({ siswaId, kelasId: selectedKelas });
            // refresh lists
            await fetchDashboardData(selectedKelas);
            await fetchAllSiswa();
            alert('Siswa berhasil ditambahkan');
        } catch (err) {
            alert('Gagal menambahkan siswa: ' + (err.response?.data?.message || err.message));
        }
    };

    const openNilaiModal = async (siswa) => {
        try {
            setSelectedStudentForNilai(siswa);
            // load mapel untuk kelas
            const res = await guruAPI.getMapelForClass(selectedKelas);
            setMapelList(res.data || []);
            setNilaiForm({ mapelId: '', nilaiUts: '', nilaiUas: '', komentar: '', apresiasi: '' });
            setShowNilaiModal(true);
        } catch (err) {
            console.error('Gagal memuat mapel', err);
            alert('Gagal memuat daftar mata pelajaran untuk kelas ini');
        }
    };

    const handleNilaiFormChange = (e) => {
        const { name, value } = e.target;
        setNilaiForm(prev => ({ ...prev, [name]: value }));
    };

    const submitNilai = async (e) => {
        e.preventDefault();
        if (!selectedStudentForNilai) return;
        if (!nilaiForm.mapelId) return alert('Pilih mata pelajaran');
        try {
            const payload = {
                siswaId: selectedStudentForNilai.id,
                mapelId: nilaiForm.mapelId,
                kelasId: selectedKelas,
                tahunAjaranId: currentKelas?.tahun_ajaran_id,
                nilaiUts: nilaiForm.nilaiUts ? Number(nilaiForm.nilaiUts) : null,
                nilaiUas: nilaiForm.nilaiUas ? Number(nilaiForm.nilaiUas) : null,
                komentar: nilaiForm.komentar,
                apresiasi: nilaiForm.apresiasi,
            };
            await guruAPI.inputNilai(payload);
            alert('Nilai berhasil disimpan');
            setShowNilaiModal(false);
            // refresh stats and student list
            fetchDashboardData(selectedKelas);
            fetchClassStudents(selectedKelas);
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan nilai: ' + (err.response?.data?.message || err.message));
        }
    };

    const fetchKelas = async () => {
        try {
            setLoading(true);
            // Hanya ambil kelas yang guru ini ajar untuk keperluan input nilai
            const response = await guruAPI.getKelasMengajar();
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
                        onClick={() => setShowAddModal(true)}
                        disabled={!selectedKelas}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-indigo-500 text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tambah</p>
                                <p className="text-lg font-bold text-gray-900">Siswa ke Kelas</p>
                            </div>
                            <MdPersonAdd className="text-4xl text-indigo-500 group-hover:scale-110 transition-transform" />
                        </div>
                    </button>

                    {/* Add Siswa Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-start justify-center p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">Tambah Siswa ke {currentKelas?.nama_kelas}</h3>
                                    <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-gray-900">Tutup</button>
                                </div>
                                <div className="mb-4">
                                    <input value={searchCandidate} onChange={(e) => setSearchCandidate(e.target.value)} placeholder="Cari siswa..." className="w-full px-4 py-2 border rounded" />
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {candidates.filter(s => (s.nama_lengkap || '').toLowerCase().includes(searchCandidate.toLowerCase())).map(s => (
                                        <div key={s.id} className="flex items-center justify-between py-2 border-b">
                                            <div>
                                                <div className="font-medium">{s.nama_lengkap}</div>
                                                <div className="text-sm text-gray-500">{s.nisn || '-'} • {s.username || ''}</div>
                                            </div>
                                            <div>
                                                <button onClick={() => handleAssignStudent(s.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Tambahkan</button>
                                            </div>
                                        </div>
                                    ))}
                                    {candidates.length === 0 && (
                                        <div className="py-6 text-center text-gray-500">Tidak ada siswa tersedia untuk ditambahkan</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
                        {/* Daftar Siswa Kelas */}
                        <div className="bg-white rounded-lg shadow p-6 mt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Siswa - {currentKelas?.nama_kelas}</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-sm font-medium text-gray-700">Nama</th>
                                            <th className="px-4 py-2 text-sm font-medium text-gray-700">NISN</th>
                                            <th className="px-4 py-2 text-sm font-medium text-gray-700">No Urut</th>
                                            <th className="px-4 py-2 text-sm font-medium text-gray-700">Rata-rata</th>
                                            <th className="px-4 py-2 text-sm font-medium text-gray-700">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classStudents.map(s => (
                                            <tr key={s.id} className="border-b">
                                                <td className="px-4 py-3">{s.nama_lengkap}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{s.nisn || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{s.no_urut || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{s.rata_rata_nilai ? Number(s.rata_rata_nilai).toFixed(2) : '-'}</td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => openNilaiModal(s)} className="px-3 py-1 bg-blue-600 text-white rounded mr-2">Tambah / Ubah Nilai</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {classStudents.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Belum ada siswa di kelas ini</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal Input Nilai */}
                        {showNilaiModal && selectedStudentForNilai && (
                            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-start justify-center p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold">Input Nilai - {selectedStudentForNilai.nama_lengkap}</h3>
                                        <button onClick={() => setShowNilaiModal(false)} className="text-gray-600 hover:text-gray-900">Tutup</button>
                                    </div>
                                    <form onSubmit={submitNilai}>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                                            <select name="mapelId" value={nilaiForm.mapelId} onChange={handleNilaiFormChange} className="w-full px-3 py-2 border rounded">
                                                <option value="">Pilih Mapel</option>
                                                {mapelList.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nama_mapel}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai UTS</label>
                                                <input type="number" name="nilaiUts" value={nilaiForm.nilaiUts} onChange={handleNilaiFormChange} className="w-full px-3 py-2 border rounded" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai UAS</label>
                                                <input type="number" name="nilaiUas" value={nilaiForm.nilaiUas} onChange={handleNilaiFormChange} className="w-full px-3 py-2 border rounded" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
                                            <textarea name="komentar" value={nilaiForm.komentar} onChange={handleNilaiFormChange} className="w-full px-3 py-2 border rounded"></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Apresiasi</label>
                                            <textarea name="apresiasi" value={nilaiForm.apresiasi} onChange={handleNilaiFormChange} className="w-full px-3 py-2 border rounded"></textarea>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={() => setShowNilaiModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded">Batal</button>
                                            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">Simpan Nilai</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
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
        </div >
    );
};

export default TeacherDashboard;
