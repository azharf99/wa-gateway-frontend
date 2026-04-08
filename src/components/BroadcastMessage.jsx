import React, { useState } from 'react';
import { Megaphone, FileSpreadsheet, CheckCircle, AlertCircle, Info } from 'lucide-react';
import axiosInstance from '../api/axios';

const BroadcastMessage = ({ deviceId }) => {
    const [file, setFile] = useState(null);
    const [template, setTemplate] = useState('Halo {{nama}},\n\nBerikut adalah nilai ujian akhir Anda:\nMatematika: {{nilai_mtk}}\nBahasa: {{nilai_bahasa}}\n\nTerima kasih.');
    
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setAlert({ show: true, type: 'error', text: 'Silakan unggah file CSV terlebih dahulu.' });
            return;
        }

        setLoading(true);
        setAlert({ show: false, type: '', text: '' });

        const formData = new FormData();
        formData.append('device_id', parseInt(deviceId));
        formData.append('file', file);
        formData.append('message_template', template);

        try {
            const res = await axiosInstance.post('/whatsapp/broadcast', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setAlert({ show: true, type: 'success', text: res.data.message });
            setFile(null);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setAlert({ show: true, type: 'error', text: `Gagal mengirim: ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Megaphone className="mr-2 text-orange-500 w-5 h-5" /> Broadcast Massal (CSV)
            </h2>

            {alert.show && (
                <div className={`p-4 rounded-lg mb-6 flex items-start ${alert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {alert.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />}
                    <p>{alert.text}</p>
                </div>
            )}

            {/* Kotak Petunjuk Format */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
                <h3 className="font-bold flex items-center mb-2">
                    <Info className="w-4 h-4 mr-1" /> Aturan Format File CSV:
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Kolom <strong>pertama</strong> wajib berisi nomor WhatsApp (contoh: 628123...).</li>
                    <li>Baris pertama wajib berisi <strong>Nama Header</strong> (tanpa spasi lebih baik).</li>
                    <li>Gunakan <code>{`{{nama_header}}`}</code> di dalam template untuk memanggil data secara spesifik.</li>
                </ul>
                <div className="mt-3 p-2 bg-white border border-blue-100 rounded text-xs font-mono text-gray-600">
                    nomor,nama,nilai_mtk,nilai_bahasa<br/>
                    6285701xxx,Budi Santoso,85,90<br/>
                    6281234xxx,Siti Aminah,92,88
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border border-dashed border-orange-300 rounded-lg p-6 bg-orange-50/30 flex flex-col items-center justify-center">
                    <FileSpreadsheet className="w-10 h-10 text-orange-400 mb-3" />
                    <label className="block text-sm font-medium text-orange-800 mb-2 cursor-pointer">
                        <span className="bg-white border border-orange-300 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">
                            Pilih File CSV (.csv)
                        </span>
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                        />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                        {file ? `File terpilih: ${file.name}` : 'Maksimal 1000 baris untuk menjaga keamanan server.'}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Pesan</label>
                    <textarea 
                        required
                        rows="8"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none font-sans"
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center"
                >
                    {loading ? (
                        <span className="flex items-center"><div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> Menyiapkan Broadcast...</span>
                    ) : (
                        <span className="flex items-center"><Megaphone className="w-4 h-4 mr-2" /> Mulai Broadcast Latar Belakang</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default BroadcastMessage;