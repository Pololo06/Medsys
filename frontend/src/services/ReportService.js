import { api } from './api';
const URL = '/reports';
export const getDoctorProductivity = () => api.get(`${URL}/doctor-productivity`);
export const getNoShowPatients = () => api.get(`${URL}/no-show-patients`);
export const getOfficeOccupancy = () => api.get(`${URL}/office-occupancy`);
