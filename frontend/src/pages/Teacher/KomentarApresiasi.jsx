import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guruAPI } from '../../services/api';
import TeacherSidebar from '../../components/Teacher/TeacherSidebar';
import { Loader, AlertCircle, Save, ArrowLeft, CheckCircle, MessageSquare } from 'lucide-react';
import { MdPerson } from 'react-icons/md';

const KomentarApresiasi = () => {
    const { kelasId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const [siswa, setSiswa] = useState([]);
    const [selectedSiswa, setSelectedSiswa] = useState(null);
    const [formData, setFormData] = useState({
        komentar: '',
        apresiasi: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [kelasInfo, setKelasInfo] = useState(null);

    useEffect(() => {
        fetchData();
    }, [kelasId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [siswaRes, kelasRes] = await Promise.all([
                guruAPI.getSiswaInKelas(kelasId),
                guruAPI.getKelas()
            ]);
            setSiswa(siswaRes.data);
            const currentKelas = kelasRes.data.find(k => k.id === kelasId);
            setKelasInfo(currentKelas);
        } catch (err) {
            setError('Gagal memuat data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSiswa) {
            setError('Pilih siswa terlebih dahulu');
            return;
        }

        if (!formData.komentar && !formData.apresiasi) {
            setError('Isi minimal satu field (komentar atau apresiasi)');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await guruAPI.createRapor({
                siswaId: selectedSiswa.id,
                kelasId: kelasId,
                tahunAjaranId: kelasInfo.tahun_ajaran_id,
                komentar: formData.komentar,
                apresiasi: formData.apresiasi
            });

            setSuccess('Komentar dan apresiasi berhasil disimpan!');

            // Reset form
            setFormData({
                komentar: '',
                apresiasi: ''
            });

            // Auto hide success message
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
            <TeacherSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} kelasId={kelasId} />

            {/* Main Content */}
            <div className="md:ml-64 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/teacher/dashboard')}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Komentar & Apresiasi</h1>
                    <p className="text-gray-600 mt-2">
                        {kelasInfo?.nama_kelas} - {kelasInfo?.tahun_ajaran}
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Siswa List */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <MdPerson className="text-green-600" />
                                Daftar Siswa ({siswa.length})
                            </h2>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                            {siswa.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setSelectedSiswa(s);
                                        setError(null);
                                    }}
                                    className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${selectedSiswa?.id === s.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                                        }`}
                                >
                                    <p className="font-medium text-gray-900">{s.nama_lengkap}</p>
                                    <p className="text-sm text-gray-600">NISN: {s.nisn}</p>
                                    {s.rata_rata_nilai && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Rata-rata: {Number(s.rata_rata_nilai).toFixed(2)}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        {selectedSiswa ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Siswa Info */}
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-green-900 mb-1">Siswa Terpilih</h3>
                                    <p className="text-green-800 font-medium">{selectedSiswa.nama_lengkap}</p>
                                    <p className="text-sm text-green-600">NISN: {selectedSiswa.nisn}</p>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-900">
                                            <p className="font-semibold mb-1">Tips Memberikan Feedback</p>
                                            <ul className="list-disc list-inside space-y-1 text-blue-800">
                                                <li>Berikan komentar yang konstruktif dan spesifik</li>
                                                <li>Apresiasi pencapaian dan usaha siswa</li>
                                                <li>Berikan motivasi untuk terus berkembang</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Komentar */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Komentar Wali Kelas
                                    </label>
                                    <textarea
                                        value={formData.komentar}
                                        onChange={(e) => handleInputChange('komentar', e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Contoh: Siswa menunjukkan perkembangan yang baik dalam memahami materi. Perlu lebih aktif dalam diskusi kelas..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Berikan saran dan catatan perkembangan siswa
                                    </p>
                                </div>

                                {/* Apresiasi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Apresiasi & Motivasi
                                    </label>
                                    <textarea
                                        value={formData.apresiasi}
                                        onChange={(e) => handleInputChange('apresiasi', e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Contoh: Terus pertahankan semangat belajarmu! Kemampuan analisis yang baik, tingkatkan lagi partisipasi di kelas..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Berikan apresiasi positif dan motivasi untuk siswa
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Simpan Komentar & Apresiasi
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare className="mx-auto text-6xl text-gray-400 mb-4" />
                                <p className="text-gray-600">Pilih siswa dari daftar untuk memberikan komentar dan apresiasi</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KomentarApresiasi;
