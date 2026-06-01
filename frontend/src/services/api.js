import { HTTP_STATUS, API_BASE_URL } from '../constants';

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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
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
      const errorMessage = data?.message || data?.error;
      if (response.status === HTTP_STATUS.NOT_FOUND) {
        throw new Error('Recurso no encontrado.');
      }
      if (response.status >= HTTP_STATUS.SERVER_ERROR) {
        throw new Error('Error del servidor. Por favor intenta más tarde.');
      }
      throw new Error(errorMessage || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    throw error;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
