import React, { useState } from 'react';
import { ShieldCheck, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../api/axios';

const AccountSettings = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });

    const showAlert = (type, text) => {
        setAlert({ show: true, type, text });
        setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.new_password !== formData.confirm_password) {
            showAlert('error', 'Konfirmasi password baru tidak cocok!');
            return;
        }

        if (formData.new_password.length < 6) {
            showAlert('error', 'Password baru minimal 6 karakter!');
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.put('/auth/change-password', {
                old_password: formData.old_password,
                new_password: formData.new_password
            });
            
            showAlert('success', res.data.message || 'Password berhasil diperbarui.');
            setFormData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Gagal mengubah password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <ShieldCheck className="mr-2 text-emerald-500 w-6 h-6" /> Keamanan Akun {user.username}
                </h2>

                {alert.show && (
                    <div className={`p-4 rounded-lg mb-6 flex items-start ${alert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {alert.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" />}
                        <p>{alert.text}</p>
                    </div>
                )}

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6 flex items-start">
                    <KeyRound className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                    <p className="text-sm text-emerald-800">
                        Pastikan Anda menggunakan kombinasi huruf dan angka untuk keamanan maksimal. Jangan gunakan password yang sama dengan akun lain.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.old_password}
                            onChange={(e) => setFormData({...formData, old_password: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.new_password}
                            onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.confirm_password}
                            onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center"
                    >
                        {loading ? 'Menyimpan...' : 'Perbarui Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;