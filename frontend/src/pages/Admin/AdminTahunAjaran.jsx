import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { adminAPI } from '../../services/api';
import { AlertCircle, Loader } from 'lucide-react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const AdminTahunAjaran = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tahunAjaranList, setTahunAjaranList] = useState([]);
    const [kelasList, setKelasList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('tahun'); // 'tahun' or 'kelas'
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedTahun, setSelectedTahun] = useState(null);
    const [tahunFormData, setTahunFormData] = useState({
        tahun_ajaran: '',
        semester: 1,
        tanggal_mulai: '',
        tanggal_selesai: '',
        is_aktif: false,
    });
    const [kelasFormData, setKelasFormData] = useState({
        nama_kelas: '',
        tingkat: 10,
        wali_kelas_id: '',
        tahun_ajaran_id: '',
    });
    const [gurus, setGurus] = useState([]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch tahun ajaran
            const tahunResponse = await adminAPI.getAllTahunAjaran();
            setTahunAjaranList(tahunResponse.data || []);

            // Fetch kelas
            const kelasResponse = await adminAPI.getAllKelas();
            setKelasList(kelasResponse.data || []);

            // Fetch guru untuk dropdown wali kelas
            const guruResponse = await adminAPI.getAllUsers({ role: 'guru' });
            setGurus(guruResponse.data || []);
        } catch (err) {
            setError('Gagal mengambil data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        if (activeTab === 'tahun') {
            if (mode === 'edit' && item) {
                setSelectedTahun(item);
                setTahunFormData({
                    tahun_ajaran: item.tahun_ajaran,
                    semester: item.semester,
                    tanggal_mulai: item.tanggal_mulai,
                    tanggal_selesai: item.tanggal_selesai,
                    is_aktif: item.is_aktif,
                });
            } else {
                setTahunFormData({
                    tahun_ajaran: '',
                    semester: 1,
                    tanggal_mulai: '',
                    tanggal_selesai: '',
                    is_aktif: false,
                });
            }
        } else {
            if (mode === 'edit' && item) {
                setSelectedTahun(item);
                setKelasFormData({
                    nama_kelas: item.nama_kelas,
                    tingkat: item.tingkat,
                    wali_kelas_id: item.wali_kelas_id || '',
                    tahun_ajaran_id: item.tahun_ajaran_id,
                });
            } else {
                setKelasFormData({
                    nama_kelas: '',
                    tingkat: 10,
                    wali_kelas_id: '',
                    tahun_ajaran_id: '',
                });
            }
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTahun(null);
    };

    const handleTahunFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTahunFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'semester' ? parseInt(value) : value),
        }));
    };

    const handleKelasFormChange = (e) => {
        const { name, value } = e.target;
        setKelasFormData(prev => ({
            ...prev,
            [name]: name === 'tingkat' ? parseInt(value) : value,
        }));
    };

    const handleTahunSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await adminAPI.createTahunAjaran(tahunFormData);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan tahun ajaran');
        }
    };

    const handleKelasSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await adminAPI.createKelas(kelasFormData);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan kelas');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Memuat data...</p>
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
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Manajemen Tahun Ajaran & Kelas</h1>
                        <p className="text-gray-600 mt-2">Kelola data tahun ajaran dan kelas sekolah</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <MdAdd size={20} />
                        Tambah
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('tahun')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'tahun'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        📅 Tahun Ajaran
                    </button>
                    <button
                        onClick={() => setActiveTab('kelas')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'kelas'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        🏫 Kelas
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'tahun' ? (
                    // Tahun Ajaran Section
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Tahun Ajaran
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Semester
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Tanggal Mulai
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Tanggal Selesai
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tahunAjaranList.map((tahun) => (
                                    <tr key={tahun.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {tahun.tahun_ajaran}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            Semester {tahun.semester}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {tahun.tanggal_mulai}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {tahun.tanggal_selesai}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${tahun.is_aktif
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {tahun.is_aktif ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <MdEdit size={18} />
                                                </button>
                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {tahunAjaranList.length === 0 && (
                            <div className="px-6 py-8 text-center text-gray-500">
                                <p>Belum ada tahun ajaran</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Kelas Section
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kelasList.map((kelas) => (
                            <div key={kelas.id} className="bg-white rounded-lg shadow hover:shadow-lg p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{kelas.nama_kelas}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Tingkat: {kelas.tingkat}</p>
                                </div>
                                <div className="mb-4 pb-4 border-b">
                                    <p className="text-sm text-gray-600">Wali Kelas:</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {kelas.wali_kelas_nama || '-'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                        <MdEdit size={18} />
                                        Edit
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                        <MdDelete size={18} />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-gray-50 border-b p-6 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'add'
                                        ? activeTab === 'tahun'
                                            ? 'Tambah Tahun Ajaran'
                                            : 'Tambah Kelas'
                                        : activeTab === 'tahun'
                                            ? 'Edit Tahun Ajaran'
                                            : 'Edit Kelas'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            {activeTab === 'tahun' ? (
                                <form onSubmit={handleTahunSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tahun Ajaran
                                        </label>
                                        <input
                                            type="text"
                                            name="tahun_ajaran"
                                            value={tahunFormData.tahun_ajaran}
                                            onChange={handleTahunFormChange}
                                            placeholder="Contoh: 2024/2025"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Semester
                                        </label>
                                        <select
                                            name="semester"
                                            value={tahunFormData.semester}
                                            onChange={handleTahunFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value={1}>Semester 1</option>
                                            <option value={2}>Semester 2</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            name="tanggal_mulai"
                                            value={tahunFormData.tanggal_mulai}
                                            onChange={handleTahunFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Selesai
                                        </label>
                                        <input
                                            type="date"
                                            name="tanggal_selesai"
                                            value={tahunFormData.tanggal_selesai}
                                            onChange={handleTahunFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_aktif"
                                            name="is_aktif"
                                            checked={tahunFormData.is_aktif}
                                            onChange={handleTahunFormChange}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <label htmlFor="is_aktif" className="text-sm font-medium text-gray-700">
                                            Aktifkan tahun ajaran ini
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleKelasSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Kelas
                                        </label>
                                        <input
                                            type="text"
                                            name="nama_kelas"
                                            value={kelasFormData.nama_kelas}
                                            onChange={handleKelasFormChange}
                                            placeholder="Contoh: X-A"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tingkat
                                        </label>
                                        <select
                                            name="tingkat"
                                            value={kelasFormData.tingkat}
                                            onChange={handleKelasFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value={10}>Kelas X</option>
                                            <option value={11}>Kelas XI</option>
                                            <option value={12}>Kelas XII</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tahun Ajaran
                                        </label>
                                        <select
                                            name="tahun_ajaran_id"
                                            value={kelasFormData.tahun_ajaran_id}
                                            onChange={handleKelasFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Pilih Tahun Ajaran</option>
                                            {tahunAjaranList.map(tahun => (
                                                <option key={tahun.id} value={tahun.id}>
                                                    {tahun.tahun_ajaran} - Semester {tahun.semester}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Wali Kelas
                                        </label>
                                        <select
                                            name="wali_kelas_id"
                                            value={kelasFormData.wali_kelas_id}
                                            onChange={handleKelasFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Pilih Wali Kelas</option>
                                            {gurus.map(guru => (
                                                <option key={guru.id} value={guru.id}>
                                                    {guru.nama_lengkap}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminTahunAjaran;
