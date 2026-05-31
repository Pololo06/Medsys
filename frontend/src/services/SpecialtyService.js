import { api } from './api';
const URL = '/specialties';
export const getSpecialties = () => api.get(URL);
export const createSpecialty = (name) => api.post(URL, { name });
