import api, { setCsrfToken } from './api.js';

export async function loginWithGoogle(credential) {
  const { data } = await api.post('/auth/google', { credential });
  setCsrfToken(data.csrfToken);
  return data.user;
}

/** Returns the current user, or null when there is no valid session. */
export async function fetchCurrentUser() {
  try {
    const { data } = await api.get('/auth/me');
    setCsrfToken(data.csrfToken);
    return data.user;
  } catch (err) {
    if (err.response?.status === 401) return null;
    throw err;
  }
}

export async function logoutRequest() {
  try {
    await api.post('/auth/logout');
  } finally {
    setCsrfToken(null);
  }
}
