import type { Airport, GuessFeedback } from '@/types/wordle';

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function computeBearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function getFlightDirection(depLon: number, arrLon: number): string {
  const diff = ((arrLon - depLon + 540) % 360) - 180;
  if (diff > 0) return 'Eastbound';
  if (diff < 0) return 'Westbound';
  return 'North/South';
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const CONTINENT_NAMES: Record<string, string> = {
  AF: 'Africa',
  AN: 'Antarctica',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  OC: 'Oceania',
  SA: 'South America',
};

export function continentName(code: string): string {
  return CONTINENT_NAMES[code] || code;
}

export function computeFeedback(guessed: Airport, correct: Airport): GuessFeedback {
  const isCorrect = guessed.iata === correct.iata;
  return {
    iata: guessed.iata,
    correct: isCorrect,
    distanceKm: isCorrect
      ? 0
      : haversineDistance(guessed.latitude, guessed.longitude, correct.latitude, correct.longitude),
    bearing: isCorrect
      ? 0
      : computeBearing(guessed.latitude, guessed.longitude, correct.latitude, correct.longitude),
  };
}

export function distanceToEmoji(distanceKm: number, correct: boolean): string {
  if (correct) return '🟩';
  if (distanceKm < 500) return '🟨';
  if (distanceKm < 2000) return '🟧';
  return '🟥';
}

export function formatDistance(km: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    return Math.round(km * 0.621371).toLocaleString() + ' mi';
  }
  return km.toLocaleString() + ' km';
}
