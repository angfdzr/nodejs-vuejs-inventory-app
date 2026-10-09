import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true // wajib true, karena backend pakai express-session (cookie)
});

export default api;