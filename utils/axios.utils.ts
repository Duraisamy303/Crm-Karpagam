'use client';
import axios from 'axios';

export const createApiInstance = () => {
    let baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    const api = axios.create({
        baseURL,
    });

    let refreshPromise = null;

    const getAccessToken = () => localStorage.getItem('kaheToken');
    const getkaheRefreshToken = () => localStorage.getItem('kaheRefreshToken');
    const setAccessToken = (token) => localStorage.setItem('kaheToken', token);
    const setkaheRefreshToken = (token) => localStorage.setItem('kaheRefreshToken', token);
    const clearTokens = () => {
        localStorage.removeItem('kaheToken');
        localStorage.removeItem('kaheRefreshToken');
    };

    const redirectToLogin = () => {
        const role = (typeof window !== 'undefined' ? (localStorage.getItem('role') || localStorage.getItem('crmRole') || '') : '').toLowerCase();
        if (role === 'counsellor' || role === 'telecaller') {
            console.warn('Suppressing redirect to login for role:', role);
            return;
        }
        clearTokens();
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth/signin') {
            window.location.href = '/auth/signin';
        }
    };
    const kaheRefreshToken = () => {
        if (!refreshPromise) {
            refreshPromise = new Promise((resolve, reject) => {
                const kaheRefreshToken = getkaheRefreshToken();
                console.log('Stored kaheRefreshToken:', kaheRefreshToken);

                if (!kaheRefreshToken) {
                    console.log('No refresh token found. Redirecting to login...');
                    const role = (typeof window !== 'undefined' ? (localStorage.getItem('role') || localStorage.getItem('crmRole') || '') : '').toLowerCase();
                    if (role === 'counsellor' || role === 'telecaller') {
                        reject('No refresh token for role ' + role);
                        return;
                    }
                    clearAuthData();
                    redirectToLogin();
                    reject('No refresh token');
                    return;
                }

                axios
                    .post(`${baseURL}token/refresh/`, { refresh: kaheRefreshToken })
                    .then((response) => {
                        console.log('Refresh token response:', response.data);

                        setAccessToken(response.data.access);
                        setkaheRefreshToken(response.data.refresh);

                        resolve(response.data.access);
                    })
                    .catch((error) => {
                        const role = (typeof window !== 'undefined' ? (localStorage.getItem('role') || localStorage.getItem('crmRole') || '') : '').toLowerCase();
                        if (role === 'counsellor' || role === 'telecaller') {
                            reject(error);
                            return;
                        }
                        if (error.response) {
                            console.error('Refresh token failed:', error.response.data);

                            if (error.response.data.code === 'token_not_valid') {
                                console.log('Token expired. Logging out...');
                                clearAuthData();
                                redirectToLogin();
                            }
                        } else if (error.request) {
                            console.error('No response received:', error.request);
                        } else {
                            console.error('Error setting up request:', error.message);
                        }

                        reject(error);
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            });
        }

        return refreshPromise;
    };

    const clearAuthData = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('kaheRefreshToken');
    };

    api.interceptors.request.use(
        (config) => {
            const token = getAccessToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const originalRequest = error.config;
            const isAuthEndpoint = originalRequest?.url?.includes('login') || originalRequest?.url?.includes('token/refresh');

            if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
                originalRequest._retry = true;

                const role = (typeof window !== 'undefined' ? (localStorage.getItem('role') || localStorage.getItem('crmRole') || '') : '').toLowerCase();
                if (role === 'counsellor' || role === 'telecaller') {
                    console.warn('API returned 401 for role:', role, '- suppressing refresh/logout');
                    return Promise.reject(error);
                }

                return kaheRefreshToken()
                    .then((newAccessToken) => {
                        if (!newAccessToken) {
                            redirectToLogin();
                            return Promise.reject('Failed to refresh token');
                        }
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        if (role === 'counsellor' || role === 'telecaller') {
                            return Promise.reject(err);
                        }
                        redirectToLogin();
                        return Promise.reject(err);
                    });
            }

            return Promise.reject(error);
        }
    );

    return api;
};

export default createApiInstance;

// import axios from 'axios';

// export const instance = () => {
//   const data = axios.create({
//     baseURL: 'http://121.200.52.133:8000/api/',

//   });

//   data.interceptors.request.use(async function (config) {
//     const accessToken = localStorage.getItem('kaheToken');
//     if (accessToken) {
//       config.headers['authorization'] = `Bearer ${accessToken}`;
//     }
//     return config;
//   });

//   return data;
// };

// export default instance;x
