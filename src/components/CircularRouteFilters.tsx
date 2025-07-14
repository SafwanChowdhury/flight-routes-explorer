"use client";

import { useState } from "react";
import { Filter, RefreshCw, Clock, Search } from "lucide-react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import SearchInput from "./SearchInput";
import AirlineSearchInput from "./AirlineSearchInput";

interface CircularRouteFiltersProps {
  onApplyFilters: () => void;
  onClearFilters: () => void;
  filters: {
    airline_name: string;
    airline_id: string;
    start_airport: string;
    pattern_type: string;
    max_duration: string;
    min_duration: string;
    limit: string;
    all: string;
    contains_airport: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      airline_name: string;
      airline_id: string;
      start_airport: string;
      pattern_type: string;
      max_duration: string;
      min_duration: string;
      limit: string;
      all: string;
      contains_airport: string;
    }>
  >;
  durationRange: [number, number];
  setDurationRange: React.Dispatch<React.SetStateAction<[number, number]>>;
}

// Duration range constants
const MIN_DURATION = 0;
const MAX_DURATION = 4320; // 3 days in minutes

export default function CircularRouteFilters({
  onApplyFilters,
  onClearFilters,
  filters,
  setFilters,
  durationRange,
  setDurationRange,
}: CircularRouteFiltersProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDurationRangeChange = (value: [number, number]) => {
    setDurationRange(value);
  };

  const handleAirportSelect = (result: any) => {
    setFilters((prev) => ({ ...prev, start_airport: result.iata }));
  };

  const handleContainsAirportSelect = (result: any) => {
    setFilters((prev) => ({ ...prev, contains_airport: result.iata }));
  };

  const handleAirlineSelect = (result: any) => {
    setFilters((prev) => ({
      ...prev,
      airline_name: result.name,
      airline_id: result.id?.toString() || "",
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
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Airline Selection */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Airline *
            </label>
            <AirlineSearchInput
              value={filters.airline_name}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, airline_name: value }))
              }
              placeholder="Search airline..."
              onSelect={handleAirlineSelect}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Required: Select an airline to search for circular routes
            </p>
          </div>

          {/* Start Airport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Airport (Optional)
            </label>
            <SearchInput
              value={filters.start_airport}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, start_airport: value }))
              }
              placeholder="Search airport..."
              onSelect={handleAirportSelect}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to search from all airports
            </p>
          </div>

          {/* Contains Airport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contains Airport (IATA or Name)
            </label>
            <SearchInput
              value={filters.contains_airport}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, contains_airport: value }))
              }
              placeholder="e.g. LHR or Heathrow"
              onSelect={handleContainsAirportSelect}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Show only routes that include this airport anywhere in the pattern
            </p>
          </div>

          {/* Pattern Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pattern Type
            </label>
            <select
              name="pattern_type"
              value={filters.pattern_type}
              onChange={handleInputChange}
              aria-label="Pattern type selection"
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="both">Both (Triangle & Arrow)</option>
              <option value="triangle">Triangle Only</option>
              <option value="arrow">Arrow Only</option>
            </select>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Results
            </label>
            <select
              name="limit"
              value={filters.limit}
              onChange={handleInputChange}
              aria-label="Maximum results selection"
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={filters.all === "true"}
            >
              <option value="10">10 results</option>
              <option value="20">20 results</option>
              <option value="50">50 results</option>
              <option value="100">100 results</option>
              <option value="200">200 results</option>
            </select>
          </div>

          {/* All Results Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Mode
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="all"
                  value="false"
                  checked={filters.all === "false"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">Limited Results</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="all"
                  value="true"
                  checked={filters.all === "true"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm">All Results</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {filters.all === "true"
                ? "Will return all available circular routes (may take longer)"
                : "Will return limited results for faster search"}
            </p>
          </div>
        </div>

        {/* Duration Range Slider and Inputs */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Route Duration Range (Optional)
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Filter by the total duration of the complete circular route (sum
              of all segments)
            </p>
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

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Routes
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
