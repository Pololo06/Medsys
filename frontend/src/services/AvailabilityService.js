import { api } from './api';

export async function getAvailabilitySlots(doctorId, date, durationMinutes) {
  return api.get(`/availability/doctors/${doctorId}`, { params: { date, durationMinutes } });
}
