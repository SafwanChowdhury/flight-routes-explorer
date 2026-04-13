export interface Airport {
  iata: string;
  name: string;
  city_name: string;
  country: string;
  continent: string;
  latitude: number;
  longitude: number;
}

export interface RouteAnswer {
  departure_iata: string;
  arrival_iata: string;
  departure_city: string;
  arrival_city: string;
  departure_country: string;
  arrival_country: string;
  duration_min: number;
  airline_name: string;
}

export interface AnswerData {
  route: RouteAnswer;
  departure: Airport;
  arrival: Airport;
}

export interface GuessFeedback {
  iata: string;
  correct: boolean;
  distanceKm: number;
  bearing: number; // 0–360°, bearing from guessed airport toward correct airport
}

export interface GuessAttempt {
  departureIata: string;
  arrivalIata: string;
  depFeedback: GuessFeedback;
  arrFeedback: GuessFeedback;
}

export type GameStatus = 'loading' | 'playing' | 'won' | 'lost' | 'error';

export interface PersistedState {
  guesses: GuessAttempt[];
  status: GameStatus;
  lockedDep: string | null;
  lockedArr: string | null;
  route: RouteAnswer;
  depIata: string;
  arrIata: string;
}
