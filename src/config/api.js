// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://atc-01006996439-production.up.railway.app/api'
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  
  EVENTS: {
    LIST: `${API_BASE_URL}/events`,
    DETAIL: (id) => `${API_BASE_URL}/events/${id}`,
    CREATE: `${API_BASE_URL}/events`,
    UPDATE: (id) => `${API_BASE_URL}/events/${id}`,
    DELETE: (id) => `${API_BASE_URL}/events/${id}`,
    GET_IMAGE: (id) => `${API_BASE_URL}/events/${id}/image`,
  },
  
  BOOKINGS: {
    LIST: `${API_BASE_URL}/bookings`,
    MY_BOOKINGS: `${API_BASE_URL}/bookings/my-bookings`,
    CREATE: `${API_BASE_URL}/bookings`,
  }
}; 