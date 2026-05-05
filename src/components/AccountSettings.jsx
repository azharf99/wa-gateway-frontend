import React, { useState, useContext, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, User, Mail, Shield, Fingerprint } from 'lucide-react';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PasswordInput from './PasswordInput';

const AccountSettings = () => {
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(authUser); // Gunakan data dari context sebagai awal
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

    const fetchProfile = async () => {
        try {
            const res = await axiosInstance.get(`/auth/user/${authUser.id}`);
            setProfile(res.data.data);
        } catch (error) {
            console.error("Gagal mengambil profil", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

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
        <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
            {/* Profil Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <User size={24} />
                    </div>
                    Informasi Profil
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400">
                            <Fingerprint size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200">{profile?.username || '...'}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200">{profile?.email || '...'}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200 uppercase">{profile?.role || '...'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                        <ShieldCheck size={24} />
                    </div>
                    Keamanan Password
                </h2>

                {alert.show && (
                    <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 ${alert.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'}`}>
                        {alert.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                        <p className="text-sm font-medium">{alert.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password Lama</label>
                            <PasswordInput 
                                required 
                                className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none transition-all dark:text-white"
                                value={formData.old_password}
                                onChange={(e) => setFormData({...formData, old_password: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password Baru</label>
                            <PasswordInput 
                                required 
                                className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none transition-all dark:text-white"
                                value={formData.new_password}
                                onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Konfirmasi Password Baru</label>
                            <PasswordInput 
                                required 
                                className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none transition-all dark:text-white"
                                value={formData.confirm_password}
                                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-70 flex justify-center items-center"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Perbarui Keamanan'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;
