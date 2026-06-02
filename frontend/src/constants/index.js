export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST'
};

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  DOCTORS: '/doctores',
  PATIENTS: '/pacientes',
  CATALOG: '/catalogo',
  APPOINTMENTS: '/citas',
  OFFICES: '/consultorios',
  AVAILABILITY: '/disponibilidad',
  REPORTS: '/reportes'
};

export const TOAST_CONFIG = {
  duration: 3000,
  position: 'top-right'
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50]
};

export const DEBOUNCE_MS = {
  SEARCH: 300,
  AUTOSAVE: 1000
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  STORAGE_KEY: 'medsys-theme'
};

export const SIDEBAR = {
  STORAGE_KEY: 'medsys-sidebar'
};

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  CONFLICT: 409
};

export const STATUS_MAP = {
  SCHEDULED: { badge: 'badge-blue', label: 'Programada' },
  CONFIRMED: { badge: 'badge-teal', label: 'Confirmada' },
  COMPLETED: { badge: 'badge-violet', label: 'Completada' },
  CANCELLED: { badge: 'badge-red', label: 'Cancelada' },
  NO_SHOW: { badge: 'badge-amber', label: 'No asistió' }
};

export const PATIENT_STATUS_MAP = {
  ACTIVE: { badge: 'badge-teal', label: 'Activo' },
  INACTIVE: { badge: 'badge-gray', label: 'Inactivo' }
};

export const OFFICE_STATUS_OPTS = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'OCCUPIED', label: 'Ocupado' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' }
];

export const DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export const DAY_MAP = {
  LUN: 'MONDAY',
  MAR: 'TUESDAY',
  'MIÉ': 'WEDNESDAY',
  JUE: 'THURSDAY',
  VIE: 'FRIDAY',
  'SÁB': 'SATURDAY'
};

export const DAY_MAP_REVERSE = {
  MONDAY: 'LUN',
  TUESDAY: 'MAR',
  WEDNESDAY: 'MIÉ',
  THURSDAY: 'JUE',
  FRIDAY: 'VIE',
  SATURDAY: 'SÁB'
};

export const ROLE_LABEL = {
  ADMIN: 'Administrador',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Recepcionista'
};

export const ROLE_COLOR = {
  ADMIN: '#f97316',
  DOCTOR: '#3b9df5',
  RECEPTIONIST: '#22c55e'
};
