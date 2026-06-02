import { api } from './api';

const URL = '/appointment-types';

export const getAppointmentTypes = () => api.get(URL);
export const createAppointmentType = (name, durationMinutes) => api.post(URL, { name, durationMinutes });
export const deleteAppointmentType = (id) => api.delete(`${URL}/${id}`);
