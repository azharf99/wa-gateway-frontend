import axios from 'axios';

const BASE_URL = '/api'; // Pastikan ini sesuai dengan prefix route backend kamu

let accessToken = null;
let isRefreshing = false; // Flag status refresh
let failedQueue = []; // Antrean untuk menahan request yang barengan

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

        if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Jika SEDANG refresh token, masukkan request ini ke antrean (Queue)
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Proses Refresh Token
                const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                const newAccessToken = res.data.data.access_token;
                
                setAccessToken(newAccessToken); 
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                
                // BERITAHU REACT SECARA BACKGROUND BAHWA TOKEN SUDAH BARU
                window.dispatchEvent(new CustomEvent('onTokenRefreshed', { detail: newAccessToken }));
                
                processQueue(null, newAccessToken); // Bebaskan semua antrean
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                setAccessToken(null);
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;