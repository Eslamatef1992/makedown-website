import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('md_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, try one silent refresh using the stored refresh token before
// giving up — keeps the user logged in across access-token expiry.
let refreshingPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('md_refresh_token');
      if (!refreshToken) return Promise.reject(error);

      try {
        if (!refreshingPromise) {
          refreshingPromise = axios
            .post(`${baseURL}/auth/refresh`, { refreshToken })
            .finally(() => {
              refreshingPromise = null;
            });
        }
        const { data } = await refreshingPromise;
        localStorage.setItem('md_access_token', data.data.accessToken);
        localStorage.setItem('md_refresh_token', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return client(original);
      } catch (refreshError) {
        localStorage.removeItem('md_access_token');
        localStorage.removeItem('md_refresh_token');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
