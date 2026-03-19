import axios from 'axios';

// In production (Railway), frontend and backend are on the same domain
// so we use relative URLs. In development, Vite proxy handles /api -> localhost:5000
const baseURL = import.meta.env.VITE_API_URL || '';

axios.defaults.baseURL = baseURL;

export default axios;
