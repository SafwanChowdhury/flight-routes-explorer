"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, RefreshCw, Clock } from "lucide-react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

interface RouteFiltersProps {
  onApplyFilters: () => void;
  onClearFilters: () => void;
  filters: {
    airline_name: string;
    departure_iata: string;
    arrival_iata: string;
    departure_country: string;
    arrival_country: string;
    max_duration: string;
    min_duration: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      airline_name: string;
      departure_iata: string;
      arrival_iata: string;
      departure_country: string;
      arrival_country: string;
      max_duration: string;
      min_duration: string;
    }>
  >;
  durationRange: [number, number];
  setDurationRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  biDirectionalMessage: string | null;
}

// Duration range constants
const MIN_DURATION = 0;
const MAX_DURATION = 1440; // 24 hours in minutes

export default function RouteFilters({
  onApplyFilters,
  onClearFilters,
  filters,
  setFilters,
  durationRange,
  setDurationRange,
  biDirectionalMessage,
}: RouteFiltersProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle duration range slider change
  const handleDurationRangeChange = (range: number[]) => {
    setDurationRange(range as [number, number]);
    setFilters((prev) => ({
      ...prev,
      min_duration: range[0].toString(),
      max_duration: range[1].toString(),
    }));
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div>
      {/* Bi-directional filter message */}
      {biDirectionalMessage && (
        <div className="p-4 mb-4 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md flex justify-between items-center">
          <span>{biDirectionalMessage}</span>
          <button
            onClick={onClearFilters}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Airline
            </label>
            <input
              type="text"
              name="airline_name"
              value={filters.airline_name}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. British Airways"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From (IATA)
            </label>
            <input
              type="text"
              name="departure_iata"
              value={filters.departure_iata}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. LHR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To (IATA)
            </label>
            <input
              type="text"
              name="arrival_iata"
              value={filters.arrival_iata}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. JFK"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Country
            </label>
            <input
              type="text"
              name="departure_country"
              value={filters.departure_country}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. United Kingdom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Country
            </label>
            <input
              type="text"
              name="arrival_country"
              value={filters.arrival_country}
              onChange={handleInputChange}
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. United States"
            />
          </div>
        </div>

        {/* Duration Range Slider and Inputs */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Flight Duration Range
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            {/* Text inputs for duration */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Duration ({formatDuration(durationRange[0])})
                </label>
                <input
                  type="number"
                  name="min_duration"
                  value={durationRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (
                      !isNaN(value) &&
                      value >= MIN_DURATION &&
                      value <= durationRange[1]
                    ) {
                      handleDurationRangeChange([value, durationRange[1]]);
                    }
                  }}
                  className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Minutes"
                  min={MIN_DURATION}
                  max={durationRange[1]}
                />
              </div>

              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Duration ({formatDuration(durationRange[1])})
                </label>
                <input
                  type="number"
                  name="max_duration"
                  value={durationRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (
                      !isNaN(value) &&
                      value <= MAX_DURATION &&
                      value >= durationRange[0]
                    ) {
                      handleDurationRangeChange([durationRange[0], value]);
                    }
                  }}
                  className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Minutes"
                  min={durationRange[0]}
                  max={MAX_DURATION}
                />
              </div>
            </div>

            {/* Range Slider Component */}
            <div className="py-2">
              <RangeSlider
                min={MIN_DURATION}
                max={MAX_DURATION}
                step={5}
                value={durationRange}
                onInput={handleDurationRangeChange}
                className="custom-range-slider"
              />
            </div>

            {/* Duration markers */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
              <span>18h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex space-x-3">
          <button
            onClick={onApplyFilters}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded transition"
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>

          <button
            onClick={onClearFilters}
            className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Custom CSS for the range slider */}
      <style jsx global>{`
        .custom-range-slider .range-slider {
          height: 6px;
          background: #e5e7eb;
          border-radius: 4px;
        }

        .dark .custom-range-slider .range-slider {
          background: #4b5563;
        }

        .custom-range-slider .range-slider__range {
          background: #3b82f6;
          border-radius: 4px;
        }

        .custom-range-slider .range-slider__thumb {
          background: white;
          border: 2px solid #3b82f6;
          width: 16px;
          height: 16px;
        }

        .dark .custom-range-slider .range-slider__thumb {
          background: #1f2937;
        }

        .custom-range-slider .range-slider__thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
