export interface HaulPreferences {
    short: boolean;
    medium: boolean;
    long: boolean;
  }
  
  export interface HaulWeighting {
    short: number;
    medium: number;
    long: number;
  }
  
  export interface OperatingHours {
    start: string;
    end: string;
  }
  
  export interface ScheduleConfig {
    airline_id: number;
    airline_name: string;
    airline_iata?: string;
    start_airport: string;
    days: number;
    haul_preferences: HaulPreferences;
    haul_weighting: HaulWeighting;
    prefer_single_leg_day_ratio: number;
    operating_hours: OperatingHours;
    minimum_rest_hours_between_long_haul: number;
    repetition_mode: boolean;
  }
  
  export interface FlightLeg {
    departure_airport: string;
    arrival_airport: string;
    departure_time: string;
    arrival_time: string;
    haul_type: 'short' | 'medium' | 'long';
    duration_min: number;
    route_id: number;
    departure_city?: string;
    departure_country?: string;
    arrival_city?: string;
    arrival_country?: string;
    airline_iata?: string;
    airline_name?: string;
    distance_km?: number;
  }

  export interface FlightBlock {
    origin_airport: string;
    legs: FlightLeg[];
    is_complete: boolean;
    block_type: 'simple' | 'multi-stop';
  }

  export interface IncompleteBlock {
    origin_airport: string;
    completed_legs: FlightLeg[];
    remaining_route: string[];
    block_type: 'simple' | 'multi-stop';
  }
  
  export interface DaySchedule {
    day: number;
    date: string;
    legs: FlightLeg[];
    overnight_location: string;
    notes: string[];
    completed_blocks: FlightBlock[];
    incomplete_block?: IncompleteBlock;
  }
  
  export interface GeneratedSchedule {
    id: string;
    name: string;
    created_at: string;
    config: ScheduleConfig;
    days: DaySchedule[];
  }
  
  export interface CachedSchedule {
    schedule: GeneratedSchedule;
    createdAt: string;
    expiresAt: string;
    days: number;
  }