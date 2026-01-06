import axios from 'axios';

const getBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!envUrl) return 'http://localhost:3000';
    if (envUrl.startsWith('http')) return envUrl;
    return `https://${envUrl}`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
