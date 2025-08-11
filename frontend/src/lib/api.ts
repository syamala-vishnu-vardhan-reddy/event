import axios from "axios";

const API = axios.create({
  baseURL: "https://event-nmfv.onrender.com",
  withCredentials: true, // optional if backend needs cookies
});

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
