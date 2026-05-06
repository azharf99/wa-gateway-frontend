import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, Trash2, QrCode, Power, PowerOff, RefreshCw } from 'lucide-react';
import axiosInstance from '../api/axios';

// TERIMA PROPS DARI DASHBOARD
const DeviceManager = ({ devices, refreshDevices }) => {
    const [qrCode, setQrCode] = useState({ show: false, data: '', deviceId: null });
    const [newDeviceName, setNewDeviceName] = useState('');

    const addDevice = async (e) => {
        e.preventDefault();
        if (!newDeviceName) return;
        try {
            await axiosInstance.post('/devices/add', { name: newDeviceName, phone: '' });
            setNewDeviceName('');
            refreshDevices(); // Panggil fungsi refresh milik Dashboard
        } catch (error) {
            alert("Gagal menambah device: " + error.response?.data?.message);
        }
    };

    const toggleConnection = async (id, currentStatus) => {
        try {
            if (currentStatus === 'CONNECTED') {
                await axiosInstance.post(`/devices/disconnect?id=${id}`);
            } else {
                await axiosInstance.post(`/devices/connect?id=${id}`);
            }
            refreshDevices(); // Panggil fungsi refresh milik Dashboard
        } catch (error) {
            alert("Gagal merubah status koneksi");
        }
    };

    const showQR = async (id) => {
        const targetDevice = devices.find(d => d.id === id);
        if (targetDevice && targetDevice.status === 'DISCONNECTED') {
            await axiosInstance.post(`/devices/connect?id=${id}`);
            refreshDevices(); 
        }
        setQrCode({ show: true, data: '', deviceId: id });
    };

    const deleteDevice = async (id) => {
        if (!window.confirm("Yakin ingin menghapus device ini?")) return;
        try {
            await axiosInstance.delete(`/devices/delete?id=${id}`);
            refreshDevices();
        } catch (error) {
            alert("Gagal menghapus device");
        }
    };

    // EFEK POLLING QR (Hanya berjalan jika modal QR terbuka)
    useEffect(() => {
        let interval;
        if (qrCode.show && qrCode.deviceId) {
            interval = setInterval(async () => {
                try {
                    const res = await axiosInstance.get(`/devices/qr?id=${qrCode.deviceId}`);
                    if (res.data.data) {
                        setQrCode(prev => ({ ...prev, data: res.data.data }));
                    } else if (res.data.message === "Device sudah terhubung") {
                        setQrCode({ show: false, data: '', deviceId: null });
                        refreshDevices(); // Auto refresh saat scan sukses
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.log("Menunggu QR code...");
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrCode.show, qrCode.deviceId]);

    return ( 
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
                        <Smartphone className="mr-2 text-indigo-500 w-6 h-6" /> Manajemen Device
                    </h2>
                    <form onSubmit={addDevice} className="flex gap-2 w-full sm:w-auto">
                        <input 
                            type="text" 
                            placeholder="Nama Device (ex: CS Utama)" 
                            className="px-4 py-2 border border-gray-300 text-gray-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
                            value={newDeviceName}
                            onChange={(e) => setNewDeviceName(e.target.value)}
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center shrink-0">
                            <Plus className="w-4 h-4 mr-1" /> Tambah
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {devices.map(d => (
                        <div key={d.id} className="border border-gray-200 dark:border-slate-800 rounded-xl p-5 relative bg-white dark:bg-slate-900 hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100">{d.name}</h3>
                                    <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">ID: {d.id}</p>
                                    <p className="text-sm text-gray-500 font-mono">{d.phone || 'Menunggu scan QR...'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                    d.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                                    d.status === 'CONNECTING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    'bg-rose-100 text-rose-700 border border-rose-200'
                                }`}>
                                    {d.status === 'CONNECTING' ? 'MENUNGGU QR' : d.status}
                                </span>
                            </div>

                            <div className="mt-auto flex gap-2 justify-between border-t border-gray-100 pt-4">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => toggleConnection(d.id, d.status)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors ${
                                            d.status === 'CONNECTED' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        }`}
                                    >
                                        {d.status === 'CONNECTED' ? <><PowerOff className="w-4 h-4 mr-1.5"/> Matikan</> : <><Power className="w-4 h-4 mr-1.5"/> Hidupkan</>}
                                    </button>
                                    
                                    {d.status !== 'CONNECTED' && (
                                        <button onClick={() => showQR(d.id)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center transition-colors">
                                            <QrCode className="w-4 h-4 mr-1.5"/> Scan QR
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => deleteDevice(d.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {devices.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                            <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-gray-500 font-medium">Belum ada device yang ditambahkan</h3>
                            <p className="text-gray-400 text-sm mt-1">Gunakan form di atas untuk membuat device pertama Anda.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL SCAN QR */}
            {qrCode.show && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full">
                        <div className="bg-indigo-100 p-3 rounded-full mb-4">
                            <QrCode className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 dark:text-slate-100 mb-1">Scan QR Code</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">Buka WhatsApp di HP Anda &rarr; Perangkat Tertaut &rarr; Tautkan Perangkat</p>
                        
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full flex justify-center min-h-[260px]">
                            {qrCode.data ? (
                                <img src={qrCode.data} alt="WhatsApp QR" className="w-56 h-56 rounded-lg mix-blend-multiply" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-400" />
                                    <p className="text-sm font-medium">Menghasilkan QR...</p>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => setQrCode({ show: false, data: '', deviceId: null })} 
                            className="mt-6 w-full py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceManager;