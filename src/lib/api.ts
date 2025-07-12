import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SCHEDULE_API_URL = process.env.NEXT_PUBLIC_SCHEDULE_API_URL || 'http://localhost:3001/api/schedule';

const api = axios.create({ baseURL: API_BASE_URL });
const scheduleApi = axios.create({ baseURL: SCHEDULE_API_URL });

export async function getStats() {
  const { data } = await api.get('/stats');
  return data;
}

export async function getRoutes(params = {}) {
  const { data } = await api.get('/routes', { params });
  return data;
}

export async function getAirports(params = {}) {
  const { data } = await api.get('/airports', { params });
  return data;
}

export async function getAirlines() {
  try {
    const { data } = await api.get('/airlines');
    return data;
  } catch (error: any) {
    console.error('Failed to fetch airlines:', error);
    throw error;
  }
}

export async function getCountries() {
  const { data } = await api.get('/countries');
  return data;
}

export async function getAirportRoutes(iata: string, params = {}) {
  const { data } = await api.get(`/airports/${iata}/routes`, { params });
  return data;
}

export async function getCountryRoutes(country: string, params = {}) {
  const { data } = await api.get(`/countries/${encodeURIComponent(country)}/routes`, { params });
  return data;
}

export async function getAirlineRoutesExcludeBase(airline: string, baseAirport: string, params = {}) {
  const { data } = await api.get(`/airlines/${encodeURIComponent(airline)}/routes/exclude-base`, { 
    params: { base_airport: baseAirport, ...params } 
  });
  return data;
}

// Schedule API functions
export async function getScheduleAirlines() {
  const { data } = await scheduleApi.get('/airlines');
  return data;
}

export async function getScheduleAirline(id: number) {
  const { data } = await scheduleApi.get(`/airline/${id}`);
  return data;
}

export async function validateScheduleConfig(config: any) {
  const { data } = await scheduleApi.post('/validate', config);
  return data;
}

export async function generateSchedule(config: any) {
  try {
    const { data } = await scheduleApi.post('/generate', config);
    return data;
  } catch (error: any) {
    console.error('Schedule generation error:', error);
    throw error;
  }
}