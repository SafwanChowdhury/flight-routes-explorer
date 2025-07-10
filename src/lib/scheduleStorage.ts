import { CachedSchedule, GeneratedSchedule } from '@/types/schedule';

const SCHEDULE_STORAGE_KEY = 'flight_schedule';

// Calculate expiration date based on schedule days + 1 day
function calculateExpirationDate(days: number): string {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days + 1);
  return expirationDate.toISOString();
}

// Save schedule to localStorage
export function saveSchedule(schedule: GeneratedSchedule): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cachedSchedule: CachedSchedule = {
      schedule,
      createdAt: new Date().toISOString(),
      expiresAt: calculateExpirationDate(schedule.days.length),
      days: schedule.days.length
    };
    
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(cachedSchedule));
  } catch (error) {
    console.error('Failed to save schedule to localStorage:', error);
    throw new Error('Failed to save schedule. Please check your browser storage settings.');
  }
}

// Get schedule from localStorage
export function getSchedule(): CachedSchedule | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!storedSchedule) return null;
    
    const cachedSchedule: CachedSchedule = JSON.parse(storedSchedule);
    
    // Validate the cached schedule structure
    if (!cachedSchedule.schedule || !cachedSchedule.schedule.days) {
      console.error('Invalid schedule structure in localStorage');
      return null;
    }
    
    return cachedSchedule;
  } catch (error) {
    console.error('Error parsing stored schedule:', error);
    return null;
  }
}

// Check if the stored schedule is valid (not expired)
export function isScheduleValid(): boolean {
  const cachedSchedule = getSchedule();
  if (!cachedSchedule) return false;
  
  const now = new Date();
  const expirationDate = new Date(cachedSchedule.expiresAt);
  
  return now < expirationDate;
}

// Clear schedule from localStorage
export function clearSchedule(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SCHEDULE_STORAGE_KEY);
}

// Get scheduled flights for a specific day
export function getFlightsForDay(date: Date): any[] {
  const cachedSchedule = getSchedule();
  if (!cachedSchedule) return [];
  
  // Format the date to match the API's date format (YYYY-MM-DD)
  const formattedDate = date.toISOString().split('T')[0];
  
  // Find the day in the schedule that matches the requested date
  const daySchedule = cachedSchedule.schedule.days.find(day => 
    day.date.startsWith(formattedDate)
  );
  
  if (!daySchedule) return [];
  return daySchedule.legs;
}