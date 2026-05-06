import React, { useState, useContext, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, User, Mail, Shield, Fingerprint } from 'lucide-react';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PasswordInput from './PasswordInput';

const AccountSettings = () => {
    const { user: authUser, updateUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(authUser);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: authUser?.name || '',
        username: authUser?.username || ''
    });
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', text: '' });

    const showAlert = (type, text) => {
        setAlert({ show: true, type, text });
        setTimeout(() => setAlert({ show: false, type: '', text: '' }), 5000);
    };

    const fetchProfile = async () => {
        if (!authUser?.id) return;
        
        try {
            const res = await axiosInstance.get(`/auth/user/${authUser.id}`);
            const userData = res.data.data;
            setProfile(userData);
            setProfileForm({
                name: userData.name || '',
                username: userData.username || ''
            });
            // Update context as well to keep it in sync
            updateUser(userData);
        } catch (error) {
            console.error("Gagal mengambil profil", error);
        }
    };

    useEffect(() => {
        if (authUser?.id) {
            fetchProfile();
        }
    }, [authUser?.id]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const res = await axiosInstance.put('/auth/profile', {
                name: profileForm.name,
                username: profileForm.username
            });
            
            showAlert('success', res.data.message || 'Profil berhasil diperbarui.');
            setIsEditingProfile(false);
            fetchProfile(); // Refresh profile data
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Gagal memperbarui profil.');
        } finally {
            setProfileLoading(false);
        }
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
        <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
            {/* Profil Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative group">
                        {profile?.avatar ? (
                            <img 
                                src={profile.avatar} 
                                alt={profile.name || profile.username} 
                                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/10 shadow-xl"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl">
                                <User size={40} />
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                            <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{profile?.name || profile?.username}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            @{profile?.username} • ID: {profile?.id}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <Shield size={12} /> {profile?.role || 'User'}
                        </div>
                    </div>
                    <div>
                        <button 
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all border border-slate-200 dark:border-slate-700"
                        >
                            {isEditingProfile ? 'Batal Edit' : 'Edit Profil'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        Detail Akun
                    </h3>
                </div>

                {isEditingProfile ? (
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nama Lengkap</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all dark:text-white"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Fingerprint size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all dark:text-white"
                                        value={profileForm.username}
                                        onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={profileLoading}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-70 flex justify-center items-center"
                        >
                            {profileLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Simpan Perubahan'}
                        </button>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Lengkap</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{profile?.name || '-'}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
                                <Fingerprint size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{profile?.username || '...'}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 md:col-span-2">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Terdaftar</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{profile?.email || '...'}</p>
                            </div>
                        </div>
                    </div>
                )}
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
