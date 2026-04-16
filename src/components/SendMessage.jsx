import React, { useState } from 'react';
import { Send, Paperclip, AlertCircle, CheckCircle, Image, FileText, Video } from 'lucide-react';
import axiosInstance from '../api/axios';
import TargetSelectWithSearch from './TargetSelectWithSearch';
import useContacts from '../hooks/useContacts';

const SendMessage = ({ deviceId }) => {
    const [to, setTo] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [mediaType, setMediaType] = useState('document');
    
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });
    const { contacts, loadingContacts } = useContacts();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        
        // Auto-detect tipe media untuk mempermudah user
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
            if (file) {
                // LOGIC KIRIM MEDIA (Menggunakan FormData)
                const formData = new FormData();
                formData.append('device_id', parseInt(deviceId));
                formData.append('file', file);
                formData.append('to', to);
                formData.append('is_group', isGroup);
                formData.append('caption', message);
                formData.append('media_type', mediaType);

                await axiosInstance.post('/whatsapp/send-media', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // LOGIC KIRIM TEKS BIASA (JSON)
                // Backend golang kita butuh @g.us untuk grup di endpoint /send teks biasa
                let formattedTo = to;
                if (isGroup && !to.includes('@')) {
                    formattedTo = `${to}@g.us`;
                } else if(!isGroup && !to.includes('@')){
                    formattedTo = `${to}@s.whatsapp.net`;
                }

                await axiosInstance.post('/whatsapp/send', {
                    device_id: parseInt(deviceId),
                    to: formattedTo,
                    message: message,
                    is_group: isGroup
                });
            }

            setAlert({ show: true, type: 'success', text: 'Pesan berhasil dikirim!' });
            // Reset form setelah sukses
            setTo('');
            setMessage('');
            setFile(null);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setAlert({ show: true, type: 'error', text: `Gagal mengirim: ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-6 flex items-center">
                <Send className="mr-2 text-green-500 w-5 h-5" /> Kirim Pesan Langsung
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
                        <TargetSelectWithSearch
                            label="Nomor Tujuan / ID Grup"
                            value={to}
                            onChange={setTo}
                            contacts={contacts}
                            loading={loadingContacts}
                            placeholder="Ketik nomor/JID atau cari nama kontak..."
                        />
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border">
                            <input 
                                type="checkbox" 
                                className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                                checked={isGroup}
                                onChange={(e) => setIsGroup(e.target.checked)}
                            />
                            <span className="text-sm font-medium text-gray-700">Ini adalah Grup</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pesan / Caption</label>
                    <textarea 
                        required={!file} // Jika tidak ada file, teks wajib diisi
                        rows="4"
                        placeholder="Ketik pesan Anda di sini..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>

                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Paperclip className="w-4 h-4 mr-1" /> Lampirkan File (Opsional)
                    </label>
                    <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
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
                    className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center"
                >
                    {loading ? (
                        <span className="flex items-center"><div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> Mengirim...</span>
                    ) : (
                        <span className="flex items-center"><Send className="w-4 h-4 mr-2" /> Kirim Sekarang</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SendMessage;