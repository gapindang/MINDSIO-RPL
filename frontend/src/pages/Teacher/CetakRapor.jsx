import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guruAPI } from '../../services/api';
import TeacherSidebar from '../../components/Teacher/TeacherSidebar';
import { Loader, AlertCircle, ArrowLeft, Download, FileText, CheckCircle } from 'lucide-react';
import { MdPictureAsPdf, MdTableChart } from 'react-icons/md';

const CetakRapor = () => {
    const { kelasId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const [siswa, setSiswa] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [kelasInfo, setKelasInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const downloadFile = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleExportRapor = async (siswaData, format) => {
        try {
            setExporting(true);
            setError(null);

            const dateStr = new Date().toISOString().slice(0, 10);
            const safeName = siswaData.nama_lengkap.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase();

            let response;
            let filename;

            // Untuk PDF, gunakan endpoint baru yang lebih mudah
            if (format === 'pdf') {
                response = await guruAPI.exportRaporPDFBySiswa(siswaData.id);
                filename = `rapor_${safeName}_${dateStr}.pdf`;
            } else {
                // Untuk format lain, tetap gunakan cara lama dengan rapor ID
                const raporResponse = await guruAPI.getRaporIdBySiswa(
                    siswaData.id,
                    kelasInfo.tahun_ajaran_id
                );

                const raporId = raporResponse.data.raporId;

                switch (format) {
                    case 'csv':
                        response = await guruAPI.exportRaporCSV(raporId);
                        filename = `rapor_${safeName}_${dateStr}.csv`;
                        break;
                    case 'json':
                        response = await guruAPI.exportRaporJSON(raporId);
                        filename = `rapor_${safeName}_${dateStr}.json`;
                        break;
                    case 'excel':
                        response = await guruAPI.exportRaporExcel(raporId);
                        filename = `rapor_${safeName}_${dateStr}.xlsx`;
                        break;
                    default:
                        throw new Error('Format tidak dikenali');
                }
            }

            downloadFile(response.data, filename);
            setSuccess(`Rapor ${siswaData.nama_lengkap} berhasil diunduh!`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`Rapor untuk ${siswaData.nama_lengkap} belum dibuat. Silakan input nilai dan buat rapor terlebih dahulu.`);
            } else {
                setError(`Gagal mengekspor rapor: ${err.response?.data?.message || err.message}`);
            }
        } finally {
            setExporting(false);
        }
    };

    const filteredSiswa = siswa.filter(s =>
        s.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nisn.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-orange-600 animate-spin" />
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
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Cetak Rapor Digital</h1>
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

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-semibold mb-1">Catatan Penting</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-800">
                                <li>Pastikan nilai semua mata pelajaran sudah diinput</li>
                                <li>Komentar dan apresiasi sudah diberikan</li>
                                <li>Rapor dapat diekspor dalam format PDF, Excel, CSV, atau JSON</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <input
                        type="text"
                        placeholder="Cari nama siswa atau NISN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>

                {/* Student List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                            Daftar Siswa ({filteredSiswa.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Siswa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NISN
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rata-rata
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cetak Rapor
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSiswa.map((s, index) => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-600">{index + 1}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{s.nama_lengkap}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-600">{s.nisn}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {s.rata_rata_nilai ? (
                                                <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {Number(s.rata_rata_nilai).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">Belum ada nilai</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleExportRapor(s, 'pdf')}
                                                    disabled={exporting}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    title="Unduh PDF"
                                                >
                                                    <MdPictureAsPdf className="w-4 h-4" />
                                                    PDF
                                                </button>
                                                <button
                                                    onClick={() => handleExportRapor(s, 'excel')}
                                                    disabled={exporting}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    title="Unduh Excel"
                                                >
                                                    <MdTableChart className="w-4 h-4" />
                                                    Excel
                                                </button>
                                                <button
                                                    onClick={() => handleExportRapor(s, 'csv')}
                                                    disabled={exporting}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    title="Unduh CSV"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    CSV
                                                </button>
                                                <button
                                                    onClick={() => handleExportRapor(s, 'json')}
                                                    disabled={exporting}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    title="Unduh JSON"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    JSON
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredSiswa.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
                        <FileText className="mx-auto text-6xl text-gray-400 mb-4" />
                        <p className="text-gray-600">Tidak ada siswa yang sesuai dengan pencarian</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CetakRapor;
