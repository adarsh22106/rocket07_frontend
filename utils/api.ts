import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('delivery_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth APIs
export const authAPI = {
  signup: (data: { name: string; phone: string; password: string }) =>
    api.post('/auth/signup', data),
  
  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),
};

// Order APIs
export const orderAPI = {
  createOrder: (data: {
    name: string;
    phone: string;
    address: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    transaction_id: string;
    user_id?: string;
  }) => api.post('/orders', data),
  
  getOrders: (userId?: string) =>
    api.get('/orders', {
      params: userId ? { user_id: userId } : {},
    }),
  
  getOrder: (orderId: string) => 
    api.get(`/orders/${orderId}`),
};

// Config APIs
export const configAPI = {
  getConfig: () => api.get('/config'),
};

export default api;