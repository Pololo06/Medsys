import { api } from './api';
const URL = '/doctor-schedules';
export const getSchedules = () => api.get(URL);
export const createSchedule = (data) => api.post(URL, data);
