"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plane,
  Calendar as CalendarIcon,
} from "lucide-react";
import { FlightLeg, DaySchedule } from "@/types/schedule";
import { getSchedule } from "@/lib/scheduleStorage";
import ScheduledFlightPopup from "./ScheduledFlightPopup";
import { Switch } from "@mui/material";

interface ScheduleCalendarProps {
  onDayScheduleChange?: (daySchedule: DaySchedule | null) => void;
  timezone?: "utc" | "local";
  setTimezone?: (tz: "utc" | "local") => void;
}

export default function ScheduleCalendar({
  onDayScheduleChange,
  timezone: propTimezone = "utc",
  setTimezone: propSetTimezone,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [flights, setFlights] = useState<FlightLeg[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightLeg | null>(null);
  const [currentDaySchedule, setCurrentDaySchedule] =
    useState<DaySchedule | null>(null);
  const [hourHeight, setHourHeight] = useState(60); // Height in pixels for each hour
  const [internalTimezone, setInternalTimezone] = useState<"utc" | "local">(
    propTimezone
  );
  const timezone = propTimezone ?? internalTimezone;
  const setTimezone = propSetTimezone ?? setInternalTimezone;
  const timeGridRef = useRef<HTMLDivElement>(null);

  // Load flights for the current day
  useEffect(() => {
    try {
      const cachedSchedule = getSchedule();
      if (!cachedSchedule) {
        setFlights([]);
        setCurrentDaySchedule(null);
        return;
      }

      // Format the date to match the API's date format (YYYY-MM-DD)
      const formattedDate = currentDate.toISOString().split("T")[0];

      // Find the day in the schedule that matches the requested date
      const daySchedule = cachedSchedule.schedule.days.find((day) =>
        day.date.startsWith(formattedDate)
      );

      if (!daySchedule) {
        setFlights([]);
        setCurrentDaySchedule(null);
        onDayScheduleChange?.(null);
      } else {
        // Sort flights by departure time
        const sortedFlights = [...daySchedule.legs].sort((a, b) => {
          return (
            new Date(a.departure_time).getTime() -
            new Date(b.departure_time).getTime()
          );
        });
        setFlights(sortedFlights);
        setCurrentDaySchedule(daySchedule);
        onDayScheduleChange?.(daySchedule);
      }
    } catch (error) {
      console.error("Error loading flights:", error);
      setFlights([]);
      setCurrentDaySchedule(null);
    }
  }, [currentDate]);

  useEffect(() => {
    if (flights.length > 0 && timeGridRef.current) {
      // Find the top position of the first flight
      const firstFlight = flights[0];
      const top = calculateTopPosition(firstFlight.departure_time);
      // Scroll so the first flight is about 40px from the top (or 0 if already near top)
      const offset = Math.max(top - 40, 0);
      timeGridRef.current.scrollTo({ top: offset, behavior: "smooth" });
    } else if (timeGridRef.current) {
      // Reset scroll if no flights
      timeGridRef.current.scrollTo({ top: 0 });
    }
  }, [flights, timezone, currentDate]);

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Format times in a readable way
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    if (timezone === "utc") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      });
    } else {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  };

  // Format duration as hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get the day header text
  const getDayHeader = () => {
    return currentDate.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate top position in pixels based on time
  const calculateTopPosition = (timeString: string) => {
    const date = new Date(timeString);
    let hours, minutes;
    if (timezone === "utc") {
      hours = date.getUTCHours();
      minutes = date.getUTCMinutes();
    } else {
      hours = date.getHours();
      minutes = date.getMinutes();
    }
    return hours * hourHeight + (minutes / 60) * hourHeight;
  };

  // Calculate height in pixels based on duration
  const calculateHeightFromDuration = (durationMinutes: number) => {
    // Convert duration minutes to pixels
    return (durationMinutes / 60) * hourHeight;
  };

  // Generate hour markers
  const renderHourMarkers = () => {
    return Array.from({ length: 24 }).map((_, hour) => (
      <div
        key={hour}
        className="flex border-t border-gray-200 dark:border-gray-700"
        style={{ height: `${hourHeight}px` }}
      >
        <div className="w-16 pr-2 text-right text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          {timezone === "utc"
            ? `${hour.toString().padStart(2, "0")}:00`
            : new Date(0, 0, 0, hour).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
        </div>
        <div className="flex-grow"></div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Calendar View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {/* Timezone Toggle */}
        {/* (Removed toggle UI from here; now only in parent) */}
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Previous day"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{getDayHeader()}</span>
          </h2>

          <button
            onClick={goToNextDay}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Next day"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Flight count and summary */}
        <div className="mb-4 px-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {flights.length === 0
              ? "No flights scheduled for this day"
              : `${flights.length} flight${
                  flights.length > 1 ? "s" : ""
                } scheduled`}
          </p>
        </div>

        {/* Time Grid */}
        <div
          className="relative border-t border-l border-gray-200 dark:border-gray-700 overflow-y-auto h-[600px]"
          ref={timeGridRef}
        >
          <div className="relative flex">
            {/* Time markers on the left */}
            <div className="sticky left-0 z-10 bg-white dark:bg-gray-800">
              {renderHourMarkers()}
            </div>

            {/* Flight items overlay */}
            <div className="absolute top-0 left-16 right-0 h-full">
              {flights.map((flight, index) => {
                const top = calculateTopPosition(flight.departure_time);
                const height = calculateHeightFromDuration(flight.duration_min);

                return (
                  <div
                    key={index}
                    className="absolute ml-2 p-2 rounded-md border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 
                      shadow hover:shadow-md transition cursor-pointer"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      width: "calc(100% - 16px)",
                    }}
                    onClick={() => setSelectedFlight(flight)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {flight.departure_airport} → {flight.arrival_airport}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(flight.duration_min)}
                      </div>
                    </div>

                    <div className="mt-1 flex items-center text-xs text-gray-600 dark:text-gray-300">
                      <Plane className="w-3 h-3 mr-1" />
                      {flight.airline_name || "N/A"}
                    </div>

                    <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatTime(flight.departure_time)}</span>
                      <span>{formatTime(flight.arrival_time)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Flight Detail Popup */}
        {selectedFlight && (
          <ScheduledFlightPopup
            flight={selectedFlight}
            onClose={() => setSelectedFlight(null)}
          />
        )}
      </div>
    </div>
  );
}
