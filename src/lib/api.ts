// API configuration
// const API_BASE_URL = 'http://34.207.145.254'
const API_BASE_URL = 'http://35.174.214.46'
// const API_BASE_URL = 'http://localhost:3000'


export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  },
  TURFS: `${API_BASE_URL}/api/turfs`,
  PLAYERS: `${API_BASE_URL}/api/players`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
};

// Common fetch wrapper with proper headers
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  // If url doesn't start with http, prepend base URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Debug logging
  console.log('🚀 API Request:', {
    url: fullUrl,
    method: config.method || 'GET',
    hasToken: !!token,
    token: token ? `${token.substring(0, 20)}...` : null,
    headers: config.headers
  });
  
  const response = await fetch(fullUrl, config);
  
  console.log('📡 API Response:', {
    url: fullUrl,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  
  return response;
};