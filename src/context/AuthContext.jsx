import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Tambahkan ini
import axiosInstance, { setAccessToken } from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(null);
    const [user, setUser] = useState(null); // Tambahkan state user
    const [loading, setLoading] = useState(true);

    // Helper untuk update state React sekaligus decode data user
    const updateToken = (newToken) => {
        setTokenState(newToken);
        setAccessToken(newToken);
        
        if (newToken) {
            try {
                const decoded = jwtDecode(newToken);
                setUser(decoded); // Ekstrak payload dari token
            } catch (error) {
                console.error("Gagal mendecode token", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    // LISTENER: Menangkap update token dari axios.js secara otomatis
    useEffect(() => {
        const handleBackgroundRefresh = (e) => {
            const newToken = e.detail;
            updateToken(newToken);
        };

        window.addEventListener('onTokenRefreshed', handleBackgroundRefresh);
        return () => window.removeEventListener('onTokenRefreshed', handleBackgroundRefresh);
    }, []);

    // SILENT LOGIN
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await axiosInstance.post('/auth/refresh');
                updateToken(res.data.data.access_token);
            } catch (error) {
                updateToken(null);
            } finally {
                setLoading(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500 font-medium flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    Memeriksa sesi keamanan...
                </div>
            </div>
        );
    }

    return (
        // Jangan lupa masukkan user ke dalam value
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};