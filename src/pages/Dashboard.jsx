import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Smartphone, Users, Send, Contact, User, Key, AlarmClock, CalendarClock, Megaphone, Menu, MessageSquareQuote } from 'lucide-react';

import DeviceStatus from '../components/DeviceStatus';
import GroupList from '../components/GroupList';
import SendMessage from '../components/SendMessage';
import ScheduleMessage from '../components/ScheduleMessage';
import BroadcastMessage from '../components/BroadcastMessage';
import ContactManager from '../components/ContactManager';
import ReminderManager from '../components/ReminderManager';
import AccountSettings from '../components/AccountSettings';
import ApiKeyManager from '../components/ApiKeyManager';
import AutoReplyManager from '../components/AutoReplyManager';


const Dashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('status');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'status', label: 'Status Device', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'account', label: 'Pengaturan Akun', icon: <User className="w-5 h-5" /> },
        { id: 'apikey', label: 'API Key', icon: <Key className="w-5 h-5" /> }, // Item menu baru
        { id: 'send', label: 'Kirim Pesan', icon: <Send className="w-5 h-5" /> },
        { id: 'autoreply', label: 'Auto Reply', icon: <MessageSquareQuote className="w-5 h-5" /> },
        { id: 'contact', label: 'Kontak', icon: <Contact className="w-5 h-5" /> },
        { id: 'reminder', label: 'Reminder', icon: <AlarmClock className="w-5 h-5" /> },
        { id: 'schedule', label: 'Jadwal Pesan', icon: <CalendarClock className="w-5 h-5" /> },
        { id: 'broadcast', label: 'Broadcast', icon: <Megaphone className="w-5 h-5" /> },
        { id: 'groups', label: 'Daftar Grup', icon: <Users className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'status': return <DeviceStatus />;
            case 'account': return <AccountSettings />;
            case 'apikey': return <ApiKeyManager />; // Render komponen API Key
            case 'contact': return <ContactManager />;
            case 'reminder': return <ReminderManager />;
            case 'autoreply': return <AutoReplyManager />;
            case 'groups': return <GroupList />;
            case 'send': return <SendMessage />;         
            case 'schedule': return <ScheduleMessage />; 
            case 'broadcast': return <BroadcastMessage />; 
            default: return <DeviceStatus />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar (Desktop) */}
            <aside className={`bg-slate-900 text-slate-300 w-64 flex-shrink-0 hidden md:flex flex-col`}>
                <div className="p-6">
                    <h1 className="text-xl font-bold text-white tracking-wider flex items-center">
                        <Smartphone className="mr-2 text-green-400" /> WA Gateway
                    </h1>
                    <p className="text-sm text-white">{user.username}</p>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                                activeTab === item.id 
                                    ? 'bg-green-600 text-white font-medium' 
                                    : 'hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header (Mobile) */}
                <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden">
                    <h1 className="text-lg font-bold text-gray-800 flex items-center">
                        <Smartphone className="mr-2 text-green-500" /> WA Gateway
                    </h1>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </header>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="bg-slate-900 text-white p-4 md:hidden">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center px-4 py-3 rounded-lg mb-1"
                            >
                                {item.icon} <span className="ml-3">{item.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {navItems.find(item => item.id === activeTab)?.label}
                        </h2>
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;