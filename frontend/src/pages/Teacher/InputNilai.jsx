import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guruAPI } from '../../services/api';
import TeacherSidebar from '../../components/Teacher/TeacherSidebar';
import { Loader, AlertCircle, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { MdPerson, MdBook } from 'react-icons/md';

const InputNilai = () => {
    const { kelasId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [siswa, setSiswa] = useState([]);
    const [mapel, setMapel] = useState([]);
    const [selectedSiswa, setSelectedSiswa] = useState(null);
    const [selectedMapel, setSelectedMapel] = useState('');
    const [nilaiData, setNilaiData] = useState({
        nilaiUts: '',
        nilaiUas: '',
        komentar: '',
        apresiasi: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [kelasInfo, setKelasInfo] = useState(null);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchData();
    }, [kelasId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [siswaRes, mapelRes, kelasRes] = await Promise.all([
                guruAPI.getSiswaInKelas(kelasId),
                guruAPI.getMapelForClass(kelasId),
                guruAPI.getKelas()
            ]);
            setSiswa(siswaRes.data);
            setMapel(mapelRes.data);
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
        setNilaiData(prev => ({
            ...prev,
            [field]: value
        }));
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSiswa || !selectedMapel) {
            setError('Pilih siswa dan mata pelajaran terlebih dahulu');
            return;
        }

        if (!nilaiData.nilaiUts && !nilaiData.nilaiUas) {
            setError('Isi minimal satu nilai (UTS atau UAS)');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await guruAPI.inputNilai({
                siswaId: selectedSiswa.id,
                mapelId: selectedMapel,
                kelasId: kelasId,
                tahunAjaranId: kelasInfo.tahun_ajaran_id,
                nilaiUts: nilaiData.nilaiUts ? parseFloat(nilaiData.nilaiUts) : null,
                nilaiUas: nilaiData.nilaiUas ? parseFloat(nilaiData.nilaiUas) : null,
                komentar: nilaiData.komentar,
                apresiasi: nilaiData.apresiasi
            });

            setSuccess('Nilai berhasil disimpan!');

            // Reset form
            setNilaiData({
                nilaiUts: '',
                nilaiUas: '',
                komentar: '',
                apresiasi: ''
            });

            // Auto hide success message
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan nilai');
        } finally {
            setSaving(false);
        }
    };

    const nilaiAkhir = () => {
        const uts = parseFloat(nilaiData.nilaiUts) || 0;
        const uas = parseFloat(nilaiData.nilaiUas) || 0;
        if (nilaiData.nilaiUts && nilaiData.nilaiUas) {
            return ((uts + uas) / 2).toFixed(2);
        } else if (nilaiData.nilaiUts) {
            return uts.toFixed(2);
        } else if (nilaiData.nilaiUas) {
            return uas.toFixed(2);
        }
        return '0.00';
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
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Input Nilai Rapor</h1>
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
                                <MdPerson className="text-blue-600" />
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
                                    className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${selectedSiswa?.id === s.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        }`}
                                >
                                    <p className="font-medium text-gray-900">{s.nama_lengkap}</p>
                                    <p className="text-sm text-gray-600">NISN: {s.nisn}</p>
                                    {s.rata_rata_nilai && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            Rata-rata: {Number(s.rata_rata_nilai).toFixed(2)}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Form */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        {selectedSiswa ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Siswa Info */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-blue-900 mb-1">Siswa Terpilih</h3>
                                    <p className="text-blue-800">{selectedSiswa.nama_lengkap}</p>
                                    <p className="text-sm text-blue-600">NISN: {selectedSiswa.nisn}</p>
                                </div>

                                {/* Mata Pelajaran */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MdBook className="inline mr-2" />
                                        Mata Pelajaran *
                                    </label>
                                    <select
                                        value={selectedMapel}
                                        onChange={(e) => setSelectedMapel(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">-- Pilih Mata Pelajaran --</option>
                                        {mapel.map(m => (
                                            <option key={m.id} value={m.id}>{m.nama_mapel}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Nilai */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nilai UTS (0-100)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={nilaiData.nilaiUts}
                                            onChange={(e) => handleInputChange('nilaiUts', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nilai UAS (0-100)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={nilaiData.nilaiUas}
                                            onChange={(e) => handleInputChange('nilaiUas', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Nilai Akhir Display */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Nilai Akhir (Otomatis)</p>
                                    <p className="text-3xl font-bold text-blue-600">{nilaiAkhir()}</p>
                                </div>

                                {/* Komentar */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Komentar
                                    </label>
                                    <textarea
                                        value={nilaiData.komentar}
                                        onChange={(e) => handleInputChange('komentar', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Berikan saran atau catatan perkembangan..."
                                    />
                                </div>

                                {/* Apresiasi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Apresiasi & Motivasi
                                    </label>
                                    <textarea
                                        value={nilaiData.apresiasi}
                                        onChange={(e) => handleInputChange('apresiasi', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Berikan apresiasi dan motivasi untuk siswa..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Simpan Nilai
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-12">
                                <MdPerson className="mx-auto text-6xl text-gray-400 mb-4" />
                                <p className="text-gray-600">Pilih siswa dari daftar untuk mulai input nilai</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputNilai;
