import React, { createContext, useState, useEffect } from 'react';
import axiosInstance, { setAccessToken } from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(null);
    const [loading, setLoading] = useState(true); // Loading saat Silent Login berjalan

    // Helper untuk update state React sekaligus update Axios memory
    const updateToken = (newToken) => {
        setTokenState(newToken);
        setAccessToken(newToken);
    };

    // SILENT LOGIN: Berjalan sekali saat web pertama kali dibuka/di-refresh
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Mencoba mendapatkan Access Token baru menggunakan Cookie
                const res = await axiosInstance.post('/auth/refresh');
                updateToken(res.data.data.access_token);
            } catch (error) {
                // Jika gagal (belum login atau cookie kedaluwarsa), pastikan state bersih
                updateToken(null);
            } finally {
                setLoading(false); // Selesai loading, tampilkan UI
            }
        };
        
        checkSession();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axiosInstance.post('/auth/login', { username, password });
            updateToken(res.data.data.access_token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Koneksi ke server gagal' };
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error("Gagal logout di server", error);
        } finally {
            updateToken(null);
            window.location.href = '/login';
        }
    };

    // Jangan render App dulu sebelum Silent Login selesai mengecek sesi
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500 font-medium">Memeriksa sesi keamanan...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};