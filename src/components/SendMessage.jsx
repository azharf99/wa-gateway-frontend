import React, { useState } from 'react';
import { Send, Paperclip, AlertCircle, CheckCircle, Image, FileText, Video, ListChecks, Plus, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axios';
import TargetSelectWithSearch from './TargetSelectWithSearch';
import useContacts from '../hooks/useContacts';

const SendMessage = ({ deviceId }) => {
    const [to, setTo] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [messageType, setMessageType] = useState('text'); // text, media, poll
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [mediaType, setMediaType] = useState('document');
    
    // Poll States
    const [pollName, setPollName] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollMaxSelections, setPollMaxSelections] = useState(1);
    
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });
    const { contacts, loadingContacts } = useContacts();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        
        if (selectedFile) {
            setMessageType('media');
            if (selectedFile.type.startsWith('image/')) setMediaType('image');
            else if (selectedFile.type.startsWith('video/')) setMediaType('video');
            else setMediaType('document');
        }
    };

    const addPollOption = () => setPollOptions([...pollOptions, '']);
    const removePollOption = (index) => {
        if (pollOptions.length > 2) {
            const newOptions = [...pollOptions];
            newOptions.splice(index, 1);
            setPollOptions(newOptions);
        }
    };
    const updatePollOption = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, type: '', text: '' });

        try {
            let formattedTo = to;
            if (isGroup && !to.includes('@')) {
                formattedTo = `${to}@g.us`;
            } else if(!isGroup && !to.includes('@')){
                formattedTo = `${to}@s.whatsapp.net`;
            }

            if (messageType === 'media' && file) {
                const formData = new FormData();
                formData.append('device_id', parseInt(deviceId));
                formData.append('file', file);
                formData.append('to', formattedTo);
                formData.append('is_group', isGroup);
                formData.append('caption', message);
                formData.append('media_type', mediaType);

                await axiosInstance.post('/whatsapp/send-media', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else if (messageType === 'poll') {
                const validOptions = pollOptions.filter(opt => opt.trim() !== '');
                if (validOptions.length < 2) throw new Error("Minimal 2 opsi poll diperlukan");

                await axiosInstance.post('/whatsapp/send-poll', {
                    device_id: parseInt(deviceId),
                    to: formattedTo,
                    name: pollName,
                    options: validOptions,
                    max_selections: parseInt(pollMaxSelections),
                    is_group: isGroup
                });
            } else {
                await axiosInstance.post('/whatsapp/send', {
                    device_id: parseInt(deviceId),
                    to: formattedTo,
                    message: message,
                    is_group: isGroup
                });
            }

            setAlert({ show: true, type: 'success', text: 'Pesan berhasil dikirim!' });
            setTo('');
            setMessage('');
            setFile(null);
            setPollName('');
            setPollOptions(['', '']);
            setPollMaxSelections(1);
            setMessageType('text');
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
                {/* TABS TIPE PESAN */}
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                    <button 
                        type="button"
                        onClick={() => setMessageType('text')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${messageType === 'text' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Teks Biasa
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMessageType('media')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${messageType === 'media' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Media / File
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMessageType('poll')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${messageType === 'poll' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Poll (Votting)
                    </button>
                </div>

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
                        <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
                            <input 
                                type="checkbox" 
                                className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                                checked={isGroup}
                                onChange={(e) => setIsGroup(e.target.checked)}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Ini adalah Grup</span>
                        </label>
                    </div>
                </div>

                {messageType === 'text' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Pesan Teks</label>
                        <textarea 
                            required
                            rows="4"
                            placeholder="Ketik pesan Anda di sini..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>
                )}

                {messageType === 'media' && (
                    <div className="space-y-4">
                        <div className="border border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-800/50">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center">
                                <Paperclip className="w-4 h-4 mr-1" /> Lampirkan File
                            </label>
                            <input 
                                type="file" 
                                required
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-slate-700 dark:file:text-slate-200"
                            />
                            
                            {file && (
                                <div className="mt-4 flex gap-4">
                                    <label className="flex items-center space-x-1 text-sm dark:text-slate-300">
                                        <input type="radio" value="document" checked={mediaType === 'document'} onChange={(e) => setMediaType(e.target.value)} />
                                        <FileText className="w-4 h-4 text-gray-500 ml-1" /> <span>Dokumen</span>
                                    </label>
                                    <label className="flex items-center space-x-1 text-sm dark:text-slate-300">
                                        <input type="radio" value="image" checked={mediaType === 'image'} onChange={(e) => setMediaType(e.target.value)} />
                                        <Image className="w-4 h-4 text-gray-500 ml-1" /> <span>Gambar</span>
                                    </label>
                                    <label className="flex items-center space-x-1 text-sm dark:text-slate-300">
                                        <input type="radio" value="video" checked={mediaType === 'video'} onChange={(e) => setMediaType(e.target.value)} />
                                        <Video className="w-4 h-4 text-gray-500 ml-1" /> <span>Video</span>
                                    </label>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Caption (Opsional)</label>
                            <textarea 
                                rows="2"
                                placeholder="Ketik caption media..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                )}

                {messageType === 'poll' && (
                    <div className="space-y-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-1 flex items-center">
                                <ListChecks className="w-4 h-4 mr-1.5 text-green-500" /> Pertanyaan Poll
                            </label>
                            <input 
                                type="text" 
                                required
                                placeholder="Apa warna favoritmu?"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                value={pollName}
                                onChange={(e) => setPollName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200">Opsi Pilihan</label>
                            {pollOptions.map((opt, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        required
                                        placeholder={`Opsi ${idx + 1}`}
                                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                        value={opt}
                                        onChange={(e) => updatePollOption(idx, e.target.value)}
                                    />
                                    {pollOptions.length > 2 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removePollOption(idx)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={addPollOption}
                                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-600 transition-all flex items-center justify-center font-medium"
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> Tambah Opsi
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700 dark:text-slate-200">Maksimal Pilihan</label>
                            <input 
                                type="number" 
                                min="1" 
                                max={pollOptions.length}
                                className="w-20 px-3 py-1.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                value={pollMaxSelections}
                                onChange={(e) => setPollMaxSelections(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center shadow-md"
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