import React, { useState, useEffect } from 'react';
import { CalendarClock, Plus, Trash2, Edit, X, CheckCircle, AlertCircle, Clock, Paperclip, Image as ImageIcon, FileText, Video } from 'lucide-react';
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

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/schedule/list?device_id=${deviceId}`);
            setSchedules(res.data.data || []);
        } catch (error) {
            console.error("Gagal memuat jadwal:", error);
        } finally {
            setLoading(false);
        }
    };

    // Muat data tiap kali Device berubah
    useEffect(() => {
        if (deviceId) fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId]);

    const showAlert = (type, text) => {
        setAlert({ show: true, type, text });
        setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
    };

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
        setFile(null); // Selalu reset file saat buka modal
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

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <CalendarClock className="mr-2 text-indigo-500 w-6 h-6" /> Pesan Terjadwal (Satu Kali)
                    </h2>
                    <button onClick={() => openModal('add')} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Buat Jadwal Baru
                    </button>
                </div>

                {alert.show && (
                    <div className={`p-4 rounded-lg mb-6 flex items-start ${alert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {alert.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" />}
                        <p>{alert.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedules.map(s => (
                        <div key={s.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all bg-white relative group flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${s.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : s.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {s.status}
                                    </span>
                                    <h3 className="font-bold text-gray-800 mt-1.5 line-clamp-1">{s.to}</h3>
                                </div>
                                {s.status === 'PENDING' && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal('edit', s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteSchedule(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic flex-grow">
                                {s.media_type ? `[Lampiran ${s.media_type}] ` : ''} "{s.message}"
                            </p>
                            <div className="flex items-center pt-3 border-t border-gray-50 text-xs font-medium text-indigo-600">
                                <Clock className="w-3.5 h-3.5 mr-1.5" /> Dikirim: {s.run_at.substring(0, 16)}
                            </div>
                        </div>
                    ))}
                    {schedules.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                            <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>Tidak ada pesan yang menunggu di antrean.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">{modalMode === 'add' ? 'Jadwal Baru' : 'Edit Jadwal'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tujuan (Nomor/JID)</label>
                                <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} />
                                <label className="inline-flex items-center mt-2 cursor-pointer">
                                    <input type="checkbox" className="rounded text-indigo-600 mr-2" checked={formData.is_group} 
                                        onChange={e => setFormData({...formData, is_group: e.target.checked})} />
                                    <span className="text-xs text-gray-600">Kirim ke Grup</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Waktu Eksekusi</label>
                                <input type="datetime-local" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={formData.run_at} onChange={e => setFormData({...formData, run_at: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pesan / Caption</label>
                                <textarea required={!file} rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                            </div>

                            {/* Fitur Upload Media hanya muncul saat Add Baru */}
                            {modalMode === 'add' && (
                                <div className="border border-dashed border-indigo-200 rounded-lg p-3 bg-indigo-50/30">
                                    <label className="block text-xs font-bold text-indigo-800 mb-2 flex items-center">
                                        <Paperclip className="w-3.5 h-3.5 mr-1" /> Lampirkan File (Opsional)
                                    </label>
                                    <input type="file" onChange={handleFileChange} className="w-full text-xs text-indigo-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" />
                                    {file && (
                                        <div className="mt-3 flex gap-3 text-xs">
                                            <label className="flex items-center space-x-1"><input type="radio" value="document" checked={mediaType === 'document'} onChange={e => setMediaType(e.target.value)} /><FileText className="w-3.5 h-3.5 text-gray-500 ml-1" /> <span>Dokumen</span></label>
                                            <label className="flex items-center space-x-1"><input type="radio" value="image" checked={mediaType === 'image'} onChange={e => setMediaType(e.target.value)} /><ImageIcon className="w-3.5 h-3.5 text-gray-500 ml-1" /> <span>Gambar</span></label>
                                            <label className="flex items-center space-x-1"><input type="radio" value="video" checked={mediaType === 'video'} onChange={e => setMediaType(e.target.value)} /><Video className="w-3.5 h-3.5 text-gray-500 ml-1" /> <span>Video</span></label>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all mt-4">
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