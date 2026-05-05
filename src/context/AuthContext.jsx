import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance, { setAccessToken } from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateToken = (newToken) => {
        setTokenState(newToken);
        setAccessToken(newToken);
        
        if (newToken) {
            try {
                const decoded = jwtDecode(newToken);
                setUser(decoded);
            } catch (error) {
                console.error("Gagal mendecode token", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        const handleBackgroundRefresh = (e) => {
            const newToken = e.detail;
            updateToken(newToken);
        };

        window.addEventListener('onTokenRefreshed', handleBackgroundRefresh);
        return () => window.removeEventListener('onTokenRefreshed', handleBackgroundRefresh);
    }, []);

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

    const login = async (identifier, password, recaptcha_token) => {
        try {
            const res = await axiosInstance.post('/auth/login', { identifier, password, recaptcha_token });
            updateToken(res.data.data.access_token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Koneksi ke server gagal' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axiosInstance.post('/auth/register', userData);
            // Registration might log the user in automatically or require manual login
            // Assuming backend returns token on success or user needs to login
            if (res.data.data?.access_token) {
                updateToken(res.data.data.access_token);
            }
            return { success: true, message: res.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registrasi gagal' };
        }
    };

    const googleLogin = async (googleToken) => {
        try {
            const res = await axiosInstance.post('/auth/google', { token: googleToken });
            updateToken(res.data.data.access_token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Google Login gagal' };
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
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
                <div className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    Memeriksa sesi keamanan...
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ token, user, login, register, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};