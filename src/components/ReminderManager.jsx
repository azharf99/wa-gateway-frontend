import React, { useState, useEffect } from 'react';
import { AlarmClock, Plus, Trash2, Edit, X, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import axiosInstance from '../api/axios';

const ReminderManager = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ id: null, to: '', message: '', is_group: false, interval_days: 1, next_run: '' });
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });

    const fetchReminders = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/reminders/list');
            setReminders(res.data.data || []);
        } catch (error) {
            showAlert('error', 'Gagal memuat pengingat.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReminders(); }, []);

    const showAlert = (type, text) => {
        setAlert({ show: true, type, text });
        setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
    };

    const openModal = (mode, data = null) => {
        setModalMode(mode);
        if (data) {
            // Convert next_run to datetime-local format
            const formattedDate = data.next_run.replace(' ', 'T').substring(0, 16);
            setFormData({ ...data, next_run: formattedDate });
        } else {
            setFormData({ id: null, to: '', message: '', is_group: false, interval_days: 1, next_run: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Re-format date for backend
            const payload = { 
                ...formData, 
                next_run: formData.next_run.replace('T', ' ') + ':00' 
            };

            if (modalMode === 'add') {
                await axiosInstance.post('/reminders/create', payload);
                showAlert('success', 'Reminder baru berhasil dijadwalkan.');
            } else {
                await axiosInstance.put('/reminders/update', payload);
                showAlert('success', 'Reminder berhasil diperbarui.');
            }
            setIsModalOpen(false);
            fetchReminders();
        } catch (error) {
            showAlert('error', 'Gagal menyimpan reminder.');
        } finally {
            setLoading(false);
        }
    };

    const deleteReminder = async (id) => {
        if (!window.confirm("Hapus pengingat ini?")) return;
        try {
            await axiosInstance.delete('/reminders/delete', { params: { id } });
            showAlert('success', 'Reminder dihapus.');
            fetchReminders();
        } catch (error) {
            showAlert('error', 'Gagal menghapus.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <AlarmClock className="mr-2 text-indigo-500 w-6 h-6" /> Reminder Otomatis (Recurring)
                    </h2>
                    <button 
                        onClick={() => openModal('add')}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Buat Reminder
                    </button>
                </div>

                {alert.show && (
                    <div className={`p-4 rounded-lg mb-6 flex items-start ${alert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {alert.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 mt-0.5" /> : <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />}
                        <p>{alert.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reminders.map(r => (
                        <div key={r.id} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-all bg-white shadow-sm relative group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${r.is_group ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {r.is_group ? 'Grup' : 'Personal'}
                                    </span>
                                    <h3 className="font-bold text-gray-800 mt-1">{r.to}</h3>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal('edit', r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deleteReminder(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">"{r.message}"</p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
                                <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> Setiap {r.interval_days} hari</div>
                                <div className="font-medium text-indigo-600">Next: {r.next_run.substring(0, 16)}</div>
                            </div>
                        </div>
                    ))}
                    {reminders.length === 0 && (
                        <div className="col-span-2 py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                            Belum ada pengingat terjadwal.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Konfigurasi Reminder</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tujuan (Nomor/JID)</label>
                                <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} />
                                <label className="inline-flex items-center mt-2 cursor-pointer">
                                    <input type="checkbox" className="rounded text-indigo-600 mr-2" checked={formData.is_group} 
                                        onChange={e => setFormData({...formData, is_group: e.target.checked})} />
                                    <span className="text-xs text-gray-600">Ini adalah grup</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jadwal Mulai Pertama</label>
                                <input type="datetime-local" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={formData.next_run} onChange={e => setFormData({...formData, next_run: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Interval Pengulangan (Hari)</label>
                                <div className="flex items-center gap-3">
                                    <input type="number" min="1" required className="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        value={formData.interval_days} onChange={e => setFormData({...formData, interval_days: parseInt(e.target.value)})} />
                                    <span className="text-sm text-gray-500">Hari sekali</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Isi Pesan</label>
                                <textarea required rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                                {loading ? 'Memproses...' : 'Simpan Reminder'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderManager;