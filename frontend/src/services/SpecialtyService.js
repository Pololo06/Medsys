import { api } from './api';

const SPECIALTY_URL = '/specialties';

export async function getSpecialties() {
  return api.get(SPECIALTY_URL);
}
