import React, { useState, useEffect } from 'react';
import { AlarmClock, Plus, Trash2, Edit, X, CheckCircle, Clock, Users, User, Search, Filter } from 'lucide-react';
import axiosInstance from '../api/axios';

const ReminderManager = ({ deviceId }) => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ id: null, to: '', is_group: false, message: '', interval_days: 1, next_run: '' });
    
    // 🚨 STATE SERVER-SIDE PAGINATION & SEARCH
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [targetFilter, setTargetFilter] = useState('ALL'); // ALL, GRUP, PERSONAL
    const limit = 6; // Menampilkan 6 Kotak per halaman

    // DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset halaman saat ngetik
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // HANDLE FILTER
    const handleFilterChange = (e) => {
        setTargetFilter(e.target.value);
        setCurrentPage(1); // Wajib reset ke halaman 1
    };

    const fetchReminders = async () => {
        if (!deviceId) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `/reminders/list?device_id=${deviceId}&page=${currentPage}&limit=${limit}&search=${debouncedSearch}&filter=${targetFilter}`
            );
            const paginationData = res.data.data;
            setReminders(paginationData.data || []);
            setTotalPages(paginationData.total_pages);
            setTotalItems(paginationData.total);
        } catch (error) {
            console.error("Gagal memuat reminder:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId, currentPage, debouncedSearch, targetFilter]);

    const openModal = (mode, data = null) => {
        setModalMode(mode);
        if (data) {
            setFormData({ 
                id: data.id, 
                to: data.to, 
                is_group: data.is_group, 
                message: data.message, 
                interval_days: data.interval_days, 
                next_run: data.next_run.substring(11, 16) // Ambil jam saja "HH:mm"
            });
        } else {
            setFormData({ id: null, to: '', is_group: false, message: '', interval_days: 1, next_run: '08:00' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = modalMode === 'add' ? '/reminders/create' : '/reminders/update';
            let formattedTo = formData.to;
            if (formData.is_group && !formData.to.includes('@')) formattedTo = `${formData.to}@g.us`;
            else if(!formData.is_group && !formData.to.includes('@')) formattedTo = `${formData.to}@s.whatsapp.net`;

            await axiosInstance.post(endpoint, {
                ...formData,
                device_id: parseInt(deviceId),
                to: formattedTo
            });
            setIsModalOpen(false);
            fetchReminders();
        } catch (error) {
            alert("Gagal menyimpan: " + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteReminder = async (id) => {
        if (!window.confirm("Hapus reminder ini permanen?")) return;
        try {
            await axiosInstance.delete(`/reminders/delete?id=${id}`);
            fetchReminders();
        } catch (error) {
            alert("Gagal menghapus reminder");
        }
    };

    const toggleStatus = async (reminder) => {
        try {
            await axiosInstance.post('/reminders/update', {
                ...reminder,
                is_active: !reminder.is_active
            });
            fetchReminders();
        } catch (error) {
            alert("Gagal update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                
                {/* 🚨 HEADER, KOTAK PENCARIAN & FILTER */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center shrink-0">
                        <AlarmClock className="mr-2 text-emerald-500 w-6 h-6" /> Pengingat Rutin
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* DROPDOWN FILTER PENERIMA */}
                        <div className="relative w-full sm:w-44 shrink-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </div>
                            <select
                                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors appearance-none cursor-pointer font-medium"
                                value={targetFilter}
                                onChange={handleFilterChange}
                            >
                                <option value="ALL">Semua Tipe</option>
                                <option value="PERSONAL">Japri (Personal)</option>
                                <option value="GRUP">Grup WA</option>
                            </select>
                        </div>

                        {/* SEARCH INPUT */}
                        <div className="relative w-full sm:w-64 shrink-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nomor/pesan..."
                                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <button onClick={() => openModal('add')} className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap shrink-0">
                            <Plus className="w-4 h-4 mr-2" /> Buat Baru
                        </button>
                    </div>
                </div>

                {/* 🚨 GRID DATA (KOTAK-KOTAK) */}
                <div className="relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reminders.map(r => (
                            <div key={r.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all bg-white dark:bg-slate-800 relative group flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${r.is_group ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                            {r.is_group ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{r.to.split('@')[0]}</h3>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal('edit', r)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteReminder(r.id)} className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 italic flex-grow">"{r.message}"</p>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <Clock className="w-3.5 h-3.5 mr-1.5" /> Tiap {r.interval_days} hr | {r.next_run?.substring(11, 16) || 'N/A'}
                                    </div>
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only" checked={r.is_active} onChange={() => toggleStatus(r)} />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${r.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${r.is_active ? 'transform translate-x-4' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                    {reminders.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 mt-4">
                            <AlarmClock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p>{debouncedSearch || targetFilter !== 'ALL' ? "Tidak ada pengingat yang cocok." : "Belum ada jadwal pengingat."}</p>
                        </div>
                    )}
                </div>

                {/* 🚨 KONTROL PAGINATION */}
                {totalItems > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Total: <span className="font-bold text-slate-700 dark:text-slate-200">{totalItems}</span> pengingat</span>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Hal <span className="font-bold text-slate-700 dark:text-slate-200">{currentPage}</span> / {totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || loading} className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300">
                                    Prev
                                </button>
                                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages || loading} className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL FORM (Tetap sama seperti sebelumnya) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-white">{modalMode === 'add' ? 'Pengingat Baru' : 'Edit Pengingat'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Input Nomor */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tujuan (Nomor/JID)</label>
                                <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} />
                                <label className="inline-flex items-center mt-2 cursor-pointer">
                                    <input type="checkbox" className="rounded text-emerald-600 mr-2" checked={formData.is_group} onChange={e => setFormData({...formData, is_group: e.target.checked})} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Ini adalah Grup</span>
                                </label>
                            </div>
                            {/* Input Interval & Jam */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Interval (Hari)</label>
                                    <input type="number" min="1" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.interval_days} onChange={e => setFormData({...formData, interval_days: parseInt(e.target.value)})} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jam Eksekusi</label>
                                    <input type="time" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.next_run} onChange={e => setFormData({...formData, next_run: e.target.value})} />
                                </div>
                            </div>
                            {/* Input Pesan */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pesan (Gunakan {`{nama}`} untuk sapaan)</label>
                                <textarea required rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all mt-4">
                                {loading ? 'Menyimpan...' : 'Simpan Pengingat'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderManager;