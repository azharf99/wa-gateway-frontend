import React, { useState, useEffect } from 'react';
import { 
    CalendarClock, Plus, Trash2, Edit, X, CheckCircle, AlertCircle, 
    Clock, Paperclip, Image as ImageIcon, FileText, Video, 
    Search, Filter, ChevronLeft, ChevronRight, ListChecks, Users, User
} from 'lucide-react';
import axiosInstance from '../api/axios';
import TargetSelectWithSearch from './TargetSelectWithSearch';
import useContacts from '../hooks/useContacts';

const ScheduleMessage = ({ deviceId }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    
    const [formData, setFormData] = useState({ 
        id: null, to: '', is_group: false, message: '', run_at: '', 
        type: 'text', // text, media, poll
        poll_question: '', poll_options: ['', ''], poll_max: 1
    });
    const [file, setFile] = useState(null);
    const [mediaType, setMediaType] = useState('document');
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });

    // Poll Helpers
    const addPollOption = () => {
        setFormData(prev => ({ ...prev, poll_options: [...prev.poll_options, ''] }));
    };
    const removePollOption = (idx) => {
        if (formData.poll_options.length > 2) {
            const newOpts = [...formData.poll_options];
            newOpts.splice(idx, 1);
            setFormData(prev => ({ ...prev, poll_options: newOpts }));
        }
    };
    const updatePollOption = (idx, val) => {
        const newOpts = [...formData.poll_options];
        newOpts[idx] = val;
        setFormData(prev => ({ ...prev, poll_options: newOpts }));
    };

    // 🚨 STATE SERVER-SIDE PAGINATION, SEARCH, & FILTER
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING'); // ALL, SENT, FAILED, PENDING
    const limit = 6; // Menampilkan 6 Kotak per halaman
    const { contacts, loadingContacts } = useContacts();

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
            setFormData(prev => ({ ...prev, type: 'media' }));
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
                message: data.message || '', 
                run_at: formattedDate,
                type: data.type || 'text',
                poll_question: data.poll_question || '',
                poll_options: data.poll_options ? data.poll_options.split('|') : ['', ''],
                poll_max: data.poll_max || 1
            });
        } else {
            setFormData({ 
                id: null, to: '', is_group: false, message: '', run_at: '', 
                type: 'text', poll_question: '', poll_options: ['', ''], poll_max: 1 
            });
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
                if (formData.type === 'media' && file) {
                    const uploadData = new FormData();
                    uploadData.append('device_id', deviceId);
                    uploadData.append('file', file);
                    uploadData.append('to', formattedTo);
                    uploadData.append('is_group', formData.is_group);
                    uploadData.append('caption', formData.message);
                    uploadData.append('media_type', mediaType);
                    uploadData.append('run_at', formattedDate);

                    await axiosInstance.post('/schedule/media', uploadData, { headers: { 'Content-Type': 'multipart/form-data' }});
                } else if (formData.type === 'poll') {
                    const validOptions = formData.poll_options.filter(o => o.trim() !== '');
                    await axiosInstance.post('/schedule/poll', {
                        device_id: parseInt(deviceId),
                        to: formattedTo,
                        question: formData.poll_question,
                        options: validOptions,
                        max_selections: parseInt(formData.poll_max),
                        run_at: formattedDate
                    });
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
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${getStatusStyle(s.status)}`}>
                                        {s.status}
                                    </span>
                                    <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity">
                                        {s.status === 'PENDING' && (
                                            <button onClick={() => openModal('edit', s)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                                        )}
                                        <button onClick={() => deleteSchedule(s.id)} className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                        {s.is_group ? <Users className="w-4 h-4 text-indigo-500" /> : <User className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{s.to.split('@')[0]}</h3>
                                        <p className="text-[10px] text-slate-400 font-mono">{s.to}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mb-4 grow border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">
                                        {s.type === 'poll' ? `📊 Poll: ${s.poll_question}` : `"${s.message || 'Media Message'}"`}
                                    </p>
                                </div>
                                <div className="flex items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                    {s.run_at.replace('T', ' ').substring(0, 16)} WIB
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
                            {/* TAB TIPE PESAN (Hanya saat Add) */}
                            {modalMode === 'add' && (
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 mb-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'text' }))}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'text' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                                    >Teks</button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'media' }))}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'media' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                                    >Media</button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'poll' }))}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'poll' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                                    >Poll</button>
                                </div>
                            )}

                            <div>
                                <TargetSelectWithSearch
                                    value={formData.to}
                                    onChange={(nextTo) => setFormData({ ...formData, to: nextTo })}
                                    contacts={contacts}
                                    loading={loadingContacts}
                                />
                                <label className="inline-flex items-center mt-2 cursor-pointer">
                                    <input type="checkbox" className="rounded text-emerald-600 mr-2" checked={formData.is_group} 
                                        onChange={e => setFormData({...formData, is_group: e.target.checked})} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Kirim ke Grup</span>
                                </label>
                            </div>

                            {formData.type === 'poll' ? (
                                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Pertanyaan</label>
                                        <input 
                                            type="text" required
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={formData.poll_question}
                                            onChange={(e) => setFormData({...formData, poll_question: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Opsi</label>
                                        {formData.poll_options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    type="text" required placeholder={`Opsi ${idx+1}`}
                                                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100"
                                                    value={opt}
                                                    onChange={(e) => updatePollOption(idx, e.target.value)}
                                                />
                                                {formData.poll_options.length > 2 && (
                                                    <button type="button" onClick={() => removePollOption(idx)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={addPollOption} className="w-full py-1.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all uppercase">Tambah Opsi</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pesan / Caption</label>
                                    <textarea required={formData.type === 'text'} rows="3" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-colors"
                                        value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                                </div>
                            )}

                            {formData.type === 'media' && modalMode === 'add' && (
                                <div className="border border-dashed border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3 bg-emerald-50/50 dark:bg-emerald-900/10">
                                    <label className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center">
                                        <Paperclip className="w-3.5 h-3.5 mr-1" /> Lampirkan File
                                    </label>
                                    <input type="file" required onChange={handleFileChange} className="w-full text-xs text-emerald-600 dark:text-emerald-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-emerald-100 dark:file:bg-emerald-900/40 file:text-emerald-700 dark:file:text-emerald-400 hover:file:bg-emerald-200 dark:hover:file:bg-emerald-900/60 transition-colors" />
                                    {file && (
                                        <div className="mt-3 flex gap-3 text-xs text-slate-700 dark:text-slate-300">
                                            <label className="flex items-center space-x-1 cursor-pointer"><input type="radio" className="text-emerald-600 focus:ring-emerald-500" value="document" checked={mediaType === 'document'} onChange={e => setMediaType(e.target.value)} /><FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1" /> <span>Dokumen</span></label>
                                            <label className="flex items-center space-x-1 cursor-pointer"><input type="radio" className="text-emerald-600 focus:ring-emerald-500" value="image" checked={mediaType === 'image'} onChange={e => setMediaType(e.target.value)} /><ImageIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1" /> <span>Gambar</span></label>
                                            <label className="flex items-center space-x-1 cursor-pointer"><input type="radio" className="text-emerald-600 focus:ring-emerald-500" value="video" checked={mediaType === 'video'} onChange={e => setMediaType(e.target.value)} /><Video className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1" /> <span>Video</span></label>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waktu Eksekusi</label>
                                <input type="datetime-local" required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" 
                                    value={formData.run_at} onChange={e => setFormData({...formData, run_at: e.target.value})} />
                            </div>

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