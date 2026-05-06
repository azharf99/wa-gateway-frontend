import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    LogOut, Smartphone, Users, Send, Contact, User, Key, 
    AlarmClock, CalendarClock, Megaphone, Menu, MessageSquareQuote, 
    History, X, ShieldCheck, Sun, Moon, Activity // 🚨 Tambahkan Sun, Moon, Activity
} from 'lucide-react';
import axiosInstance from '../api/axios';

// Import Komponen Anak (Pastikan path-nya benar)
import DeviceManager from '../components/DeviceManager'; 
import GroupList from '../components/GroupList';
import SendMessage from '../components/SendMessage';
import ScheduleMessage from '../components/ScheduleMessage';
import BroadcastMessage from '../components/BroadcastMessage';
import ContactManager from '../components/ContactManager';
import ReminderManager from '../components/ReminderManager';
import AccountSettings from '../components/AccountSettings';
import ApiKeyManager from '../components/ApiKeyManager';
import AutoReplyManager from '../components/AutoReplyManager';
import MessageLogs from '../components/MessageLogs';
import UserManager from '../components/UserManager';

const Dashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const { tab } = useParams();
    const [activeTab, setActiveTab] = useState(tab || 'status');

    // Sinkronkan activeTab dengan URL jika user menekan tombol back/forward atau refresh
    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        } else {
            setActiveTab('status');
        }
    }, [tab]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ==========================================
    // 🌙 STATE DARK MODE DENGAN LOCAL STORAGE
    // ==========================================
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Cek apakah user sebelumnya sudah memilih dark mode
        return localStorage.getItem('theme') === 'dark';
    });

    // ==========================================
    // 🌐 STATE & LOGIC CONNECTION HEALTH CHECK
    // ==========================================
    const [networkStatus, setNetworkStatus] = useState({
        isOnline: true,
        latency: '...',
        message: 'Mengecek jaringan...',
        lastChecked: null
    });

    const checkNetworkHealth = async () => {
        try {
            // Menggunakan /api/system/network sesuai instruksi
            const res = await axiosInstance.get('/system/network'); 
            const { status, message, data } = res.data;
            
            setNetworkStatus({
                isOnline: data?.is_online ?? (status === 'success'),
                latency: data?.latency || '0ms',
                message: message || 'Jaringan Normal',
                lastChecked: new Date().toLocaleTimeString()
            });
        } catch (error) {
            setNetworkStatus({
                isOnline: false,
                latency: 'Timeout',
                message: error.response?.data?.message || 'Gagal terhubung ke server',
                lastChecked: new Date().toLocaleTimeString()
            });
        }
    };

    useEffect(() => {
        // Jalankan saat mount
        checkNetworkHealth();
        
        // Interval 5 menit (300.000 ms) untuk mencegah overload server
        const networkInterval = setInterval(checkNetworkHealth, 300000);
        
        return () => clearInterval(networkInterval);
    }, []);

    useEffect(() => {
        // Suntikkan atau cabut class 'dark' di elemen paling akar (HTML)
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const [devices, setDevices] = useState([]);
    const [activeDeviceId, setActiveDeviceId] = useState('');
    const [isFetching, setIsFetching] = useState(true);

    const navItems = [
        { id: 'status', label: 'Manajemen Device', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'send', label: 'Kirim Pesan', icon: <Send className="w-5 h-5" /> },
        { id: 'broadcast', label: 'Broadcast CSV', icon: <Megaphone className="w-5 h-5" /> },
        { id: 'schedule', label: 'Pesan Terjadwal', icon: <CalendarClock className="w-5 h-5" /> },
        { id: 'reminder', label: 'Pengingat Rutin', icon: <AlarmClock className="w-5 h-5" /> },
        { id: 'autoreply', label: 'Auto Reply', icon: <MessageSquareQuote className="w-5 h-5" /> },
        { id: 'groups', label: 'Daftar Grup', icon: <Users className="w-5 h-5" /> },
        { id: 'contact', label: 'Buku Kontak', icon: <Contact className="w-5 h-5" /> },
        { id: 'logs', label: 'Riwayat & Tarik Pesan', icon: <History className="w-5 h-5" /> },
        { id: 'apikey', label: 'API Key Integrasi', icon: <Key className="w-5 h-5" /> },
        ...(user?.role === 'admin' ? [{ id: 'users', label: 'Manajemen User', icon: <ShieldCheck className="w-5 h-5" /> }] : []),
        { id: 'account', label: 'Pengaturan Akun', icon: <User className="w-5 h-5" /> },
    ];

    const fetchGlobalDevices = async () => {
        try {
            const res = await axiosInstance.get('/devices/list');
            const fetchedDevices = res.data.data || [];
            setDevices(fetchedDevices);
            if (fetchedDevices.length > 0 && !activeDeviceId) {
                setActiveDeviceId(String(fetchedDevices[0].id)); 
            }
        } catch (error) {
            console.error("Gagal memuat device:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchGlobalDevices();
        const interval = setInterval(fetchGlobalDevices, 10000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        if (isFetching) return <div className="p-10 text-center text-slate-500 dark:text-slate-400 animate-pulse">Memuat sistem cerdas...</div>;

        const tabsNeedingDevice = ['send', 'broadcast', 'schedule', 'reminder', 'autoreply', 'groups', 'logs'];
        if (tabsNeedingDevice.includes(activeTab) && !activeDeviceId) {
            return (
                <div className="p-8 text-center bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-2xl border border-amber-200 dark:border-amber-800/30 shadow-sm">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-amber-400 dark:text-amber-500" />
                    <h3 className="text-lg font-bold mb-2">Pilih Device Terlebih Dahulu</h3>
                    <p className="text-sm">Silakan buat atau hidupkan Device di menu "Manajemen Device" agar dapat mengakses fitur ini.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'status': return <DeviceManager devices={devices} refreshDevices={fetchGlobalDevices} />;
            case 'send': return <SendMessage deviceId={activeDeviceId} />;
            case 'broadcast': return <BroadcastMessage deviceId={activeDeviceId} />;
            case 'schedule': return <ScheduleMessage deviceId={activeDeviceId} />;
            case 'reminder': return <ReminderManager deviceId={activeDeviceId} />;
            case 'autoreply': return <AutoReplyManager deviceId={activeDeviceId} />;
            case 'groups': return <GroupList deviceId={activeDeviceId} />;
            case 'contact': return <ContactManager />;
            case 'logs': return <MessageLogs deviceId={activeDeviceId} />;
            case 'apikey': return <ApiKeyManager />;
            case 'users': return <UserManager />;
            case 'account': return <AccountSettings />;
            default: return <DeviceManager devices={devices} refreshDevices={fetchGlobalDevices} />;
        }
    };

    return (
        // 🚨 Main wrapper sekarang mendukung warna dark:bg-slate-950
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
            
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR: Konsisten di mode Terang (Putih) dan mode Gelap (Slate-900) */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-2xl border-r border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500 dark:from-green-400 dark:to-emerald-500 flex items-center">
                            <Smartphone className="mr-2 text-emerald-500 dark:text-green-400 w-6 h-6" /> WA Gateway
                        </h1>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white rounded-lg dark:hover:bg-slate-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="relative">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name || user.username} 
                                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                                {user?.name || user?.username}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                                {user?.role || 'User'} • {user?.username}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                navigate(`/dashboard/${item.id}`);
                                setIsMobileMenuOpen(false); 
                            }}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                                activeTab === item.id 
                                    ? 'bg-emerald-600 dark:bg-green-600 text-white shadow-md shadow-emerald-600/20 dark:shadow-green-900/20' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-slate-100'
                            }`}
                        >
                            {item.icon}
                            <span className="ml-3 font-semibold text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Keluar Sistem
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col w-full h-screen overflow-hidden">
                
                {/* HEADER: Beradaptasi dengan mode gelap */}
                <header className="bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between shadow-sm z-10 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)} 
                            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 hidden sm:block lg:hidden">
                            WA Gateway
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                        {/* � CONNECTION HEALTH INDICATOR */}
                        <div 
                            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
                                networkStatus.isOnline 
                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400' 
                                    : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30 text-rose-700 dark:text-rose-400'
                            }`}
                            title={`${networkStatus.message} (${networkStatus.lastChecked})`}
                        >
                            <Activity className={`w-4 h-4 ${networkStatus.isOnline ? 'animate-pulse' : ''}`} />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">VPS Health</span>
                                <span className="text-xs font-bold">{networkStatus.latency}</span>
                            </div>
                        </div>

                        {/* �🌙 SAKLAR TOGGLE DARK MODE */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 dark:text-amber-400 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300"
                            title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold hidden sm:block">
                            Device Aktif:
                        </span>
                        <div className="relative">
                            <select 
                                className="appearance-none bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 block py-2 pl-3 pr-8 outline-none font-bold shadow-sm max-w-[140px] sm:max-w-[220px] truncate transition-all cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                value={activeDeviceId}
                                onChange={(e) => setActiveDeviceId(e.target.value)}
                            >
                                {devices.length === 0 && <option value="">Belum ada device</option>}
                                {devices.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} {d.status === 'CONNECTED' ? '🟢' : '🔴'}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-600 dark:text-emerald-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </header>

                {/* KONTEN UTAMA */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
                    <div className="max-w-6xl mx-auto w-full pb-20">
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-slate-100 mb-6 tracking-tight">
                            {navItems.find(item => item.id === activeTab)?.label}
                        </h2>
                        
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;