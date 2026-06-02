import { api } from './api';
import { DAY_MAP, DAY_MAP_REVERSE, DAYS } from '../constants';

export async function getDoctorSchedule(doctorId) {
  const data = await api.get(`/doctors/${doctorId}/schedules`);
  const result = {};
  DAYS.forEach(d => { result[d] = []; });
  for (const slot of data) {
    const dayKey = DAY_MAP_REVERSE[slot.day];
    if (dayKey) {
      result[dayKey].push({ id: slot.id, startTime: slot.startTime, endTime: slot.endTime });
    }
  }
  DAYS.forEach(key => {
    result[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });
  return result;
}

export async function createDoctorSchedule(doctorId, day, startTime, endTime) {
  return await api.post(`/doctors/${doctorId}/schedules`, {
    day: DAY_MAP[day],
    startTime,
    endTime,
  });
}
