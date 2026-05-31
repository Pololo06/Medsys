import { api } from './api';
const URL = '/offices';
export const createOffice = (name, location) => api.post(URL, { name, location });
export const getOffices = () => api.get(URL);
export const getOfficeById = (id) => api.get(`${URL}/${id}`);
export const updateOffice = (id, name, location, status) => api.put(`${URL}/${id}`, { name, location, status });
