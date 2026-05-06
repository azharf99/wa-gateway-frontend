import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance, { setAccessToken } from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateToken = (newToken, userData = null) => {
        setTokenState(newToken);
        setAccessToken(newToken);
        
        if (userData) {
            setUser(userData);
        } else if (newToken) {
            try {
                const decoded = jwtDecode(newToken);
                // Normalisasi data user agar selalu punya field .id
                const normalizedUser = {
                    ...decoded,
                    id: decoded.id || decoded.user_id || decoded.sub,
                };
                setUser(normalizedUser);
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
                const { access_token, user: userData } = res.data.data;
                updateToken(access_token, userData);
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
            const { access_token, user: userData } = res.data.data;
            
            setTokenState(access_token);
            setAccessToken(access_token);
            setUser(userData); // Gunakan data user langsung dari response
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Koneksi ke server gagal' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axiosInstance.post('/auth/register', userData);
            const data = res.data.data;
            
            if (data?.access_token) {
                setTokenState(data.access_token);
                setAccessToken(data.access_token);
                if (data.user) {
                    setUser(data.user);
                } else {
                    try {
                        const decoded = jwtDecode(data.access_token);
                        setUser(decoded);
                    } catch (e) {}
                }
            }
            return { success: true, message: res.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registrasi gagal' };
        }
    };

    const googleLogin = async (googleToken) => {
        try {
            const res = await axiosInstance.post('/auth/google', { token: googleToken });
            const { access_token, user: userData } = res.data.data;
            
            setTokenState(access_token);
            setAccessToken(access_token);
            setUser(userData); // Gunakan data user langsung dari response
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Google Login gagal' };
        }
    };

    const updateUser = (newUserData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...newUserData
        }));
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
        <AuthContext.Provider value={{ token, user, login, register, googleLogin, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};