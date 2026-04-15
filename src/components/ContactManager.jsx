import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, FileUp, Search, Edit, X, CheckCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axios';

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });

    // State untuk Modal Form (Create / Update)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
    const [formData, setFormData] = useState({ id: null, name: '', phone: '', category: 'Siswa' });

    // Ambil Data Kontak
    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/contacts/list');
            setContacts(res.data.data || []);
        } catch (error) {
            console.error("Gagal mengambil kontak:", error);
            showAlert('error', 'Gagal memuat daftar kontak.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const showAlert = (type, text) => {
        setAlert({ show: true, type, text });
        setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
    };

    // --- FUNGSI CRUD ---

    const openModal = (mode, contact = null) => {
        setModalMode(mode);
        if (contact) {
            setFormData({ id: contact.id, name: contact.name, phone: contact.phone, category: contact.category });
        } else {
            setFormData({ id: null, name: '', phone: '', category: 'Siswa' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ id: null, name: '', phone: '', category: 'Siswa' });
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (modalMode === 'add') {
                await axiosInstance.post('/contacts/create', formData);
                showAlert('success', 'Kontak berhasil ditambahkan.');
            } else {
                await axiosInstance.put('/contacts/update', formData);
                showAlert('success', 'Kontak berhasil diperbarui.');
            }
            closeModal();
            fetchContacts();
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Gagal menyimpan kontak.');
        } finally {
            setLoading(false);
        }
    };

    const deleteContact = async (id, name) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus kontak ${name}?`)) return;
        
        try {
            // Mengirim ID melalui query params (?id=...) sesuai standar endpoint /delete
            await axiosInstance.delete(`/contacts/delete/${id}`);
            showAlert('success', `Kontak ${name} berhasil dihapus.`);
            fetchContacts();
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Gagal menghapus kontak.');
        }
    };

    // --- FUNGSI IMPOR CSV ---

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const confirmImport = window.confirm(`Impor kontak dari file ${file.name}? Pastikan format kolom: nama, phone, category`);
        if (!confirmImport) {
            e.target.value = null; // Reset input file
            return;
        }

        const importData = new FormData();
        importData.append('file', file);

        setLoading(true);
        try {
            const res = await axiosInstance.post('/contacts/import', importData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showAlert('success', res.data.message || 'Ribuan kontak berhasil diimpor!');
            fetchContacts();
        } catch (error) {
            showAlert('error', 'Gagal impor: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
            e.target.value = null; // Reset input agar bisa pilih file yang sama lagi
        }
    };

    // --- FILTER PENCARIAN ---
    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-6 flex items-center">
                    <Users className="mr-2 text-blue-500 w-6 h-6" /> Manajemen Kontak & Siswa
                </h2>

                {/* Notifikasi Alert */}
                {alert.show && (
                    <div className={`p-4 rounded-lg mb-6 flex items-start ${alert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {alert.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 mt-0.5" /> : <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />}
                        <p>{alert.text}</p>
                    </div>
                )}

                {/* Toolbar: Search & Buttons */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Cari nama atau nomor HP..." 
                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => openModal('add')}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <UserPlus className="w-4 h-4 mr-2" /> Tambah Manual
                        </button>
                        <label className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
                            <FileUp className="w-4 h-4 mr-2" /> Impor CSV
                            <input type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={loading} />
                        </label>
                    </div>
                </div>

                {/* Tabel Data */}
                <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-200 dark:border-slate-800">
                                <th className="p-4 font-semibold">Nama Lengkap</th>
                                <th className="p-4 font-semibold">Nomor WhatsApp</th>
                                <th className="p-4 font-semibold">Kategori</th>
                                <th className="p-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && contacts.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Tidak ada kontak yang ditemukan.</td></tr>
                            ) : (
                                filteredContacts.map(c => (
                                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-600">{c.name}</td>
                                        <td className="p-4 text-gray-600 font-mono text-sm">{c.phone}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                                                {c.category}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button 
                                                onClick={() => openModal('edit', c)} 
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => deleteContact(c.id, c.name)} 
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 dark:bg-slate-800">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100">
                                {modalMode === 'add' ? 'Tambah Kontak Baru' : 'Edit Data Kontak'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp (Ex: 62812...)</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} // Hanya angka
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-900"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="Siswa">Siswa</option>
                                    <option value="Wali Murid">Wali Murid</option>
                                    <option value="Guru">Guru / Staff</option>
                                    <option value="Umum">Umum</option>
                                </select>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManager;