import React, { useState } from 'react';
import { CalendarClock, AlertCircle, CheckCircle, Clock, Paperclip, Image, FileText, Video } from 'lucide-react';
import axiosInstance from '../api/axios';

const ScheduleMessage = () => {
    const [to, setTo] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [message, setMessage] = useState('');
    const [runAt, setRunAt] = useState('');
    const [file, setFile] = useState(null);
    const [mediaType, setMediaType] = useState('document');
    
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/')) setMediaType('image');
            else if (selectedFile.type.startsWith('video/')) setMediaType('video');
            else setMediaType('document');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, type: '', text: '' });

        try {
            // Format waktu untuk Backend Gocron
            const formattedDate = runAt.replace('T', ' ') + ':00';

            // Format JID Grup untuk teks JSON biasa (FormData dikelola di Backend)
            let formattedTo = to;
            if (isGroup && !to.includes('@')) {
                formattedTo = `${to}@g.us`;
            } else if(!isGroup && !to.includes('@')){
                formattedTo = `${to}@s.whatsapp.net`;
            }

            if (file) {
                // LOGIC MEDIA TERJADWAL
                const formData = new FormData();
                formData.append('file', file);
                formData.append('to', to); // Kirim raw JID, is_group diurus backend
                formData.append('is_group', isGroup);
                formData.append('caption', message);
                formData.append('media_type', mediaType);
                formData.append('run_at', formattedDate);

                await axiosInstance.post('/schedule/media', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // LOGIC TEKS TERJADWAL
                await axiosInstance.post('/schedule/message', {
                    to: formattedTo,
                    message: message,
                    run_at: formattedDate
                });
            }

            setAlert({ show: true, type: 'success', text: `Berhasil dijadwalkan pada ${formattedDate}` });
            setTo('');
            setMessage('');
            setRunAt('');
            setFile(null);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setAlert({ show: true, type: 'error', text: `Gagal menjadwalkan: ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <CalendarClock className="mr-2 text-indigo-500 w-5 h-5" /> Jadwalkan Pesan & Media
            </h2>

            {alert.show && (
                <div className={`p-4 rounded-lg mb-6 flex items-start ${alert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {alert.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />}
                    <p>{alert.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Tujuan / ID Grup</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Contoh: 62812xxx atau ID-Grup"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border">
                            <input 
                                type="checkbox" 
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                checked={isGroup}
                                onChange={(e) => setIsGroup(e.target.checked)}
                            />
                            <span className="text-sm font-medium text-gray-700">Ini Grup</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-500" /> Waktu Pengiriman
                    </label>
                    <input 
                        type="datetime-local" 
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={runAt}
                        onChange={(e) => setRunAt(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Isi Pesan / Caption</label>
                    <textarea 
                        required={!file} // Teks wajib jika tidak ada file
                        rows="4"
                        placeholder="Ketik pesan yang ingin dijadwalkan..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>

                <div className="border border-dashed border-indigo-200 rounded-lg p-4 bg-indigo-50/30">
                    <label className="block text-sm font-medium text-indigo-800 mb-2 flex items-center">
                        <Paperclip className="w-4 h-4 mr-1" /> Lampirkan File Terjadwal (Opsional)
                    </label>
                    <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="w-full text-sm text-indigo-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                    />
                    
                    {file && (
                        <div className="mt-4 flex gap-4">
                            <label className="flex items-center space-x-1 text-sm">
                                <input type="radio" value="document" checked={mediaType === 'document'} onChange={(e) => setMediaType(e.target.value)} />
                                <FileText className="w-4 h-4 text-gray-500 ml-1" /> <span>Dokumen</span>
                            </label>
                            <label className="flex items-center space-x-1 text-sm">
                                <input type="radio" value="image" checked={mediaType === 'image'} onChange={(e) => setMediaType(e.target.value)} />
                                <Image className="w-4 h-4 text-gray-500 ml-1" /> <span>Gambar</span>
                            </label>
                            <label className="flex items-center space-x-1 text-sm">
                                <input type="radio" value="video" checked={mediaType === 'video'} onChange={(e) => setMediaType(e.target.value)} />
                                <Video className="w-4 h-4 text-gray-500 ml-1" /> <span>Video</span>
                            </label>
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center"
                >
                    {loading ? (
                        <span className="flex items-center"><div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> Memproses...</span>
                    ) : (
                        <span className="flex items-center"><CalendarClock className="w-4 h-4 mr-2" /> Masukkan ke Antrean Jadwal</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ScheduleMessage;