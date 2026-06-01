import { api } from './api';

const SCHEDULE_URL = '/schedules';

export async function getSchedules() {
  return api.get(SCHEDULE_URL);
}
