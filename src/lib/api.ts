import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL });

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
  const { data } = await api.get('/airlines');
  return data;
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