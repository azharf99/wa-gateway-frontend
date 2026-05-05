import React, { useState, useEffect, useCallback } from 'react';
import { 
    Users, UserPlus, Search, Edit, Trash2, Shield, 
    Mail, User, Lock, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
    UserCog, ShieldAlert, BadgeCheck
} from 'lucide-react';
import axiosInstance from '../api/axios';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });
    const [alert, setAlert] = useState({ type: '', message: '' });
    
    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        username: '',
        email: '',
        password: '',
        role: 'user'
    });

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: '', message: '' }), 4000);
    };

    const fetchUsers = useCallback(async (page = pagination.page, search = searchTerm) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/users/', {
                params: { page, limit: pagination.limit, search }
            });
            const { data, total, total_pages } = response.data;
            setUsers(data || []);
            setPagination(prev => ({ 
                ...prev, 
                page, 
                total: total || 0,
                totalPages: total_pages || 1
            }));
        } catch (error) {
            showAlert('error', 'Gagal memuat data user.');
        } finally {
            setLoading(false);
        }
    }, [pagination.limit, pagination.page, searchTerm]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers(1);
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setIsEditing(true);
            setFormData({
                id: user.id,
                username: user.username,
                email: user.email,
                password: '', // Jangan isi password saat edit kecuali ingin ganti
                role: user.role
            });
        } else {
            setIsEditing(false);
            setFormData({
                id: null,
                username: '',
                email: '',
                password: '',
                role: 'user'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                // Update User
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Jangan kirim password kosong
                
                await axiosInstance.put(`/users/${formData.id}`, payload);
                showAlert('success', 'User berhasil diperbarui.');
            } else {
                // Create User
                await axiosInstance.post('/users/', formData);
                showAlert('success', 'User berhasil ditambahkan.');
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Terjadi kesalahan sistem.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`)) return;
        
        try {
            await axiosInstance.delete(`/users/${id}`);
            showAlert('success', 'User berhasil dihapus.');
            fetchUsers();
        } catch (error) {
            showAlert('error', 'Gagal menghapus user.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
                        <Users size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manajemen User</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Kelola akses dan akun pengguna aplikasi</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
                >
                    <UserPlus size={20} />
                    Tambah User
                </button>
            </div>

            {/* Alert Notification */}
            {alert.message && (
                <div className={`p-4 rounded-2xl flex items-start gap-3 animate-shake ${
                    alert.type === 'error' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                }`}>
                    {alert.type === 'error' ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
                    <p className="text-sm font-medium">{alert.message}</p>
                </div>
            )}

            {/* Content Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari berdasarkan username atau email..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Identitas User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Role Access</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {users.length > 0 ? users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-100">{user.username}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Mail size={12} /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            user.role === 'admin' 
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50' 
                                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                                        }`}>
                                            {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right space-x-2">
                                        <button 
                                            onClick={() => handleOpenModal(user)}
                                            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                            title="Edit User"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(user.id, user.username)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                            title="Delete User"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-slate-500">
                                        {loading ? 'Sedang memuat data...' : 'Tidak ada user ditemukan.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Menampilkan <span className="font-bold">{users.length}</span> dari <span className="font-bold">{pagination.total}</span> user
                        </p>
                        <div className="flex gap-2">
                            <button 
                                disabled={pagination.page === 1 || loading}
                                onClick={() => fetchUsers(pagination.page - 1)}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                disabled={pagination.page === pagination.totalPages || loading}
                                onClick={() => fetchUsers(pagination.page + 1)}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                {isEditing ? <UserCog className="text-indigo-500" /> : <UserPlus className="text-indigo-500" />}
                                {isEditing ? 'Edit Akun User' : 'Tambah User Baru'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Username</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all dark:text-white"
                                            placeholder="johndoe"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input 
                                            type="email" 
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all dark:text-white"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                        Password {isEditing && <span className="text-xs font-normal text-slate-400">(Biarkan kosong jika tidak diubah)</span>}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input 
                                            type="password" 
                                            required={!isEditing}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all dark:text-white"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Role Access</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, role: 'user'})}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                                                formData.role === 'user' 
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm' 
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                                            }`}
                                        >
                                            <BadgeCheck size={18} /> User
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, role: 'admin'})}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                                                formData.role === 'admin' 
                                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm' 
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                                            }`}
                                        >
                                            <ShieldAlert size={18} /> Admin
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70"
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan Data'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
