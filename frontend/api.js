// frontend/api.js - PrepLoop REST API Client for Phase 2 Backend
const PrepAPI = (function () {
  const BASE_URL = typeof window !== 'undefined' && window.location.port === '5000'
    ? '/api'
    : 'http://localhost:5000/api';
  const TOKEN_KEY = 'prepLoop.jwt_token';

  // Helper for Bearer Token
  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // Generic request wrapper with auth header & error handling
  async function request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.warn(`[PrepAPI] ${endpoint} failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Check if backend server is live
  async function isBackendOnline() {
    try {
      const url = typeof window !== 'undefined' && window.location.port === '5000'
        ? '/api/scheduler/slots'
        : 'http://localhost:5000/api/scheduler/slots';
      const res = await fetch(url, { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // 1. Authentication Endpoints
  const auth = {
    async register(userData) {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (res.success && res.data.token) {
        setToken(res.data.token);
      }
      return res;
    },

    async login(credentials) {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (res.success && res.data.token) {
        setToken(res.data.token);
      }
      return res;
    },

    async googleAuth(profileData) {
      const res = await request('/auth/google', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
      if (res.success && res.data.token) {
        setToken(res.data.token);
      }
      return res;
    },

    async getMe() {
      return await request('/auth/me', { method: 'GET' });
    },

    logout() {
      setToken('');
    }
  };

  // 2. Questions / Spaced Repetition Endpoints
  const questions = {
    async getAll() {
      return await request('/questions', { method: 'GET' });
    },

    async add(questionData) {
      return await request('/questions', {
        method: 'POST',
        body: JSON.stringify(questionData)
      });
    },

    async delete(id) {
      return await request(`/questions/${id}`, { method: 'DELETE' });
    }
  };

  // 3. Scheduler Endpoints
  const scheduler = {
    async getSlots() {
      return await request('/scheduler/slots', { method: 'GET' });
    },

    async createSlot(slotData) {
      return await request('/scheduler/slots', {
        method: 'POST',
        body: JSON.stringify(slotData)
      });
    },

    async getBookings() {
      return await request('/scheduler/bookings', { method: 'GET' });
    },

    async bookSlot(slotId, requesterName) {
      return await request('/scheduler/bookings', {
        method: 'POST',
        body: JSON.stringify({ slotId, requesterName })
      });
    },

    async submitFeedback(bookingId, feedbackData) {
      return await request(`/scheduler/bookings/${bookingId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedbackData)
      });
    }
  };

  return {
    isBackendOnline,
    getToken,
    setToken,
    auth,
    questions,
    scheduler
  };
})();

if (typeof window !== 'undefined') {
  window.PrepAPI = PrepAPI;
}