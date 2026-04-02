import axios from 'axios';

const BASE_URL = 'http://localhost:8003/api/v1';

// PENANGKAL XSS: Token disimpan di memori private (closure)
let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, 
});

// Interceptor Request
axiosInstance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor Response
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ========================================================
        // 🚨 PERBAIKAN FATAL: CEGAH INFINITE LOOP
        // Jika request yang gagal (401) adalah endpoint /refresh,
        // tolak langsung error-nya ke pemanggil (AuthContext) 
        // dan JANGAN proses logika retry di bawah.
        // ========================================================
        if (originalRequest.url.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        // Jika error 401 terjadi pada endpoint LAIN (misal saat ngirim pesan)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Gunakan axios BUKAN axiosInstance agar tidak masuk interceptor lagi
                const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                const newAccessToken = res.data.data.access_token;
                
                setAccessToken(newAccessToken); 
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                
                // Ulangi request aslinya dengan token baru
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Jika refresh token juga expired (misal setelah 7 hari tidak buka aplikasi)
                setAccessToken(null);
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;