import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, CheckCircle, XCircle, RefreshCw, QrCode, Unplug } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axiosInstance from '../api/axios';

const DeviceStatus = () => {
    const [status, setStatus] = useState('checking');
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    
    const pollingInterval = useRef(null);

    const checkStatusAndQR = async () => {
        setLoading(true);
        try {
            const resStatus = await axiosInstance.get('/whatsapp/status');
            const currentState = resStatus.data.data.state;
            setStatus(currentState);

            if (currentState === 'disconnected') {
                const resQr = await axiosInstance.get('/whatsapp/qr');
                setQrCode(resQr.data.data.qr_code);
            } else {
                setQrCode('');
                stopPolling();
            }
        } catch (error) {
            setStatus('disconnected');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi baru untuk Disconnect
    const handleDisconnect = async () => {
        const confirmDisconnect = window.confirm("Apakah Anda yakin ingin memutuskan koneksi perangkat ini? Anda harus melakukan scan QR Code ulang jika ingin menghubungkannya kembali.");
        
        if (!confirmDisconnect) return;

        setDisconnecting(true);
        try {
            await axiosInstance.post('/whatsapp/logout');
            // Langsung panggil pengecekan status agar UI berubah ke mode QR Code
            await checkStatusAndQR();
        } catch (error) {
            alert("Gagal memutuskan koneksi: " + (error.response?.data?.message || error.message));
        } finally {
            setDisconnecting(false);
        }
    };

    const startPolling = () => {
        if (!pollingInterval.current) {
            pollingInterval.current = setInterval(() => {
                checkStatusAndQR();
            }, 3000);
        }
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    };

    useEffect(() => {
        checkStatusAndQR();
        return () => stopPolling();
    }, []);

    useEffect(() => {
        if (status === 'disconnected') {
            startPolling();
        } else {
            stopPolling();
        }
    }, [status]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Smartphone className="mr-2 text-blue-500" /> Pengaturan Perangkat
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Panel Kiri: Status Koneksi */}
                <div className="flex-1 bg-gray-50 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-gray-100">
                    {status === 'connected' ? (
                        <div className="bg-green-100 p-4 rounded-full mb-4">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        </div>
                    ) : (
                        <div className="bg-red-100 p-4 rounded-full mb-4">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                    )}
                    
                    <h3 className="text-lg font-medium text-gray-700">Status Gateway</h3>
                    <p className={`text-2xl font-bold mt-1 capitalize ${status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                        {status === 'checking' ? 'Memeriksa...' : status}
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={checkStatusAndQR}
                            disabled={loading || disconnecting}
                            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Status
                        </button>

                        {/* Tombol Disconnect: Hanya muncul saat status connected */}
                        {status === 'connected' && (
                            <button 
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                className="flex items-center justify-center px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <Unplug className={`w-4 h-4 mr-2 ${disconnecting ? 'animate-pulse' : ''}`} />
                                {disconnecting ? 'Memutuskan...' : 'Putuskan Koneksi'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Panel Kanan: Area QR Code */}
                {status === 'disconnected' && (
                    <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 flex flex-col items-center shadow-inner">
                        <div className="w-full flex items-center text-gray-600 mb-4 font-medium">
                            <QrCode className="w-5 h-5 mr-2" /> 
                            Tautkan Perangkat
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 flex justify-center items-center min-h-[250px] w-full">
                            {qrCode ? (
                                <QRCodeSVG value={qrCode} size={220} />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                                    <p className="text-sm">Memuat QR Code...</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-sm text-gray-500 w-full">
                            <ol className="list-decimal pl-5 space-y-1">
                                <li>Buka WhatsApp di HP Anda</li>
                                <li>Pilih menu <strong>Tautkan Perangkat</strong></li>
                                <li>Arahkan kamera ke QR Code di atas</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeviceStatus;