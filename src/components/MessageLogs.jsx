import React, { useState, useEffect } from 'react';
import { History, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Search, X, Filter } from 'lucide-react';
import axiosInstance from '../api/axios';

const MessageLogs = ({ deviceId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // STATE PAGINATION & SEARCH & FILTER
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // Nilai: ALL, SENT, REVOKED
    const limit = 10;

    // DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Kembali ke halaman 1 saat pencarian berubah
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // HANDLE PERUBAHAN FILTER DROPDOWN
    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Kembali ke halaman 1 saat filter diubah! Ini PENTING!
    };

    // FETCH API dengan URL Lengkap
    const fetchLogs = async () => {
        if (!deviceId) return;
        setLoading(true);
        try {
            // URL kini membawa pagination, search, DAN status!
            const res = await axiosInstance.get(
                `/whatsapp/logs?device_id=${deviceId}&page=${currentPage}&limit=${limit}&search=${debouncedSearch}&status=${statusFilter}`
            );
            
            const paginationData = res.data.data; 
            setLogs(paginationData.data || []);
            setTotalPages(paginationData.total_pages);
            setTotalItems(paginationData.total);
            
        } catch (error) {
            console.error("Gagal memuat log:", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger Fetch (Status Filter kini dimasukkan ke dalam dependency)
    useEffect(() => {
        fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId, currentPage, debouncedSearch, statusFilter]);

    const handleRevoke = async (log) => {
        if (!window.confirm("Yakin ingin menarik pesan ini?")) return;
        try {
            await axiosInstance.post('/whatsapp/revoke', {
                device_id: parseInt(deviceId),
                to: log.target,
                message_id: log.message_id
            });
            fetchLogs(); // Refresh tanpa mengubah halaman/filter
        } catch (error) {
            alert("Gagal menarik pesan: " + error.response?.data?.message);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
            
            {/* HEADER, KOTAK PENCARIAN & FILTER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center shrink-0">
                    <History className="mr-2 text-emerald-500 w-6 h-6" /> Riwayat Pesan
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* DROPDOWN FILTER STATUS */}
                    <div className="relative w-full sm:w-40 shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors appearance-none cursor-pointer font-medium"
                            value={statusFilter}
                            onChange={handleFilterChange}
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="SENT">Terkirim</option>
                            <option value="REVOKED">Ditarik (Revoked)</option>
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
                            placeholder="Cari nomor/pesan..."
                            className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')} 
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* TABEL DATA ... (Struktur HTML tabel biarkan persis sama seperti sebelumnya) ... */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                )}

                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-4 py-3">Waktu</th>
                            <th className="px-4 py-3">Tujuan</th>
                            <th className="px-4 py-3">Pesan</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{log.target.split('@')[0]}</td>
                                <td className="px-4 py-3 max-w-xs truncate text-slate-600 dark:text-slate-300" title={log.message}>{log.message}</td>
                                <td className="px-4 py-3">
                                    {log.status === 'SENT' ? 
                                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold"><CheckCircle className="w-3.5 h-3.5 mr-1"/> TERKIRIM</span> : 
                                        <span className="flex items-center text-rose-500 dark:text-rose-400 text-xs font-bold"><XCircle className="w-3.5 h-3.5 mr-1"/> DITARIK</span>
                                    }
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {log.status === 'SENT' && (
                                        <button onClick={() => handleRevoke(log)} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg text-xs font-bold flex flex-row items-center justify-center mx-auto transition-colors">
                                            <Trash2 className="w-3.5 h-3.5 mr-1"/> Tarik
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && !loading && (
                    <div className="text-center py-10 text-slate-400">
                        {debouncedSearch || statusFilter !== 'ALL' ? "Tidak ada pesan yang sesuai filter/pencarian." : "Belum ada riwayat pesan."}
                    </div>
                )}
            </div>

            {/* SERVER-SIDE PAGINATION CONTROLS */}
            {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Total: <span className="font-bold text-slate-700 dark:text-slate-200">{totalItems}</span> data
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
    );
};

export default MessageLogs;