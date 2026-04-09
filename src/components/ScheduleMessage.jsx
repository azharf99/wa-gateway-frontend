import React, { useState, useEffect } from 'react';
import { 
    CalendarClock, Plus, Trash2, Edit, X, CheckCircle, AlertCircle, 
    Clock, Paperclip, Image as ImageIcon, FileText, Video, 
    Search, Filter, ChevronLeft, ChevronRight 
} from 'lucide-react';
import axiosInstance from '../api/axios';

const ScheduleMessage = ({ deviceId }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    
    const [formData, setFormData] = useState({ id: null, to: '', is_group: false, message: '', run_at: '' });
    const [file, setFile] = useState(null);
    const [mediaType, setMediaType] = useState('document');
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });

    // 🚨 STATE SERVER-SIDE PAGINATION, SEARCH, & FILTER
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SENT, FAILED, PENDING
    const limit = 6; // Menampilkan 6 Kotak per halaman

    // DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset halaman saat ngetik
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // HANDLE FILTER DROPDOWN
    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Wajib reset ke halaman 1
    };

    const showAlert = (type, text) => {
        setAlert({ show: true, type, text });
        setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
    };

    // FETCH API dengan URL Lengkap
    const fetchSchedules = async () => {
        if (!deviceId) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `/schedule/list?device_id=${deviceId}&page=${currentPage}&limit=${limit}&search=${debouncedSearch}&status=${statusFilter}`
            );
            const paginationData = res.data.data;
            setSchedules(paginationData.data || []);
            setTotalPages(paginationData.total_pages);
            setTotalItems(paginationData.total);
        } catch (error) {
            console.error("Gagal memuat jadwal:", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger Fetch
    useEffect(() => {
        fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId, currentPage, debouncedSearch, statusFilter]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/')) setMediaType('image');
            else if (selectedFile.type.startsWith('video/')) setMediaType('video');
            else setMediaType('document');
        }
    };

    const openModal = (mode, data = null) => {
        setModalMode(mode);
        setFile(null);
        if (data) {
            const formattedDate = data.run_at.replace(' ', 'T').substring(0, 16);
            setFormData({ 
                id: data.id, 
                to: data.to, 
                is_group: data.is_group, 
                message: data.message, 
                run_at: formattedDate 
            });
        } else {
            setFormData({ id: null, to: '', is_group: false, message: '', run_at: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formattedDate = formData.run_at.replace('T', ' ') + ':00';
            let formattedTo = formData.to;
            if (formData.is_group && !formData.to.includes('@')) formattedTo = `${formData.to}@g.us`;
            else if(!formData.is_group && !formData.to.includes('@')) formattedTo = `${formData.to}@s.whatsapp.net`;

            if (modalMode === 'add') {
                if (file) {
                    const uploadData = new FormData();
                    uploadData.append('device_id', deviceId);
                    uploadData.append('file', file);
                    uploadData.append('to', formData.to);
                    uploadData.append('is_group', formData.is_group);
                    uploadData.append('caption', formData.message);
                    uploadData.append('media_type', mediaType);
                    uploadData.append('run_at', formattedDate);

                    await axiosInstance.post('/schedule/media', uploadData, { headers: { 'Content-Type': 'multipart/form-data' }});
                } else {
                    await axiosInstance.post('/schedule/message', {
                        device_id: parseInt(deviceId),
                        to: formattedTo,
                        message: formData.message,
                        run_at: formattedDate
                    });
                }
                showAlert('success', 'Pesan berhasil dijadwalkan!');
            } else {
                await axiosInstance.put('/schedule/update', {
                    id: formData.id,
                    device_id: parseInt(deviceId),
                    to: formattedTo,
                    message: formData.message,
                    run_at: formattedDate
                });
                showAlert('success', 'Jadwal berhasil diperbarui!');
            }

            setIsModalOpen(false);
            fetchSchedules();
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Gagal menyimpan jadwal.');
        } finally {
            setLoading(false);
        }
    };

    const deleteSchedule = async (id) => {
        if (!window.confirm("Hapus pesan terjadwal ini?")) return;
        try {
            await axiosInstance.delete(`/schedule/delete?id=${id}`);
            showAlert('success', 'Jadwal dibatalkan & dihapus.');
            fetchSchedules();
        } catch (error) {
            showAlert('error', 'Gagal menghapus jadwal.');
        }
    };

    // Helper untuk warna badge status
    const getStatusStyle = (status) => {
        switch(status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
            case 'SENT': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
            case 'FAILED': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                
                {/* 🚨 HEADER, KOTAK PENCARIAN & FILTER */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center shrink-0">
                        <CalendarClock className="mr-2 text-emerald-500 w-6 h-6" /> Pesan Terjadwal
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* DROPDOWN FILTER STATUS */}
                        <div className="relative w-full sm:w-44 shrink-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </div>
                            <select
                                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors appearance-none cursor-pointer font-medium"
                                value={statusFilter}
                                onChange={handleFilterChange}
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PENDING">Menunggu (Pending)</option>
                                <option value="SENT">Terkirim (Sent)</option>
                                <option value="FAILED">Gagal (Failed)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>

                        {/* SEARCH INPUT */}
                        <div className="relative w-full sm:w-64 shrink-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari tujuan/pesan..."
                                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <button onClick={() => openModal('add')} className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap shrink-0">
                            <Plus className="w-4 h-4 mr-2" /> Buat Jadwal
                        </button>
                    </div>
                </div>

                {/* ALERT NOTIFICATION */}
                {alert.show && (
                    <div className={`p-4 rounded-lg mb-6 flex items-start ${alert.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'}`}>
                        {alert.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" />}
                        <p className="text-sm font-medium">{alert.text}</p>
                    </div>
                )}

                {/* 🚨 GRID DATA (KOTAK-KOTAK) */}
                <div className="relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedules.map(s => (
                            <div key={s.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all bg-white dark:bg-slate-800 relative group flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(s.status)}`}>
                                            {s.status}
                                        </span>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mt-2 line-clamp-1">{s.to.split('@')[0]}</h3>
                                    </div>
                                    {s.status === 'PENDING' && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal('edit', s)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => deleteSchedule(s.id)} className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 italic flex-grow">
                                    {s.media_type ? <span className="font-semibold text-emerald-600 dark:text-emerald-400 not-italic mr-1">[{s.media_type}]</span> : ''} 
                                    "{s.message}"
                                </p>
                                <div className="flex items-center pt-3 border-t border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Dijadwalkan: {s.run_at.substring(0, 16)}
                                </div>
                            </div>
                        ))}
                    </div>
                    {schedules.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 mt-4">
                            <CalendarClock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p>{debouncedSearch || statusFilter !== 'ALL' ? "Tidak ada jadwal yang sesuai filter." : "Antrean jadwal kosong."}</p>
                        </div>
                    )}
                </div>

                {/* 🚨 SERVER-SIDE PAGINATION CONTROLS */}
                {totalItems > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Total: <span className="font-bold text-slate-700 dark:text-slate-200">{totalItems}</span> jadwal
                        </span>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Halaman <span className="font-bold text-slate-700 dark:text-slate-200">{currentPage}</span> dari {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="flex items-center px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage >= totalPages || loading}
                                    className="flex items-center px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL FORM (Dark Mode Ready) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{modalMode === 'add' ? 'Jadwal Baru' : 'Edit Jadwal'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-rose-500 transition-colors" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tujuan (Nomor/JID)</label>
                                <input type="text" required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" 
                                    value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} />
                                <label className="inline-flex items-center mt-2 cursor-pointer">
                                    <input type="checkbox" className="rounded text-emerald-600 mr-2" checked={formData.is_group} 
                                        onChange={e => setFormData({...formData, is_group: e.target.checked})} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Kirim ke Grup</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waktu Eksekusi</label>
                                <input type="datetime-local" required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" 
                                    value={formData.run_at} onChange={e => setFormData({...formData, run_at: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pesan / Caption</label>
                                <textarea required={!file} rows="3" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-colors" 
                                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                            </div>

                            {modalMode === 'add' && (
                                <div className="border border-dashed border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3 bg-emerald-50/50 dark:bg-emerald-900/10">
                                    <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center">
                                        <Paperclip className="w-3.5 h-3.5 mr-1" /> Lampirkan File (Opsional)
                                    </label>
                                    <input type="file" onChange={handleFileChange} className="w-full text-xs text-emerald-600 dark:text-emerald-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-emerald-100 dark:file:bg-emerald-900/40 file:text-emerald-700 dark:file:text-emerald-400 hover:file:bg-emerald-200 dark:hover:file:bg-emerald-900/60 transition-colors" />
                                    {file && (
                                        <div className="mt-3 flex gap-3 text-xs text-slate-700 dark:text-slate-300">
                                            <label className="flex items-center space-x-1 cursor-pointer"><input type="radio" className="text-emerald-600 focus:ring-emerald-500" value="document" checked={mediaType === 'document'} onChange={e => setMediaType(e.target.value)} /><FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1" /> <span>Dokumen</span></label>
                                            <label className="flex items-center space-x-1 cursor-pointer"><input type="radio" className="text-emerald-600 focus:ring-emerald-500" value="image" checked={mediaType === 'image'} onChange={e => setMediaType(e.target.value)} /><ImageIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1" /> <span>Gambar</span></label>
                                            <label className="flex items-center space-x-1 cursor-pointer"><input type="radio" className="text-emerald-600 focus:ring-emerald-500" value="video" checked={mediaType === 'video'} onChange={e => setMediaType(e.target.value)} /><Video className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1" /> <span>Video</span></label>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/30 transition-all mt-4 disabled:opacity-70 disabled:cursor-wait">
                                {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleMessage;