import axios from 'axios';
import { API_BASE_URL } from '../config/AppConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Better error messages for network failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check your internet connection and try again.';
    } else if (!error.response) {
      error.message = 'Unable to connect to server. Make sure the backend is running and your device is on the same network.';
    }
    return Promise.reject(error);
  },
);

// ─── Auth APIs ──────────────────────────────────────────────
export const loginUser = (email, password) =>
  api.post('login', { email, password });

export const registerUser = (name, email, password, phone, address) =>
  api.post('register', { name, email, password, phone, address });

export const getProfile = (userId) => api.get(`profile/${userId}`);

// ─── Catalog APIs ───────────────────────────────────────────
export const getCategories = () => api.get('categories');

export const getMenuItems = (params = {}) =>
  api.get('menu', { params });

export const getMenuItem = (id) => api.get(`menu/${id}`);

// ─── Order & Checkout APIs ──────────────────────────────────
export const checkout = (data) => api.post('checkout', data);

export const verifyPayment = (data) => api.post('verify-payment', data);

export const getUserOrders = (userId) =>
  api.get(`orders/user/${userId}`);

export const getOrderDetails = (orderId) =>
  api.get(`orders/${orderId}`);

// ─── Table Booking APIs ─────────────────────────────────────
export const getTables = () => api.get('tables');

export const createBooking = (data) => api.post('bookings', data);

export const getUserBookings = (userId) =>
  api.get(`bookings/user/${userId}`);

export const cancelBooking = (bookingId) =>
  api.post(`bookings/${bookingId}/cancel`);

// ─── Address APIs ───────────────────────────────────────────
export const getUserAddresses = (userId) =>
  api.get(`addresses/user/${userId}`);

export const storeAddress = (data) => api.post('addresses', data);

export const deleteAddress = (id) => api.delete(`addresses/${id}`);

// ─── Feedback API ───────────────────────────────────────────
export const submitFeedback = (data) => api.post('feedback', data);

// ─── Chatbot API ────────────────────────────────────────────
export const sendChatbotMessage = (message) => api.post('chat', { message });

export default api;
