import React, { useState, useEffect } from 'react';
import { History, Trash2, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../api/axios';

const MessageLogs = ({ deviceId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        if (!deviceId) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/whatsapp/logs?device_id=${deviceId}`);
            setLogs(res.data.data || []);
        } catch (error) {
            console.error("Gagal memuat log:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [deviceId]);

    const handleRevoke = async (log) => {
        if (!window.confirm("Yakin ingin menarik (Delete for Everyone) pesan ini?")) return;
        
        try {
            await axiosInstance.post('/whatsapp/revoke', {
                device_id: parseInt(deviceId),
                to: log.target,
                message_id: log.message_id
            });
            alert("Pesan berhasil ditarik!");
            fetchLogs(); // Refresh status
        } catch (error) {
            alert("Gagal menarik pesan: " + error.response?.data?.message);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                <History className="mr-2 text-indigo-500 w-6 h-6" /> Riwayat Pesan Keluar
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                            <th className="px-4 py-3">Tujuan</th>
                            <th className="px-4 py-3">Pesan</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 rounded-tr-lg text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-xs text-gray-500">
                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                </td>
                                <td className="px-4 py-3 font-medium">{log.target.split('@')[0]}</td>
                                <td className="px-4 py-3 max-w-xs truncate" title={log.message}>{log.message}</td>
                                <td className="px-4 py-3">
                                    {log.status === 'SENT' ? 
                                        <span className="flex items-center text-green-600 text-xs font-bold"><CheckCircle className="w-3.5 h-3.5 mr-1"/> TERKIRIM</span> : 
                                        <span className="flex items-center text-red-500 text-xs font-bold"><XCircle className="w-3.5 h-3.5 mr-1"/> DITARIK</span>
                                    }
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {log.status === 'SENT' && (
                                        <button onClick={() => handleRevoke(log)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center justify-center mx-auto transition-colors">
                                            <Trash2 className="w-3.5 h-3.5 mr-1"/> Tarik Pesan
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-400">Belum ada riwayat pesan.</div>
                )}
            </div>
        </div>
    );
};

export default MessageLogs;