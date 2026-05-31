import { api } from './api';

// GET /api/availability/doctors/{doctorId}?date=YYYY-MM-DD&durationMinutes=N
export async function getAvailabilitySlots(doctorId, date, durationMinutes) {
  return api.get(`/availability/doctors/${doctorId}?date=${date}&durationMinutes=${durationMinutes}`);
}
