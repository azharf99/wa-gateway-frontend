import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Plus, Edit, Trash2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import axiosInstance from '../api/axios';

const AutoReplyManager = () => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '' });
    
    // State untuk Modal Form
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        keyword: '',
        reply_text: '',
        match_type: 'contains',
        is_active: true
    });

    useEffect(() => {
        fetchReplies();
    }, []);

    const fetchReplies = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/auto-reply/');
            if (response.data.status === 'success') {
                setReplies(response.data.data || []);
            }
        } catch (error) {
            showAlert('error', 'Gagal memuat data Auto Reply.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: '', message: '' }), 4000);
    };

    const handleOpenModal = (reply = null) => {
        if (reply) {
            setIsEditing(true);
            setFormData({
                id: reply.id,
                keyword: reply.keyword,
                reply_text: reply.reply_text,
                match_type: reply.match_type,
                is_active: reply.is_active
            });
        } else {
            setIsEditing(false);
            setFormData({ id: null, keyword: '', reply_text: '', match_type: 'contains', is_active: true });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                await axiosInstance.put(`/auto-reply/${formData.id}`, formData);
                showAlert('success', 'Auto Reply berhasil diperbarui.');
            } else {
                await axiosInstance.post('/auto-reply/', formData);
                showAlert('success', 'Auto Reply berhasil ditambahkan.');
            }
            setShowModal(false);
            fetchReplies();
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Gagal menyimpan data.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus auto reply ini?')) return;
        
        try {
            await axiosInstance.delete(`/auto-reply/${id}`);
            showAlert('success', 'Auto Reply berhasil dihapus.');
            fetchReplies();
        } catch (error) {
            showAlert('error', 'Gagal menghapus data.');
        }
    };

    const toggleStatus = async (reply) => {
        try {
            const updatedData = { ...reply, is_active: !reply.is_active };
            await axiosInstance.put(`/auto-reply/${reply.id}`, updatedData);
            fetchReplies(); // Refresh data
        } catch (error) {
            showAlert('error', 'Gagal mengubah status aktif.');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <MessageSquareQuote className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Auto Reply Manager</h2>
                        <p className="text-sm text-gray-500">Kelola balasan otomatis berdasarkan keyword pesan masuk.</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Aturan
                </button>
            </div>

            {alert.message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center ${alert.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {alert.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {alert.message}
                </div>
            )}

            {/* Tabel Data */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                            <th className="py-3 px-4 font-medium">Keyword</th>
                            <th className="py-3 px-4 font-medium">Tipe Match</th>
                            <th className="py-3 px-4 font-medium">Teks Balasan</th>
                            <th className="py-3 px-4 font-medium text-center">Status</th>
                            <th className="py-3 px-4 font-medium text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {replies.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">
                                    Belum ada aturan auto reply.
                                </td>
                            </tr>
                        ) : (
                            replies.map((reply) => (
                                <tr key={reply.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{reply.keyword}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${reply.match_type === 'exact' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {reply.match_type === 'exact' ? 'Sama Persis' : 'Mengandung Kata'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 max-w-xs truncate" title={reply.reply_text}>
                                        {reply.reply_text}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => toggleStatus(reply)} className="focus:outline-none" title={reply.is_active ? "Nonaktifkan" : "Aktifkan"}>
                                            {reply.is_active ? (
                                                <ToggleRight className="w-8 h-8 text-green-500 inline-block" />
                                            ) : (
                                                <ToggleLeft className="w-8 h-8 text-gray-400 inline-block" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleOpenModal(reply)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(reply.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Auto Reply' : 'Tambah Auto Reply'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.keyword}
                                        onChange={(e) => setFormData({...formData, keyword: e.target.value})}
                                        placeholder="Contoh: terima kasih"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Match</label>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.match_type}
                                        onChange={(e) => setFormData({...formData, match_type: e.target.value})}
                                    >
                                        <option value="contains">Mengandung Kata (Contains)</option>
                                        <option value="exact">Sama Persis (Exact)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        *Sama Persis: Pesan harus persis "terima kasih". <br/>
                                        *Mengandung Kata: Pesan "oh iya, terima kasih ya" akan terdeteksi.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teks Balasan</label>
                                    <textarea 
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.reply_text}
                                        onChange={(e) => setFormData({...formData, reply_text: e.target.value})}
                                        placeholder="Sama-sama Bapak/Ibu {nama}, senang bisa membantu."
                                    ></textarea>
                                    <p className="text-xs text-gray-500 mt-1">Gunakan <strong>{`{nama}`}</strong> untuk menyebut nama kontak secara otomatis.</p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoReplyManager;