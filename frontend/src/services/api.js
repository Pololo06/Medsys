import { API_CONFIG, HTTP_STATUS } from '../constants';

const USER_KEY = 'medsys_user';

const ERROR_MESSAGES = {
  400: 'Solicitud inválida. Verifique los datos.',
  401: 'Sesión expirada. Inicie sesión nuevamente.',
  403: 'No tiene permisos para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Conflicto: el registro ya existe.',
  422: 'Los datos enviados no son válidos.',
  500: 'Error del servidor. Intente más tarde.',
  NETWORK: 'Sin conexión. Verifique su red.',
  TIMEOUT: 'La solicitud tardó demasiado. Intente nuevamente.',
  INVALID_JSON: 'Respuesta inesperada del servidor.'
};

function getToken() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw).accessToken : null;
  } catch {
    return null;
  }
}

function buildUrl(endpoint, params) {
  if (!params) return endpoint;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `${endpoint}?${qs}` : endpoint;
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = buildUrl(endpoint, options.params);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const fetchOptions = { method: options.method, headers, signal: controller.signal };
  if (options.body) fetchOptions.body = options.body;

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, fetchOptions);
    clearTimeout(timeoutId);

    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      localStorage.removeItem(USER_KEY);
      window.location.href = '/login';
      throw new Error(ERROR_MESSAGES[401]);
    }

    if (response.status === 204) return null;

    let data;
    try {
      data = await response.json();
    } catch {
      if (!response.ok) throw new Error(ERROR_MESSAGES[response.status] || `Error ${response.status}`);
      return null;
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || ERROR_MESSAGES[response.status] || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT);
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(ERROR_MESSAGES.NETWORK);
    }
    if (error.message?.includes('Unexpected token') || error.message?.includes('JSON')) {
      throw new Error(ERROR_MESSAGES.INVALID_JSON);
    }
    throw error;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};
