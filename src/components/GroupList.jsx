import React, { useState, useEffect } from 'react';
import { Users, Copy, RefreshCw } from 'lucide-react';
import axiosInstance from '../api/axios';

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/whatsapp/groups');
            setGroups(res.data.data || []);
        } catch (error) {
            console.error("Gagal mengambil daftar grup", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const copyToClipboard = (jid) => {
        navigator.clipboard.writeText(jid);
        setCopiedId(jid);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Users className="mr-2 text-purple-500" /> Daftar Grup Tersimpan
                </h2>
                <button 
                    onClick={fetchGroups}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    title="Refresh Data"
                >
                    <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                            <th className="p-3 font-medium">Nama Grup</th>
                            <th className="p-3 font-medium">Group JID</th>
                            <th className="p-3 font-medium text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="3" className="p-4 text-center text-gray-500">Belum ada grup atau device belum terkoneksi.</td>
                            </tr>
                        ) : (
                            groups.map((group) => (
                                <tr key={group.jid} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-medium text-gray-800">{group.name}</td>
                                    <td className="p-3 text-sm text-gray-500 font-mono">{group.jid}</td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => copyToClipboard(group.jid)}
                                            className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                        >
                                            {copiedId === group.jid ? 'Tersalin!' : <><Copy className="w-3 h-3 mr-1" /> Salin ID</>}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GroupList;