import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { adminAPI } from '../../services/api';
import { AlertCircle, Loader } from 'lucide-react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const AdminMataPelajaran = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mapelList, setMapelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedMapel, setSelectedMapel] = useState(null);
    const [formData, setFormData] = useState({
        nama_mapel: '',
        kode_mapel: '',
        guru_id: '',
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

            // Fetch mata pelajaran
            const mapelResponse = await adminAPI.getAllMapel();
            setMapelList(mapelResponse.data || []);

            // Fetch guru untuk dropdown
            const guruResponse = await adminAPI.getAllUsers({ role: 'guru' });
            setGurus(guruResponse.data || []);
        } catch (err) {
            setError('Gagal mengambil data mata pelajaran');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, mapel = null) => {
        setModalMode(mode);
        if (mode === 'edit' && mapel) {
            setSelectedMapel(mapel);
            setFormData({
                nama_mapel: mapel.nama_mapel,
                kode_mapel: mapel.kode_mapel,
                guru_id: mapel.guru_id || '',
            });
        } else {
            setFormData({
                nama_mapel: '',
                kode_mapel: '',
                guru_id: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedMapel(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await adminAPI.createMapel(formData);
            } else {
                // Update endpoint akan ditambahkan ke adminAPI jika belum ada
                setError('Fitur edit belum tersedia');
                return;
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan mata pelajaran');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Memuat data mata pelajaran...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8">
                {/* Header */}
                <div className="mb-8 mt-12 md:mt-0 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Manajemen Mata Pelajaran</h1>
                        <p className="text-gray-600 mt-2">Kelola daftar mata pelajaran yang digunakan</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <MdAdd size={20} />
                        Tambah Mata Pelajaran
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Mata Pelajaran Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mapelList.map((mapel) => (
                        <div
                            key={mapel.id}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                        >
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900">{mapel.nama_mapel}</h3>
                                <p className="text-sm text-gray-600 mt-1">Kode: <strong>{mapel.kode_mapel}</strong></p>
                            </div>

                            {mapel.guru_nama && (
                                <div className="mb-4 pb-4 border-b">
                                    <p className="text-sm text-gray-600">Guru Utama:</p>
                                    <p className="text-sm font-medium text-gray-900">{mapel.guru_nama}</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal('edit', mapel)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <MdEdit size={18} />
                                    Edit
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <MdDelete size={18} />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {mapelList.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500 mb-4">Belum ada mata pelajaran</p>
                        <button
                            onClick={() => handleOpenModal('add')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Tambah Mata Pelajaran Pertama
                        </button>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            {/* Modal Header */}
                            <div className="bg-gray-50 border-b p-6 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'add' ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Nama Mata Pelajaran */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Mata Pelajaran
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_mapel"
                                        value={formData.nama_mapel}
                                        onChange={handleFormChange}
                                        placeholder="Contoh: Matematika"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Kode Mata Pelajaran */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kode Mata Pelajaran
                                    </label>
                                    <input
                                        type="text"
                                        name="kode_mapel"
                                        value={formData.kode_mapel}
                                        onChange={handleFormChange}
                                        placeholder="Contoh: MAT"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Guru Utama */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Guru Utama (Opsional)
                                    </label>
                                    <select
                                        name="guru_id"
                                        value={formData.guru_id}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Pilih Guru</option>
                                        {gurus.map(guru => (
                                            <option key={guru.id} value={guru.id}>
                                                {guru.nama_lengkap}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {modalMode === 'add' ? 'Tambah' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminMataPelajaran;
