const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('incognichat_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Public APIs
export const publicAPI = {
  generateName: async () => {
    const res = await fetch(`${API_BASE}/generate-name`);
    return handleResponse(res);
  }
};

// Admin APIs
export const adminAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/admin/analytics`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getOnlineUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/online-users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getKickedUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/kicked-users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  kickUser: async (socketId, reason) => {
    const res = await fetch(`${API_BASE}/admin/kick/${socketId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  unkickUser: async (username) => {
    const res = await fetch(`${API_BASE}/admin/unkick/${username}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  clearMessages: async () => {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
