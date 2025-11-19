import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { adminAPI } from '../../services/api';
import { AlertCircle, Loader, Search } from 'lucide-react';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdVisibilityOff, MdRefresh } from 'react-icons/md';

const AdminUsers = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        nama_lengkap: '',
        role: 'siswa',
        nisn: '',
        nip: '',
    });

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, filterRole]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getAllUsers();
            setUsers(response.data || []);
        } catch (err) {
            setError('Gagal mengambil data pengguna');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by role
        if (filterRole !== 'all') {
            filtered = filtered.filter(u => u.role === filterRole);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOpenModal = (mode, user = null) => {
        setModalMode(mode);
        if (mode === 'edit' && user) {
            setSelectedUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                nama_lengkap: user.nama_lengkap,
                role: user.role,
                nisn: user.nisn || '',
                nip: user.nip || '',
                password: '',
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                nama_lengkap: '',
                role: 'siswa',
                nisn: '',
                nip: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
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
                await adminAPI.createUser(formData);
                setError(null);
            } else {
                await adminAPI.updateUser(selectedUser.id, formData);
                setError(null);
            }
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data pengguna');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            try {
                await adminAPI.deleteUser(userId);
                fetchUsers();
            } catch (err) {
                setError('Gagal menghapus pengguna');
            }
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: 'bg-red-100 text-red-800',
            guru: 'bg-blue-100 text-blue-800',
            siswa: 'bg-green-100 text-green-800',
        };
        return badges[role] || 'bg-gray-100 text-gray-800';
    };

    const handleResetMBTI = async (user) => {
        if (user.role !== 'siswa') return;
        const confirmed = window.confirm(`Reset hasil MBTI untuk ${user.nama_lengkap}?`);
        if (!confirmed) return;
        try {
            await adminAPI.resetMBTI(user.id);
            alert('Hasil MBTI berhasil direset. Siswa dapat mengulang tes.');
        } catch (err) {
            const message = err?.response?.data?.message || 'Gagal mereset hasil MBTI';
            alert(message);
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            admin: 'Admin',
            guru: 'Guru',
            siswa: 'Siswa',
        };
        return labels[role] || role;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Memuat data pengguna...</p>
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
                        <h1 className="text-4xl font-bold text-gray-900">Manajemen Akun</h1>
                        <p className="text-gray-600 mt-2">Kelola akun guru, siswa, dan admin</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <MdAdd size={20} />
                        Tambah Pengguna
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cari Pengguna
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan nama, email, atau username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role Filter
                            </label>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">Semua Role</option>
                                <option value="guru">Guru</option>
                                <option value="siswa">Siswa</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <p className="text-sm text-gray-600">
                                Menampilkan <strong>{filteredUsers.length}</strong> dari <strong>{users.length}</strong> pengguna
                            </p>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Username</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Peran</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">No ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {currentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.nama_lengkap}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {user.nisn || user.nip || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal('edit', user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <MdEdit size={18} />
                                            </button>
                                            {user.role === 'siswa' && (
                                                <button
                                                    onClick={() => handleResetMBTI(user)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Reset MBTI"
                                                >
                                                    <MdRefresh size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-500">
                            <p>Tidak ada pengguna yang ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow mt-4 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} pengguna
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sebelumnya
                                </button>

                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${currentPage === pageNumber
                                                            ? 'bg-blue-600 text-white'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        } else if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gray-50 border-b p-6 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'add' ? 'Tambah Pengguna' : 'Edit Pengguna'}
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
                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Nama Lengkap */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_lengkap"
                                        value={formData.nama_lengkap}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password {modalMode === 'edit' && '(Kosongkan jika tidak ingin mengubah)'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        required={modalMode === 'add'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Peran
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="guru">Guru</option>
                                        <option value="siswa">Siswa</option>
                                    </select>
                                </div>

                                {/* NISN - Siswa Only */}
                                {formData.role === 'siswa' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            NISN
                                        </label>
                                        <input
                                            type="text"
                                            name="nisn"
                                            value={formData.nisn}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                )}

                                {/* NIP - Guru Only */}
                                {formData.role === 'guru' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            NIP
                                        </label>
                                        <input
                                            type="text"
                                            name="nip"
                                            value={formData.nip}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                )}

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

export default AdminUsers;
