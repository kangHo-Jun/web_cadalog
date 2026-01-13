import axios from 'axios';
import { getTokens, refreshAccessToken } from './cafe24-auth';

const apiClient = axios.create({
    baseURL: `https://${process.env.MALL_ID}.cafe24api.com/api/v2/admin`,
    headers: {
        'Content-Type': 'application/json',
        'X-Cafe24-Api-Version': '2025-12-01',
    },
});

// Request Interceptor: Add access token to headers
apiClient.interceptors.request.use((config) => {
    const { access_token } = getTokens();
    if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
});

// Response Interceptor: Handle 401 and refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                console.log('401 detected, attempting token refresh...');
                const newAccessToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed, redirecting or handling error...');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
