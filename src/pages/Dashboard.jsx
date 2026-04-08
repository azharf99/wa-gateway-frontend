import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MessageSquare, Send, Calendar, Clock, 
    Smartphone, Users, ShieldCheck, LogOut 
} from 'lucide-react';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';

import DeviceManager from '../components/DeviceManager';
import SendMessage from '../components/SendMessage';
import BroadcastMessage from '../components/BroadcastMessage';
import ScheduleMessage from '../components/ScheduleMessage';
import ReminderManager from '../components/ReminderManager';
import ContactManager from '../components/ContactManager';
import AutoReplyManager from '../components/AutoReplyManager';
import AccountSettings from '../components/AccountSettings';
import GroupList from '../components/GroupList';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('devices');
    const { logout } = useContext(AuthContext); // Ambil fungsi logout dari context
    const navigate = useNavigate();

    // STATE GLOBAL MULTI DEVICE
    const [devices, setDevices] = useState([]);
    const [activeDeviceId, setActiveDeviceId] = useState('');
    const [isFetching, setIsFetching] = useState(true);

    // ==========================================
    // MESIN PENCARI DATA GLOBAL (State Lifting)
    // ==========================================
    const fetchGlobalDevices = async () => {
        try {
            const res = await axiosInstance.get('/devices/list');
            const fetchedDevices = res.data.data || [];
            setDevices(fetchedDevices);
            
            // Otomatis pilih device pertama jika state activeDeviceId masih kosong
            if (fetchedDevices.length > 0 && !activeDeviceId) {
                // Gunakan String() karena value di tag <select> berupa string
                setActiveDeviceId(String(fetchedDevices[0].id)); 
            }
        } catch (error) {
            console.error("Gagal memuat device:", error);
        } finally {
            setIsFetching(false);
        }
    };

    // Jalankan saat pertama kali halaman direfresh & Polling setiap 10 detik
    useEffect(() => {
        fetchGlobalDevices();
        const interval = setInterval(fetchGlobalDevices, 10000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
    // Kita kosongkan array dependency agar interval tidak terus-terusan di-reset

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        if (isFetching) {
            return <div className="p-10 text-center text-gray-500">Memuat data sistem...</div>;
        }

        if (activeTab !== 'devices' && activeTab !== 'account' && !activeDeviceId) {
            return (
                <div className="p-10 text-center bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                    <h3 className="text-lg font-bold mb-2">Belum Ada Device Aktif</h3>
                    <p>Silakan buat atau pilih Device di menu "Manajemen Device" terlebih dahulu.</p>
                </div>
            );
        }

        switch (activeTab) {
            // Oper data devices dan fungsi fetch-nya ke DeviceManager!
            case 'devices': return <DeviceManager devices={devices} refreshDevices={fetchGlobalDevices} />;
            case 'send': return <SendMessage deviceId={activeDeviceId} />;
            case 'broadcast': return <BroadcastMessage deviceId={activeDeviceId} />;
            case 'schedule': return <ScheduleMessage deviceId={activeDeviceId} />;
            case 'reminder': return <ReminderManager deviceId={activeDeviceId} />;
            case 'autoreply': return <AutoReplyManager deviceId={activeDeviceId} />;
            case 'groups': return <GroupList deviceId={activeDeviceId} />;
            case 'contacts': return <ContactManager />;
            case 'account': return <AccountSettings />;
            default: return <DeviceManager devices={devices} refreshDevices={fetchGlobalDevices} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* SIDEBAR BAPAK TETAP SAMA */}
            <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
                <div className="p-6 bg-slate-950 border-b border-slate-800">
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        WA Gateway
                    </h2>
                    <p className="text-slate-400 text-xs mt-1 font-medium">SMAS IT Al Binaa</p>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                    <button onClick={() => setActiveTab('devices')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'devices' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Smartphone className="w-5 h-5 mr-3" /> Manajemen Device</button>
                    <button onClick={() => setActiveTab('send')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'send' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Send className="w-5 h-5 mr-3" /> Kirim Pesan</button>
                    <button onClick={() => setActiveTab('broadcast')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'broadcast' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><MessageSquare className="w-5 h-5 mr-3" /> Broadcast CSV</button>
                    <button onClick={() => setActiveTab('schedule')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'schedule' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Clock className="w-5 h-5 mr-3" /> Pesan Terjadwal</button>
                    <button onClick={() => setActiveTab('reminder')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'reminder' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Calendar className="w-5 h-5 mr-3" /> Pengingat Rutin</button>
                    <button onClick={() => setActiveTab('autoreply')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'autoreply' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><MessageSquare className="w-5 h-5 mr-3" /> Auto Reply</button>
                    <button onClick={() => setActiveTab('groups')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'groups' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Users className="w-5 h-5 mr-3" /> Daftar Grup</button>
                    <button onClick={() => setActiveTab('contacts')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'contacts' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Users className="w-5 h-5 mr-3" /> Buku Kontak</button>
                    <button onClick={() => setActiveTab('account')} className={`flex items-center w-full px-6 py-3 text-left transition-all ${activeTab === 'account' ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><ShieldCheck className="w-5 h-5 mr-3" /> Keamanan Akun</button>
                </nav>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER DENGAN SWITCHER DAN TOMBOL LOGOUT */}
                <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-0">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium hidden md:block">Device Aktif:</span>
                        <select 
                            className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-bold shadow-sm min-w-[200px]"
                            value={activeDeviceId}
                            onChange={(e) => setActiveDeviceId(e.target.value)}
                        >
                            {devices.length === 0 && <option value="">Tidak ada device</option>}
                            {devices.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.name} {d.status === 'CONNECTED' ? '(🟢)' : '(🔴)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TOMBOL LOGOUT BARU */}
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-6 md:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;