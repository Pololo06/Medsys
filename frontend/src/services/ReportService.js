import { api } from './api';

const URL = '/reports';

export const getDoctorProductivity = () => api.get(`${URL}/doctor-productivity`);
export const getNoShowPatients = (from, to) => api.get(`${URL}/no-show-patients`, { params: { from, to } });
export const getOfficeOccupancy = (from, to) => api.get(`${URL}/office-occupancy`, { params: { from, to } });
