import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Award, BookOpen } from 'lucide-react';
import StudentSidebar from '../components/Student/StudentSidebar';
import { siswaAPI } from '../services/api';

const StudentRapor = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const [loading, setLoading] = useState(true);
    const [raporList, setRaporList] = useState([]);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchRaporData();
    }, []);

    const fetchRaporData = async () => {
        try {
            setLoading(true);
            const { data } = await siswaAPI.getRaporSummary();
            setRaporList(data || []);
        } catch (error) {
            console.error('Error fetching rapor:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (raporId, tahunAjaran) => {
        try {
            setDownloading(raporId);
            const response = await siswaAPI.downloadRaporPDF();

            // Create blob from response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rapor_${tahunAjaran.replace('/', '-')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Gagal mengunduh rapor. Silakan coba lagi.');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="md:ml-64 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-gray-600">Memuat data rapor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-16">
            <StudentSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="md:ml-64 p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Rapor Saya</h1>
                    <p className="text-gray-600">Lihat dan unduh rapor Anda</p>
                </div>

                {raporList.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Rapor</h3>
                        <p className="text-gray-600">Rapor Anda akan muncul di sini setelah guru wali kelas membuat rapor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {raporList.map((rapor) => (
                            <div key={rapor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center text-blue-600 mb-2">
                                                <Calendar className="h-5 w-5 mr-2" />
                                                <span className="font-semibold">{rapor.tahun_ajaran}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                <span>{rapor.nama_kelas}</span>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${rapor.rata_rata_nilai >= 85 ? 'bg-green-100 text-green-800' :
                                                rapor.rata_rata_nilai >= 75 ? 'bg-blue-100 text-blue-800' :
                                                    rapor.rata_rata_nilai >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {rapor.rata_rata_nilai >= 85 ? 'Sangat Baik' :
                                                rapor.rata_rata_nilai >= 75 ? 'Baik' :
                                                    rapor.rata_rata_nilai >= 60 ? 'Cukup' : 'Kurang'}
                                        </div>
                                    </div>

                                    {/* Rata-rata Nilai */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium mb-1">Rata-rata Nilai</p>
                                                <p className="text-3xl font-bold text-blue-900">
                                                    {rapor.rata_rata_nilai ? Number(rapor.rata_rata_nilai).toFixed(1) : '-'}
                                                </p>
                                            </div>
                                            <Award className="h-12 w-12 text-blue-600 opacity-50" />
                                        </div>
                                    </div>

                                    {/* Komentar Wali Kelas */}
                                    {rapor.komentar_wali_kelas && (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Komentar Wali Kelas</p>
                                            <p className="text-sm text-gray-700 line-clamp-2">{rapor.komentar_wali_kelas}</p>
                                        </div>
                                    )}

                                    {/* Tanggal */}
                                    <div className="text-xs text-gray-500 mb-4">
                                        Dibuat: {new Date(rapor.tanggal_dibuat).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>

                                    {/* Download Button */}
                                    <button
                                        onClick={() => handleDownloadPDF(rapor.id, rapor.tahun_ajaran)}
                                        disabled={downloading === rapor.id}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        {downloading === rapor.id ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Mengunduh...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-5 w-5 mr-2" />
                                                Download PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentRapor;
