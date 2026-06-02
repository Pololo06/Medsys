import { api } from './api';

const URL = '/patients';

export const createPatient = (fullName, email, phone) => api.post(URL, { fullName, email, phone });
export const getPatientById = (id) => api.get(`${URL}/${id}`);
export const getAllPatients = () => api.get(URL);
export const updatePatient = (id, fullName, email, phone, status) => api.put(`${URL}/${id}`, { fullName, email, phone, status });
