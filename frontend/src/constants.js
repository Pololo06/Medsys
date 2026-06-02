export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST'
};

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  CONFLICT: 409
};

export const TOAST_DURATION = 3500;
export const DEBOUNCE_DELAY = 300;
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
