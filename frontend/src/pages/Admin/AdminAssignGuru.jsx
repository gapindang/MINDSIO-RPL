import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { adminAPI } from '../../services/api';

const AdminAssignGuru = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [kelasList, setKelasList] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState('');
    const [selectedMapel, setSelectedMapel] = useState('');
    const [mapelList, setMapelList] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedKelas) fetchAssignments(selectedKelas);
    }, [selectedKelas]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [kRes, mRes] = await Promise.all([
                adminAPI.getAllKelas(),
                adminAPI.getAllMapel(),
            ]);
            setKelasList(kRes.data || []);
            setMapelList(mRes.data || []);
            if (kRes.data && kRes.data.length > 0) setSelectedKelas(kRes.data[0].id);
        } catch (err) {
            console.error(err);
            setError('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (kelasId) => {
        try {
            const res = await adminAPI.getGuruMapelByKelas(kelasId);
            setAssignments(res.data || []);
        } catch (err) {
            console.error(err);
            setAssignments([]);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedKelas || !selectedMapel) return alert('Pilih kelas dan mata pelajaran');
        try {
            const kelas = kelasList.find(k => k.id === selectedKelas);
            const tahunAjaranId = kelas?.tahun_ajaran_id;
            await adminAPI.assignGuruMapel({ mapelId: selectedMapel, kelasId: selectedKelas, tahunAjaranId });
            alert('Berhasil menugaskan guru');
            fetchAssignments(selectedKelas);
        } catch (err) {
            alert('Gagal menugaskan guru: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUnassign = async (id) => {
        if (!window.confirm('Yakin ingin menghapus penugasan ini?')) return;
        try {
            await adminAPI.unassignGuruMapel(id);
            fetchAssignments(selectedKelas);
        } catch (err) {
            alert('Gagal menghapus penugasan');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-16">
            <AdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className="md:ml-64 p-6">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Manajemen Penugasan Guru - Mapel</h1>
                        <p className="text-gray-600">Buat dan hapus penugasan guru untuk mapel pada kelas tertentu</p>
                    </div>
                </div>

                {loading ? (
                    <div>Memuat...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded shadow">
                            <h3 className="font-semibold mb-3">Buat Penugasan</h3>
                            <form onSubmit={handleAssign} className="space-y-3">
                                <div>
                                    <label className="block text-sm">Kelas</label>
                                    <select className="w-full border px-3 py-2 rounded" value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
                                        <option value="">Pilih Kelas</option>
                                        {kelasList.map(k => (
                                            <option key={k.id} value={k.id}>{k.nama_kelas} - {k.tahun_ajaran}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm">Mata Pelajaran</label>
                                    <select className="w-full border px-3 py-2 rounded" value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)}>
                                        <option value="">Pilih Mapel</option>
                                        {mapelList.map(m => (
                                            <option key={m.id} value={m.id}>{m.nama_mapel}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Guru akan mengikuti mata pelajaran yang dipilih (otomatis dari data mapel)</p>
                                </div>
                                <div className="pt-2">
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Assign</button>
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-2 bg-white p-4 rounded shadow">
                            <h3 className="font-semibold mb-3">Penugasan di Kelas</h3>
                            <div className="mb-4">
                                <label className="block text-sm">Pilih Kelas</label>
                                <select className="w-64 border px-3 py-2 rounded" value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
                                    <option value="">Pilih Kelas</option>
                                    {kelasList.map(k => (
                                        <option key={k.id} value={k.id}>{k.nama_kelas} - {k.tahun_ajaran}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-sm">Mata Pelajaran</th>
                                            <th className="px-3 py-2 text-sm">Guru</th>
                                            <th className="px-3 py-2 text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments.map(a => (
                                            <tr key={a.id} className="border-b">
                                                <td className="px-3 py-2">{a.nama_mapel}</td>
                                                <td className="px-3 py-2">{a.guru_nama}</td>
                                                <td className="px-3 py-2">
                                                    <button onClick={() => handleUnassign(a.id)} className="px-3 py-1 bg-red-500 text-white rounded">Hapus</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {assignments.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-3 py-6 text-center text-gray-500">Belum ada penugasan</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminAssignGuru;
