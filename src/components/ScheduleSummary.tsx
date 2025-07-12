"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Plane,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { GeneratedSchedule } from "@/types/schedule";

interface ScheduleSummaryProps {
  schedule: GeneratedSchedule;
}

export default function ScheduleSummary({ schedule }: ScheduleSummaryProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate total statistics
  const totalFlights = schedule.days.reduce(
    (total, day) => total + day.legs.length,
    0
  );
  const totalDuration = schedule.days.reduce(
    (total, day) =>
      total +
      day.legs.reduce((dayTotal, leg) => dayTotal + leg.duration_min, 0),
    0
  );
  const totalDistance = schedule.days.reduce(
    (total, day) =>
      total +
      day.legs.reduce((dayTotal, leg) => dayTotal + (leg.distance_km || 0), 0),
    0
  );
  const totalCompletedBlocks = schedule.days.reduce(
    (total, day) => total + day.completed_blocks.length,
    0
  );
  const totalIncompleteBlocks = schedule.days.reduce(
    (total, day) => total + (day.incomplete_block ? 1 : 0),
    0
  );
  const totalNotes = schedule.days.reduce(
    (total, day) => total + day.notes.length,
    0
  );

  // Get unique airports visited
  const visitedAirports = new Set<string>();
  schedule.days.forEach((day) => {
    day.legs.forEach((leg) => {
      visitedAirports.add(leg.departure_airport);
      visitedAirports.add(leg.arrival_airport);
    });
  });

  // Get haul type distribution
  const haulTypeCounts = schedule.days.reduce((counts, day) => {
    day.legs.forEach((leg) => {
      counts[leg.haul_type] = (counts[leg.haul_type] || 0) + 1;
    });
    return counts;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Schedule Summary
        </h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
          title={showDetails ? "Hide details" : "Show details"}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Basic Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {schedule.days.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Plane className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {totalFlights}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Flights
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {formatDuration(totalDuration)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Time
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {visitedAirports.size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Airports
          </div>
        </div>
      </div>

      {/* Flight Blocks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Completed Blocks
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalCompletedBlocks}
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Incomplete Blocks
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {totalIncompleteBlocks}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Notes
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalNotes}
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Detailed Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Haul Type Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Flight Types
              </h4>
              <div className="space-y-2">
                {Object.entries(haulTypeCounts).map(([haulType, count]) => (
                  <div
                    key={haulType}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {haulType}-haul
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {count} flights
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distance Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Distance Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Distance
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {totalDistance.toLocaleString()} km
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Average per Flight
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {totalFlights > 0
                      ? Math.round(
                          totalDistance / totalFlights
                        ).toLocaleString()
                      : 0}{" "}
                    km
                  </span>
                </div>
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Configuration
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Airline:
                  </span>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {schedule.config.airline_name}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Base Airport:
                  </span>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {schedule.config.start_airport}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Operating Hours:
                  </span>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {schedule.config.operating_hours.start} -{" "}
                    {schedule.config.operating_hours.end}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Min Rest (Long Haul):
                  </span>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {schedule.config.minimum_rest_hours_between_long_haul} hr
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
