import React, { useState, useEffect } from 'react';
import { Key, Copy, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../api/axios';

const ApiKeyManager = () => {
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [copied, setCopied] = useState(false);

    // Ambil API Key saat komponen dimuat
    useEffect(() => {
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/auth/api-key');
            if (response.data.status === 'success') {
                setApiKey(response.data.data.api_key);
            }
        } catch (error) {
            showAlert('error', 'Gagal memuat API Key.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!window.confirm('Apakah Anda yakin ingin melakukan regenerate API Key? Key yang lama tidak akan bisa digunakan lagi oleh aplikasi yang terhubung.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/api-key/regenerate');
            if (response.data.status === 'success') {
                setApiKey(response.data.data.api_key);
                showAlert('success', 'API Key berhasil diperbarui.');
            }
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Gagal meregenerate API Key.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: '', message: '' }), 4000);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
            <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <Key className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Manajemen API Key</h2>
                    <p className="text-sm text-gray-500">Gunakan API Key ini untuk mengintegrasikan layanan backend lain ke WA Gateway tanpa perlu login.</p>
                </div>
            </div>

            {alert.message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center ${alert.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {alert.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {alert.message}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secret API Key Saat Ini</label>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                readOnly
                                value={apiKey || 'Memuat...'}
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-mono text-sm focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={handleCopy}
                            disabled={!apiKey}
                            className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center"
                            title="Copy to clipboard"
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Peringatan:</strong> Jika Anda melakukan regenerate, pastikan Anda segera memperbarui API Key di semua aplikasi yang saat ini terhubung ke WA Gateway ini.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Memproses...' : 'Regenerate API Key'}
                </button>
            </div>
        </div>
    );
};

export default ApiKeyManager;