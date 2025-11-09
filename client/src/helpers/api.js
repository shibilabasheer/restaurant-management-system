import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', 
  withCredentials: false,
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete API.defaults.headers.common.Authorization;
    localStorage.removeItem('token');
  }
};

const existing = localStorage.getItem('token');
if (existing) {
  API.defaults.headers.common.Authorization = `Bearer ${existing}`;
}

export default API;
