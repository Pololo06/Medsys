import { api } from './api';

const URL = '/doctors';

export const createDoctor = (fullName, specialtyId) => api.post(URL, { fullName, specialtyId });
export const getDoctorById = (id) => api.get(`${URL}/${id}`);
export const getAllDoctors = () => api.get(URL);
export const updateDoctor = (id, fullName, active) => api.put(`${URL}/${id}`, { fullName, active });
export const findActiveBySpecialty = (specialtyId) => api.get(`${URL}/specialty/${specialtyId}/active`);
