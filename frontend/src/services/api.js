import axios from 'axios';

export const AUTH_EXPIRED_EVENT = 'mediscan:auth-expired';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // session cookie
  timeout: 60_000,
});

// CSRF token is kept in memory only (never localStorage); it is re-fetched from /auth/me on load.
let csrfToken = null;
export const setCsrfToken = (token) => {
  csrfToken = token ?? null;
};

api.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (csrfToken && !['get', 'head', 'options'].includes(method)) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

const SILENT_401 = ['/auth/me', '/auth/google'];

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    if (status === 401 && !SILENT_401.some((p) => url.includes(p))) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

/** Convert any thrown error into a safe, user-presentable object. */
export function toApiError(error) {
  if (error?.response?.data?.message) {
    const { message, code, details } = error.response.data;
    return { message, code, details: Array.isArray(details) ? details : [], status: error.response.status };
  }
  if (error?.code === 'ECONNABORTED') {
    return { message: 'The request took too long. Please try again.', code: 'TIMEOUT', details: [] };
  }
  if (error?.request || error?.code === 'ERR_NETWORK') {
    return { message: 'Cannot reach the server. Check your connection and try again.', code: 'NETWORK', details: [] };
  }
  return { message: 'Something went wrong. Please try again.', code: 'UNKNOWN', details: [] };
}

export default api;
