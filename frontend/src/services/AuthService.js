import { api } from './api';

const AUTH_URL = '/auth';

export async function login(email, password) {
  return api.post(`${AUTH_URL}/login`, { email, password });
}

export async function register(email, password, fullName, role) {
  return api.post(`${AUTH_URL}/register`, { email, password, fullName, role });
}

export async function createStaff(email, password, fullName, role) {
  return api.post(`${AUTH_URL}/create-staff`, { email, password, fullName, role });
}
