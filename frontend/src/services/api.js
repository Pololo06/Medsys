const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const USER_KEY = 'medsys_user';

function getToken() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw).accessToken : null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 401 → clear session and redirect to login
  if (response.status === 401) {
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
  }

  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Error ${response.status}`);
  }

  return data;
}

export const api = {
  get:   (endpoint)        => request(endpoint, { method: 'GET' }),
  post:  (endpoint, body)  => request(endpoint, { method: 'POST',  body: JSON.stringify(body) }),
  put:   (endpoint, body)  => request(endpoint, { method: 'PUT',   body: body ? JSON.stringify(body) : undefined }),
  patch: (endpoint, body)  => request(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete:(endpoint)        => request(endpoint, { method: 'DELETE' }),
};
