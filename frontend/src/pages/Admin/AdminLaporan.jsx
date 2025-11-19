import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { adminAPI } from '../../services/api';
import { AlertCircle, Loader, Search } from 'lucide-react';
import { MdDownload } from 'react-icons/md';

const AdminLaporan = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rapors, setRapors] = useState([]);
    const [filteredRapors, setFilteredRapors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchRaporData();
    }, []);

    useEffect(() => {
        filterRapors();
    }, [rapors, searchTerm]);

    const fetchRaporData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getAllRapor();
            setRapors(response.data || []);
        } catch (err) {
            setError('Gagal mengambil data laporan');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterRapors = () => {
        let filtered = rapors;

        if (searchTerm) {
            filtered = filtered.filter(rapor =>
                rapor.siswa_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rapor.siswa_nisn?.includes(searchTerm)
            );
        }

        setFilteredRapors(filtered);
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

    const handleExportAll = async (format) => {
        try {
            setExporting(true);
            let response;
            let filename;
            const dateStr = new Date().toISOString().slice(0, 10);

            switch (format) {
                case 'csv':
                    response = await adminAPI.exportAllRaporCSV();
                    filename = `rapor_all_${dateStr}.csv`;
                    break;
                case 'json':
                    response = await adminAPI.exportAllRaporJSON();
                    filename = `rapor_all_${dateStr}.json`;
                    break;
                case 'pdf':
                    response = await adminAPI.exportAllRaporPDF();
                    filename = `rapor_all_${dateStr}.pdf`;
                    break;
                case 'excel':
                    response = await adminAPI.exportAllRaporExcel();
                    filename = `rapor_all_${dateStr}.xlsx`;
                    break;
                case 'detail-csv':
                    response = await adminAPI.exportRaporDetailCSV();
                    filename = `rapor_detail_${dateStr}.csv`;
                    break;
                case 'detail-excel':
                    response = await adminAPI.exportRaporDetailExcel();
                    filename = `rapor_detail_${dateStr}.xlsx`;
                    break;
                default:
                    throw new Error('Format tidak dikenali');
            }

            downloadFile(response.data, filename);
        } catch (err) {
            setError(`Gagal mengekspor ke ${format.toUpperCase()}`);
            console.error(err);
        } finally {
            setExporting(false);
        }
    };

    const handleExportSingle = async (rapor, format) => {
        try {
            setExporting(true);
            let response;
            const dateStr = new Date().toISOString().slice(0, 10);
            const safeName = (rapor.siswa_nama || 'siswa').replace(/[^a-z0-9-_]+/gi, '_').toLowerCase();

            switch (format) {
                case 'csv':
                    response = await adminAPI.exportRaporCSV(rapor.id);
                    downloadFile(response.data, `rapor_${safeName}_${dateStr}.csv`);
                    break;
                case 'json':
                    response = await adminAPI.exportRaporJSON(rapor.id);
                    downloadFile(response.data, `rapor_${safeName}_${dateStr}.json`);
                    break;
                case 'pdf':
                    response = await adminAPI.exportRaporPDF(rapor.id);
                    downloadFile(response.data, `rapor_${safeName}_${dateStr}.pdf`);
                    break;
                case 'excel':
                    response = await adminAPI.exportRaporExcel(rapor.id);
                    downloadFile(response.data, `rapor_${safeName}_${dateStr}.xlsx`);
                    break;
                default:
                    throw new Error('Format tidak dikenali');
            }
        } catch (err) {
            setError(`Gagal mengekspor rapor ke ${format.toUpperCase()}`);
            console.error(err);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Memuat data laporan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-16">
            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8 transition-all duration-300">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Laporan Rapor</h1>
                    <p className="text-gray-600 mt-2">Lihat dan ekspor data rapor siswa</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Export Actions */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Export Data</h2>

                    {/* Export Ringkas */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">📄 Export Ringkas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleExportAll('csv')}
                                disabled={exporting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                            >
                                <MdDownload size={20} />
                                {exporting ? 'Mengekspor...' : 'Ekspor CSV'}
                            </button>
                            <button
                                onClick={() => handleExportAll('excel')}
                                disabled={exporting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
                            >
                                <MdDownload size={20} />
                                {exporting ? 'Mengekspor...' : 'Ekspor Excel'}
                            </button>
                            <button
                                onClick={() => handleExportAll('pdf')}
                                disabled={exporting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium"
                            >
                                <MdDownload size={20} />
                                {exporting ? 'Mengekspor...' : 'Ekspor PDF'}
                            </button>
                        </div>
                    </div>

                    {/* Export Detail */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Export Detail (Per Mapel)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleExportAll('json')}
                                disabled={exporting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors font-medium"
                            >
                                <MdDownload size={20} />
                                {exporting ? 'Mengekspor...' : 'Ekspor JSON'}
                            </button>
                            <button
                                onClick={() => handleExportAll('detail-csv')}
                                disabled={exporting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
                            >
                                <MdDownload size={20} />
                                {exporting ? 'Mengekspor...' : 'Detail CSV'}
                            </button>
                            <button
                                onClick={() => handleExportAll('detail-excel')}
                                disabled={exporting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium"
                            >
                                <MdDownload size={20} />
                                {exporting ? 'Mengekspor...' : 'Detail Excel'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari rapor berdasarkan nama siswa atau NISN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Rapor List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRapors.length > 0 ? (
                        filteredRapors.map((rapor) => (
                            <div key={rapor.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                                <div className="mb-4 pb-4 border-b">
                                    <h3 className="text-lg font-bold text-gray-900">{rapor.siswa_nama}</h3>
                                    <p className="text-sm text-gray-600 mt-1">NISN: {rapor.siswa_nisn}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Kelas:</span>
                                        <span className="font-medium text-gray-900">{rapor.kelas_nama || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Tahun Ajaran:</span>
                                        <span className="font-medium text-gray-900">{rapor.tahun_ajaran || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Rata-rata Nilai:</span>
                                        <span className="text-xl font-bold text-blue-600">{rapor.rata_rata_nilai || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Status:</span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${rapor.rata_rata_nilai >= 60
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {rapor.rata_rata_nilai >= 60 ? 'Lulus' : 'Belum Lulus'}
                                        </span>
                                    </div>
                                </div>

                                {rapor.komentar_wali_kelas && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs font-medium text-blue-900">Komentar Wali Kelas:</p>
                                        <p className="text-sm text-blue-800 mt-1">{rapor.komentar_wali_kelas}</p>
                                    </div>
                                )}

                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleExportSingle(rapor, 'csv')}
                                        disabled={exporting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:bg-gray-100 transition-colors text-sm font-medium"
                                    >
                                        <MdDownload size={18} />
                                        CSV
                                    </button>
                                    <button
                                        onClick={() => handleExportSingle(rapor, 'json')}
                                        disabled={exporting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:bg-gray-100 transition-colors text-sm font-medium"
                                    >
                                        <MdDownload size={18} />
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => handleExportSingle(rapor, 'excel')}
                                        disabled={exporting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 disabled:bg-gray-100 transition-colors text-sm font-medium"
                                    >
                                        <MdDownload size={18} />
                                        Excel
                                    </button>
                                    <button
                                        onClick={() => handleExportSingle(rapor, 'pdf')}
                                        disabled={exporting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:bg-gray-100 transition-colors text-sm font-medium"
                                    >
                                        <MdDownload size={18} />
                                        PDF
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                            <p className="text-gray-500 mb-4">Tidak ada laporan rapor ditemukan</p>
                            <p className="text-sm text-gray-400">Mulai dengan mencari siswa atau ekspor semua data</p>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                {rapors.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-600 text-sm">Total Siswa</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{rapors.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-600 text-sm">Siswa Lulus</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {rapors.filter(r => r.rata_rata_nilai >= 60).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-600 text-sm">Siswa Belum Lulus</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">
                                {rapors.filter(r => r.rata_rata_nilai < 60).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-600 text-sm">Rata-rata Kelas</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {(rapors.reduce((sum, r) => sum + (r.rata_rata_nilai || 0), 0) / rapors.length).toFixed(1)}
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminLaporan;
