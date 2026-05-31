import { api } from './api';

const APPOINTMENT_URL = '/appointments';

export async function createAppointment(data) {
  return api.post(APPOINTMENT_URL, data);
}
export async function getAppointmentById(id) {
  return api.get(`${APPOINTMENT_URL}/${id}`);
}
export async function getAppointments() {
  return api.get(APPOINTMENT_URL);
}
export async function confirmAppointment(id) {
  return api.patch(`${APPOINTMENT_URL}/${id}/confirm`);
}
export async function cancelAppointment(id, reason) {
  return api.patch(`${APPOINTMENT_URL}/${id}/cancel`, { reason });
}
export async function completeAppointment(id, notes) {
  return api.patch(`${APPOINTMENT_URL}/${id}/complete`, { notes });
}
export async function setAsNoShowAppointment(id) {
  return api.patch(`${APPOINTMENT_URL}/${id}/no-show`);
}
